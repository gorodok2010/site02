window.AM = window.AM || {};

// The ONLY module that calls fetch(). Timeouts, typed errors and response-shape
// validation live here so no other file has to reason about the network.
//
// CORS DEPLOYMENT PREREQUISITE: the n8n webhook must answer the OPTIONS preflight
// with `Access-Control-Allow-Origin` set to the exact live site origin (no trailing
// slash, no path). n8n sends no CORS headers by default; without them every checkout
// POST fails before it is sent and the user can only reach us by phone.

AM.api = (function () {
  const CFG = AM.CONFIG;

  class ApiError extends Error {
    constructor(kind, message, detail) {
      super(message);
      this.name = 'ApiError';
      this.kind = kind; // 'timeout' | 'network' | 'http' | 'parse' | 'shape'
      this.detail = detail || null;
    }
  }

  // AbortController, not Promise.race: race leaks the underlying request and fills
  // the console with abort noise.
  async function request(url, options) {
    const opts = options || {};
    const controller = new AbortController();
    const timer = window.setTimeout(function () { controller.abort(); }, opts.timeoutMs || CFG.timeoutMs);

    let response;
    try {
      response = await window.fetch(url, {
        method: opts.method || 'GET',
        headers: opts.headers || undefined,
        body: opts.body || undefined,
        signal: controller.signal
      });
    } catch (err) {
      if (err && err.name === 'AbortError') {
        throw new ApiError('timeout', 'Request timed out after ' + (opts.timeoutMs || CFG.timeoutMs) + 'ms');
      }
      throw new ApiError('network', 'Network request failed', err);
    } finally {
      window.clearTimeout(timer);
    }

    if (response.status === 429) {
      throw new ApiError('http', 'Too many requests', { status: 429 });
    }
    if (!response.ok) {
      throw new ApiError('http', 'HTTP ' + response.status, { status: response.status });
    }
    return response;
  }

  function buildUrl(base, params) {
    const parts = [];
    Object.keys(params).forEach(function (k) {
      const v = params[k];
      if (v === undefined || v === null || v === '') return;
      parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(v)));
    });
    return base + (base.indexOf('?') === -1 ? '?' : '&') + parts.join('&');
  }

  async function getJson(url) {
    const response = await request(url);
    try {
      return await response.json();
    } catch (err) {
      throw new ApiError('parse', 'Response was not valid JSON', err);
    }
  }

  // PocketBase returns { items, totalPages, ... }. Every page is fetched: truncating
  // at one page would silently hide part of the fleet.
  async function fetchAllPages(collection, query) {
    const items = [];
    let page = 1;
    let totalPages = 1;

    do {
      const params = Object.assign({ page: page, perPage: 200 }, query || {});
      const data = await getJson(buildUrl(CFG.pocketBaseUrl + '/api/collections/' + collection + '/records', params));
      if (!data || !Array.isArray(data.items)) {
        throw new ApiError('shape', 'Unexpected response shape from ' + collection);
      }
      for (let i = 0; i < data.items.length; i++) items.push(data.items[i]);
      totalPages = Number(data.totalPages) || 1;
      page += 1;
    } while (page <= totalPages && page <= 50);

    return items;
  }

  // Field names come from the live PocketBase collection, not from the original
  // brief: title / hourly_rate / deposit_amount / is_active.
  //
  // Descriptions are kept as two separate fields rather than one translated blob, so an
  // admin edits them side by side. Both are carried through and resolved per language at
  // render time, because the customer can switch language after the catalogue loaded.
  function normalizeScooter(raw) {
    const image = Array.isArray(raw.image) ? raw.image[0] : raw.image;
    return {
      id: String(raw.id),
      name: String(raw.title || ''),
      descriptionFr: stripHtml(raw.description_fr),
      descriptionEn: stripHtml(raw.description_en),
      image: image ? (CFG.pocketBaseUrl + '/api/files/scooters/' + raw.id + '/' + encodeURIComponent(image)) : '',
      category: raw.category === 'wheelchair' ? 'wheelchair' : 'scooter',
      autonomie: toNumber(raw.autonomie),
      poidsMax: toNumber(raw.poids_max),
      pliant: raw.pliant === true || raw.pliant === 1 || raw.pliant === 'true',
      pricePerHour: toNumber(raw.hourly_rate),
      caution: toNumber(raw.deposit_amount),
      minHours: toNumber(raw.min_hours),
      isActive: raw.is_active === true || raw.is_active === 1 || raw.is_active === 'true'
    };
  }

  // `description_fr` / `description_en` hold HTML authored in the admin UI. innerHTML is
  // forbidden project-wide, so the markup is parsed into inert nodes and only the text
  // is kept.
  function stripHtml(value) {
    if (!value) return '';
    // Block boundaries become spaces before parsing. textContent concatenates sibling
    // blocks with no separator at all, so "<p>One</p><p>Two</p>" would otherwise read
    // "OneTwo", and admins do paste more than one paragraph.
    const marked = String(value)
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/(p|div|li|h[1-6]|tr|blockquote|section)>/gi, ' $&');
    const holder = document.createElement('div');
    holder.innerHTML = marked; // never inserted into the live document
    return (holder.textContent || '').replace(/\s+/g, ' ').trim();
  }

  // Missing / null / non-numeric means "no deposit" — never NaN, never -1.
  function toNumber(v) {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  async function fetchCatalog() {
    const rows = await fetchAllPages('scooters', { sort: 'title' });
    return rows.map(normalizeScooter);
  }

  // Availability is read from the `public_bookings` VIEW, never from `bookings`
  // itself. The view exposes only vehicle + window, so no customer data can leak
  // even if the collection is misconfigured later.
  //
  // The server filter deliberately narrows on `end_datetime` ONLY. Measured on the
  // live view: PocketBase stores `start_datetime` with a space separator
  // ("2026-09-23 19:02:14.000Z") while toISOString() emits a T ("...T18:00:00Z").
  // Since space < T, `start_datetime < '<T-formatted>'` matches EVERY row of that
  // day regardless of time. The client-side overlap test below is authoritative and
  // removes the extras, so this is a narrowing optimisation, never the check itself.
  async function fetchBusyWindows(startUtc, endUtc) {
    const filter = "(end_datetime > '" + startUtc.toISOString() + "')";
    const rows = await fetchAllPages('public_bookings', { filter: filter });

    const windows = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const s = parseUtc(r.start_datetime);
      const e = parseUtc(r.end_datetime);
      if (s === null || e === null) continue;
      windows.push({ vehicleId: String(r.scooter || ''), start: s, end: e });
    }
    return windows;
  }

  // The view mixes formats: some rows end in `Z`, some do not. A datetime without a
  // zone is parsed as LOCAL time by the browser, which would shift a window by the
  // user's UTC offset and block the wrong slots. PocketBase emits UTC, so treat a
  // naive value as UTC instead.
  function parseUtc(value) {
    if (!value) return null;
    const raw = String(value).trim();
    const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);
    const iso = hasZone ? raw : raw.replace(' ', 'T') + 'Z';
    const t = Date.parse(iso);
    return Number.isFinite(t) ? t : null;
  }

  // Nominatim. One request per search: the usage policy forbids bulk or pre-warm calls.
  //
  // The search is bounded by `viewbox` around the commune the customer already chose.
  // That is the working way to keep free text inside the delivery area: `postalcode`
  // is rejected by Nominatim when combined with `q` (HTTP 400), and `city` alone does
  // not constrain the result set.
  function searchAddress(query, bounds, signal) {
    const url = buildUrl(CFG.nominatimUrl, {
      q: query,
      format: 'jsonv2',
      addressdetails: 1,
      limit: 6,
      countrycodes: CFG.addressCountryCode,
      accept_language: AM.i18n.get(),
      viewbox: bounds ? bounds.join(',') : '',
      bounded: bounds ? '1' : ''
    });
    return request(url, { signal: signal }).then(function (r) { return r.json(); });
  }

  async function postBooking(payload) {
    const response = await request(CFG.n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Booking-Client': 'amiscoot-frontend-v1'
      },
      body: JSON.stringify(payload),
      timeoutMs: 15000 // payment session creation is slower than a catalog read
    });

    const text = await response.text();
    const url = extractCheckoutUrl(text);
    if (!url) throw new ApiError('shape', 'Webhook did not return a checkout URL', { body: text.slice(0, 200) });
    return url;
  }

  // The workflow may answer with a bare URL or with JSON. Anything else is a failure:
  // redirecting the customer to a non-URL response is never correct.
  function extractCheckoutUrl(text) {
    const trimmed = String(text || '').trim();
    if (/^https:\/\/\S+$/.test(trimmed)) return trimmed;
    let parsed = null;
    try { parsed = JSON.parse(trimmed); } catch (e) { return null; }
    if (!parsed || typeof parsed !== 'object') return null;
    const candidates = [parsed.url, parsed.checkout_url, parsed.checkoutUrl, parsed.session_url];
    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      if (typeof c === 'string' && /^https:\/\/\S+$/.test(c.trim())) return c.trim();
    }
    return null;
  }

  // The description for the language the customer is reading right now.
  //
  // There is deliberately no fallback to the other language. Showing French copy on the
  // English page is the exact bug the split fields exist to remove, so a vehicle without
  // a translation for the active language simply shows no description.
  function descriptionOf(vehicle) {
    if (!vehicle) return '';
    return AM.i18n.get() === 'en'
      ? (vehicle.descriptionEn || '')
      : (vehicle.descriptionFr || '');
  }

  return {
    ApiError: ApiError,
    request: request,
    fetchCatalog: fetchCatalog,
    fetchBusyWindows: fetchBusyWindows,
    searchAddress: searchAddress,
    descriptionOf: descriptionOf,
    postBooking: postBooking
  };
})();
