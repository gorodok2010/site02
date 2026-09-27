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

  function normalizeScooter(raw) {
    const image = Array.isArray(raw.image) ? raw.image[0] : raw.image;
    return {
      id: String(raw.id),
      name: String(raw.name || ''),
      image: image ? (CFG.pocketBaseUrl + '/api/files/scooters/' + raw.id + '/' + encodeURIComponent(image)) : '',
      category: raw.category === 'wheelchair' ? 'wheelchair' : 'scooter',
      autonomie: toNumber(raw.autonomie),
      poidsMax: toNumber(raw.poids_max),
      pliant: raw.pliant === true || raw.pliant === 1 || raw.pliant === 'true',
      pricePerHour: toNumber(raw.price_per_hour),
      caution: toNumber(raw.caution)
    };
  }

  // Missing / null / non-numeric means "no deposit" — never NaN, never -1.
  function toNumber(v) {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  async function fetchCatalog() {
    const rows = await fetchAllPages('scooters', { sort: 'name' });
    return rows.map(normalizeScooter);
  }

  // One query for the whole window. The server filter only narrows by start_datetime;
  // the overlap test runs client-side because PocketBase's DSL has no field arithmetic.
  async function fetchBusyWindows(startUtc, endUtc) {
    const filter =
      "(start_datetime < '" + endUtc.toISOString() + "'" +
      " && status != 'canceled'" +
      " && stripe_payment_status != 'failed'" +
      " && stripe_payment_status != 'refunded')";

    let rows;
    try {
      rows = await fetchAllPages('bookings', {
        filter: filter,
        fields: 'scooter,start_datetime,duration_hours,status,stripe_payment_status'
      });
    } catch (err) {
      // A hidden field can make `fields` fail with 400. Retry unfiltered rather than
      // reporting the availability check as broken.
      if (err instanceof ApiError && err.kind === 'http' && err.detail && err.detail.status === 400) {
        rows = await fetchAllPages('bookings', { filter: filter });
      } else {
        throw err;
      }
    }

    const windows = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const s = Date.parse(r.start_datetime);
      const hours = toNumber(r.duration_hours);
      if (!Number.isFinite(s) || hours === null) continue;
      windows.push({
        vehicleId: String(r.scooter || ''),
        start: s,
        end: s + hours * 3600000
      });
    }
    return windows;
  }

  // Nominatim. One request per search: the usage policy forbids bulk or pre-warm calls.
  function searchAddress(query, signal) {
    const url = buildUrl(CFG.nominatimUrl, {
      q: query,
      format: 'jsonv2',
      addressdetails: 1,
      limit: 6,
      countrycodes: CFG.addressCountryCode,
      accept_language: AM.i18n.get()
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

  return {
    ApiError: ApiError,
    request: request,
    fetchCatalog: fetchCatalog,
    fetchBusyWindows: fetchBusyWindows,
    searchAddress: searchAddress,
    postBooking: postBooking
  };
})();
