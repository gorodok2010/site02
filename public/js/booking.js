window.AM = window.AM || {};

// Booking window: period, collection mode, contact details, live price.
//
// SCOPE — this build is INTERFACE ONLY. The pay button is deliberately inert and no
// payload is sent anywhere. `AM.api.postBooking` already knows how to talk to the n8n
// Stripe workflow, so wiring the final submit is a small, isolated change: build the
// payload in `buildPayload()`, then call `AM.api.postBooking(payload)` and redirect to
// the returned URL. Nothing else below needs to change.

AM.booking = (function () {
  const CFG = AM.CONFIG;
  const i18n = AM.i18n;
  const dates = AM.dates;
  const api = AM.api;

  const EARTH_RADIUS_KM = 6371;

  const s = {
    vehicle: null,
    open: false,
    mode: 'pickup',
    start: null,
    end: null,
    place: null,          // { lat, lon, label } once the user picks an address
    commune: null,        // the matched entry from CFG.deliveryCommunes, when there was one
    communeHits: [],      // local matches for the current query
    name: '',
    email: '',
    phone: '',
    addressQuery: '',
    addressResults: [],
    addressBusy: false,
    availability: 'idle',  // 'idle' | 'checking' | 'free' | 'busy' | 'failed'
    errors: {},
    lastFocused: null
  };

  let root = null;
  let availabilityToken = 0;
  let addressToken = 0;

  // --- small helpers ---------------------------------------------------------

  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (key) {
        const value = props[key];
        if (value === null || value === undefined || value === false) return;
        if (key === 'text') { node.textContent = value; return; }
        if (key === 'class') { node.className = value; return; }
        if (key === 'attrs') {
          Object.keys(value).forEach(function (a) {
            if (value[a] === null || value[a] === undefined || value[a] === false) return;
            node.setAttribute(a, value[a] === true ? '' : String(value[a]));
          });
          return;
        }
        if (key.slice(0, 2) === 'on') { node.addEventListener(key.slice(2), value); return; }
        node[key] = value;
      });
    }
    if (children) {
      const list = Array.isArray(children) ? children : [children];
      list.forEach(function (c) {
        if (c === null || c === undefined || c === false) return;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return node;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  // replaceChildren() stringifies a null argument, which prints a literal "null"
  // into the page. Children here are optional by design, so they are filtered out.
  function replaceChildren(node, children) {
    clear(node);
    [].concat(children).forEach(function (c) { if (c) node.appendChild(c); });
  }

  function debounce(fn, ms) {
    let timer = null;
    return function () {
      const args = arguments;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(function () { fn.apply(null, args); }, ms);
    };
  }

  function haversineKm(a, b) {
    const toRad = function (d) { return (d * Math.PI) / 180; };
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  // Nearest tier at or above the distance. Returns null when the address is out of
  // range, which the UI reports as "we do not deliver there" rather than a price.
  function tierFor(km) {
    const tiers = CFG.deliveryTiers;
    for (let i = 0; i < tiers.length; i++) {
      if (km <= tiers[i].maxKm) return tiers[i];
    }
    return null;
  }

  function toInputValue(instant) {
    return dates.parisToInputValue(instant).replace(' ', 'T');
  }

  // --- defaults --------------------------------------------------------------

  function resetFor(vehicle) {
    const start = dates.nextFullHour(new Date());
    const minHours = vehicle.minHours || CFG.minRentalHours;
    s.vehicle = vehicle;
    s.mode = 'pickup';
    s.start = start;
    s.end = new Date(start.getTime() + minHours * 3600000);
    s.place = null;
    s.commune = null;
    s.communeHits = [];
    s.name = '';
    s.email = '';
    s.phone = '';
    s.addressQuery = '';
    s.addressResults = [];
    s.addressBusy = false;
    s.availability = 'idle';
    s.errors = {};
  }

  // --- derived values --------------------------------------------------------

  function hours() {
    if (!s.start || !s.end) return 0;
    return dates.hoursBetween(s.start, s.end);
  }

  function distanceKm() {
    if (s.mode !== 'delivery' || !s.place) return null;
    return haversineKm(CFG.baseCoords, s.place);
  }

  // Fee is one of: 0, a euro amount, null ("not known yet — no address chosen") or
  // 'quote' (a listed commune that sits beyond every distance band). The whitelist in
  // config decides whether we deliver at all; the distance only decides the price.
  function deliveryFee() {
    if (s.mode === 'pickup') return 0;
    if (!s.place) return null;
    const tier = tierFor(distanceKm());
    return tier ? tier.fee : 'quote';
  }

  function price() {
    const v = s.vehicle;
    const h = hours();
    const rental = v.pricePerHour === null ? null : v.pricePerHour * h;
    const fee = deliveryFee();
    const deposit = v.caution === null ? 0 : v.caution;
    const feeKnown = typeof fee === 'number';
    return {
      hours: h,
      rental: rental,
      fee: fee,
      deposit: deposit,
      total: rental === null || !feeKnown ? null : rental + fee + deposit
    };
  }

  // --- validation ------------------------------------------------------------

  // The per-vehicle minimum is the floor, never a suggestion. A booking shorter than
  // it cannot be priced or submitted, and the end field refuses to offer such a time.
  function minHoursFor() {
    const v = s.vehicle;
    return (v && v.minHours) || CFG.minRentalHours;
  }

  function validatePeriod() {
    if (!s.start) return 'startInPast';
    if (!s.end) return 'endRequired';
    if (s.start.getTime() < Date.now()) return 'startInPast';
    if (s.end.getTime() < Date.now()) return 'endInPast';
    // Checked before the minimum: an end at or before the start gives a zero or
    // negative duration, and reporting that as "too short" hides the real mistake.
    if (s.end.getTime() <= s.start.getTime()) return 'endAfterStart';
    const minHours = minHoursFor();
    if (hours() < minHours) return 'minHours';
    if (hours() > CFG.maxRentalHours) return 'maxDuration';
    return null;
  }

  function validateContact() {
    const errs = {};
    if (!s.name.trim()) errs.name = 'required';
    if (!s.email.trim()) errs.email = 'required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email.trim())) errs.email = 'emailInvalid';
    if (!s.phone.trim()) errs.phone = 'required';
    return errs;
  }

  // --- availability ----------------------------------------------------------

  const runAvailability = debounce(function () {
    const token = ++availabilityToken;
    const v = s.vehicle;
    const start = s.start;
    const end = s.end;
    s.availability = 'checking';
    patchInPlace();

    api.fetchBusyWindows(start, end)
      .then(function (windows) {
        if (token !== availabilityToken) return;   // a newer request already won
        const from = start.getTime();
        const to = end.getTime();
        const clash = windows.some(function (w) {
          return String(w.vehicleId) === String(v.id) && w.start < to && w.end > from;
        });
        s.availability = clash ? 'busy' : 'free';
      })
      .catch(function () {
        if (token !== availabilityToken) return;
        s.availability = 'failed';
      })
      .then(function () {
        if (token === availabilityToken) patchInPlace();
      });
  }, 400);

  function scheduleAvailability() {
    if (!s.start || !s.end || s.end.getTime() <= s.start.getTime()) {
      availabilityToken += 1;
      s.availability = 'idle';
      return;
    }
    runAvailability();
  }

  // --- address search --------------------------------------------------------

  // Commune matching is local: the list is in config.js with coordinates, so a city
  // or postal code resolves instantly and without touching Nominatim. Only the
  // street-address half of the hybrid needs the network.
  function normalise(value) {
    return String(value || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/['’-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function matchCommunes(query) {
    const q = normalise(query);
    if (q.length < 2) return [];
    const hits = [];
    CFG.deliveryCommunes.forEach(function (c) {
      const n = normalise(c.name);
      const p = normalise(c.postalCode);
      const score = n === q ? 0
        : n.indexOf(q) === 0 ? 1
          : n.indexOf(q) !== -1 ? 2
            : p === q ? 1
              : p.indexOf(q) === 0 ? 3
                : -1;
      if (score !== -1) hits.push({ commune: c, score: score });
    });
    hits.sort(function (a, b) { return a.score - b.score || a.commune.name.localeCompare(b.commune.name); });
    return hits.slice(0, 6).map(function (h) { return h.commune; });
  }

  // Nominatim orders a viewbox as lon_min,lat_min,lon_max,lat_max. A twentieth of a
  // degree is about 5.5 km, which covers a rural commune while still excluding the
  // neighbouring village, so a street search cannot wander off after a town is picked.
  function boundsFor(commune) {
    if (!commune) return null;
    const dLat = 0.05;
    const dLon = 0.05;
    return [
      round(commune.lon - dLon), round(commune.lat - dLat),
      round(commune.lon + dLon), round(commune.lat + dLat)
    ];
  }

  function round(n) { return Math.round(n * 10000) / 10000; }

  const runAddressSearch = debounce(function (query) {
    const token = ++addressToken;
    s.addressQuery = query;
    // Typing invalidates the committed address, otherwise the summary keeps quoting a
    // delivery point the customer is in the middle of replacing. The commune is kept:
    // it is the search area, not the answer.
    s.place = null;

    const local = matchCommunes(query);
    if (local.length) {
      // A commune hit is enough to act on: no reason to wait on a network round trip.
      s.communeHits = local;
      s.addressResults = [];
      s.addressBusy = false;
      patchInPlace();
      return;
    }

    s.communeHits = [];
    if (query.trim().length < 3) {
      s.addressResults = [];
      s.addressBusy = false;
      patchInPlace();
      return;
    }
    s.addressBusy = true;
    patchInPlace();

    // Once a commune is chosen, this is a street search inside it. Nominatim matches
    // on feature names, so a bare "rue de la Marne" finds nothing while
    // "rue de la Marne, Taissy" resolves. Only do this when the typed text is not
    // itself a commune, otherwise it would fight the commune the user is switching to.
    const streetQuery = s.commune ? query + ', ' + s.commune.name : query;

    api.searchAddress(streetQuery, boundsFor(s.commune))
      .then(function (results) {
        if (token !== addressToken) return;
        s.addressResults = (results || []).slice(0, 6).map(function (r) {
          return { lat: Number(r.lat), lon: Number(r.lon), label: r.display_name };
        }).filter(function (r) { return Number.isFinite(r.lat) && Number.isFinite(r.lon); });
        s.addressBusy = false;
        patchInPlace();
      })
      .catch(function () {
        if (token !== addressToken) return;
        s.addressResults = [];
        s.addressBusy = false;
        patchInPlace();
      });
  }, 400);

  // --- render ----------------------------------------------------------------

  // The error line always exists (empty when there is no error) so a re-render can
  // clear it in place instead of leaving a stale red message under a valid field.
  function field(label, key, opts) {
    const o = opts || {};
    const err = s.errors[key];
    const id = 'bk-' + key;
    const common = 'w-full rounded-lg border px-3 py-2.5 text-sm';
    const border = err
      ? common + ' border-red-400 bg-red-50'
      : common + ' border-slate-300 bg-white';

    let control;
    if (o.type === 'textarea') {
      control = el('textarea', { id: id, rows: 2, class: border, text: o.value || '' });
    } else {
      control = el('input', {
        type: o.type || 'text', id: id, class: border,
        attrs: Object.assign({}, o.attrs, { value: o.value || '' })
      });
    }
    control.addEventListener('input', function () { o.onInput(this.value); });

    return el('div', { class: 'mb-4' }, [
      el('label', { attrs: { for: id }, class: 'block text-sm font-semibold mb-1.5', text: label }),
      control,
      el('p', {
        class: 'mt-1 text-sm text-red-700',
        attrs: { 'data-bk-error': key },
        text: err ? i18n.t('booking.' + err) : ''
      })
    ]);
  }

  function periodBlock() {
    const minHours = minHoursFor();
    const minValue = toInputValue(dates.nextFullHour(new Date()));
    const problem = validatePeriod();
    const problemText = problem && problem !== 'minHours' && problem !== 'maxDuration'
      ? i18n.t('booking.' + problem)
      : '';
    const hoursProblem = problem === 'minHours'
      ? i18n.t('booking.minHours', { hours: minHours })
      : (problem === 'maxDuration'
        ? i18n.t('booking.maxDuration', { days: Math.round(CFG.maxRentalHours / 24) })
        : '');

    // The end field can never offer a time closer than the minimum to the start.
    const endMin = toInputValue(new Date(s.start.getTime() + minHours * 3600000));

    return el('fieldset', { class: 'mb-5' }, [
      el('legend', { class: 'text-sm font-semibold mb-2', text: i18n.t('booking.period') }),
      el('div', { class: 'grid gap-3 sm:grid-cols-2' }, [
        el('div', {}, [
          el('label', { attrs: { for: 'bk-from' }, class: 'block text-sm mb-1.5', text: i18n.t('booking.from') }),
          el('input', {
            type: 'datetime-local', id: 'bk-from', class: 'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm',
            attrs: { min: minValue, step: 3600, value: toInputValue(s.start) },
            onchange: function () {
              const next = dates.inputValueToUtc(this.value);
              if (!next) return;
              s.start = next;
              // Drag the end along rather than leaving the two fields in a state the
              // summary cannot price.
              const floor = new Date(next.getTime() + minHours * 3600000);
              if (!s.end || s.end.getTime() < floor.getTime()) s.end = floor;
              s.errors = {};
              scheduleAvailability();
              render();
            }
          })
        ]),
        el('div', {}, [
          el('label', { attrs: { for: 'bk-to' }, class: 'block text-sm mb-1.5', text: i18n.t('booking.to') }),
          el('input', {
            type: 'datetime-local', id: 'bk-to', class: 'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm',
            attrs: { min: endMin, step: 3600, value: toInputValue(s.end) },
            onchange: function () {
              const next = dates.inputValueToUtc(this.value);
              if (!next) return;
              // Clamp instead of accepting: a sub-minimum interval is not a booking.
              const floor = s.start.getTime() + minHours * 3600000;
              s.end = next.getTime() < floor ? new Date(floor) : next;
              this.value = toInputValue(s.end);
              s.errors = {};
              scheduleAvailability();
              render();
            }
          })
        ])
      ]),
      problemText ? el('p', { class: 'mt-2 text-sm text-red-700', text: problemText }) : null,
      hoursProblem
        ? el('p', { class: 'mt-1 text-sm text-red-700', text: hoursProblem })
        : el('p', { class: 'mt-1 text-xs text-slate-500', text: i18n.t('booking.durationValue', { hours: i18n.number(Math.round(hours() * 10) / 10) }) })
    ]);
  }

  function modeBlock() {
    const option = function (value, label, checked, extra) {
      const id = 'bk-mode-' + value;
      return el('label', {
        attrs: { for: id },
        class: 'flex items-start gap-3 p-3 rounded-lg border cursor-pointer ' +
          (checked ? 'border-blue-600 bg-blue-50' : 'border-slate-300 hover:bg-slate-50')
      }, [
        el('input', {
          type: 'radio', name: 'bk-mode', id: id, class: 'mt-1 w-5 h-5', checked: checked,
          onchange: function () { s.mode = value; s.errors = {}; render(); }
        }),
        el('span', {}, [
          el('span', { class: 'block text-sm font-medium', text: label }),
          extra ? el('span', { class: 'block text-xs text-slate-500 mt-0.5', text: extra }) : null
        ])
      ]);
    };

    return el('fieldset', { class: 'mb-5' }, [
      el('legend', { class: 'text-sm font-semibold mb-2', text: i18n.t('booking.mode') }),
      el('div', { class: 'grid gap-2 sm:grid-cols-2' }, [
        option('pickup', i18n.t('booking.pickup'), s.mode === 'pickup', i18n.t('booking.storeAddress')),
        option('delivery', i18n.t('booking.delivery'), s.mode === 'delivery',
          i18n.t('booking.deliveryRadius', { max: CFG.deliveryMaxKm }))
      ])
    ]);
  }

  // The address input itself is rendered once and never replaced. Only the results
  // list below it is patched, so typing an address keeps focus and the caret.
  function addressBlock() {
    if (s.mode !== 'delivery') return null;
    return el('div', { class: 'mb-4' }, [
      field(i18n.t('booking.deliveryAddress'), 'address', {
        value: s.addressQuery,
        onInput: function (v) { runAddressSearch(v); }
      }),
      el('p', { class: 'mb-2 text-xs text-slate-500', text: i18n.t('booking.addressHint') }),
      el('div', { attrs: { 'data-bk-address-out': '1' } }, [
        addressResultList(), addressNote(), distanceNote()
      ])
    ]);
  }

  function communeRow(c) {
    return el('li', {}, [
      el('button', {
        type: 'button',
        class: 'w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2',
        onclick: function () {
          s.commune = c;
          s.place = { lat: c.lat, lon: c.lon, label: c.name + ' (' + c.postalCode + ')' };
          s.addressQuery = c.name;
          s.addressResults = [];
          s.communeHits = [];
          addressToken += 1;
          patchInPlace();
        }
      }, [
        el('span', { class: 'font-medium', text: c.name }),
        el('span', { class: 'text-slate-500', text: c.postalCode })
      ])
    ]);
  }

  function resultList(items, renderItem) {
    return el('ul', {
      class: 'rounded-lg border border-slate-300 divide-y divide-slate-200 max-h-56 overflow-y-auto',
      attrs: { 'aria-label': i18n.t('booking.addressResults') }
    }, items.map(renderItem));
  }

  function addressResultList() {
    const communes = s.communeHits || [];
    if (communes.length) return resultList(communes, communeRow);
    if (s.addressBusy) {
      return el('p', { class: 'text-sm text-slate-500', text: i18n.t('booking.checking') });
    }
    if (!s.addressResults.length) return null;
    return resultList(s.addressResults, function (p) {
      return el('li', {}, [
        el('button', {
          type: 'button',
          class: 'w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50',
          text: p.label,
          onclick: function () {
            s.place = p;
            s.addressQuery = p.label;
            s.addressResults = [];
            s.communeHits = [];
            addressToken += 1;
            patchInPlace();
          }
        })
      ]);
    });
  }

  function addressNote() {
    if (s.place) {
      return el('p', { class: 'mt-2 text-sm font-medium', text: s.place.label });
    }
    return el('p', { class: 'mt-1 text-xs text-slate-500', text: i18n.t('booking.distanceUnknown') });
  }

  function distanceNote() {
    const km = distanceKm();
    if (km === null) return null;
    const tier = tierFor(km);
    if (!tier) {
      // A whitelisted commune is deliverable even when it falls outside every price
      // band, so this is a quote, not a refusal. Only an address outside the whitelist
      // is turned away.
      if (s.commune) {
        return el('p', {
          class: 'mt-1 text-xs text-slate-500',
          text: i18n.t('booking.distanceQuote', { km: Math.round(km * 10) / 10 })
        });
      }
      return el('p', { class: 'mt-1 text-sm text-red-700', text: i18n.t('booking.outsideRadius', { max: CFG.deliveryMaxKm }) });
    }
    return el('p', {
      class: 'mt-1 text-xs text-slate-500',
      text: i18n.t('booking.withinRadius', {
        km: Math.round(km * 10) / 10,
        fee: tier.fee === 0 ? i18n.t('booking.free') : i18n.money(tier.fee)
      })
    });
  }

  function availabilityBlock() {
    const m = availabilityStyle();
    return el('div', { class: 'mb-5' }, [
      el('p', { class: 'text-sm font-semibold mb-1', text: i18n.t('booking.availability') }),
      el('p', {
        class: 'text-sm ' + m.cls,
        attrs: { role: 'status', 'aria-live': 'polite', 'data-bk-availability': '1' },
        text: m.text
      })
    ]);
  }

  function availabilityStyle() {
    return {
      idle: { cls: 'text-slate-500', text: '' },
      checking: { cls: 'text-slate-600', text: i18n.t('booking.checking') },
      free: { cls: 'text-emerald-700', text: i18n.t('booking.available') },
      busy: { cls: 'text-red-700', text: i18n.t('booking.busy') },
      failed: { cls: 'text-amber-800', text: i18n.t('booking.checkFailed') }
    }[s.availability] || { cls: 'text-slate-500', text: '' };
  }

  // Anything that updates after the user has started typing patches the live nodes.
  // A full re-render here would replace the focused input and throw the caret away,
  // which is exactly the moment the user is typing.
  function patchInPlace() {
    if (!root) return;

    // Picking a suggestion writes the label into state; mirror it into the input,
    // which is never re-created.
    const addressInput = root.querySelector('#bk-address');
    if (addressInput && addressInput.value !== s.addressQuery) {
      addressInput.value = s.addressQuery;
    }

    ['name', 'email', 'phone'].forEach(function (key) {
      const node = root.querySelector('[data-bk-error="' + key + '"]');
      if (node) node.textContent = s.errors[key] ? i18n.t('booking.' + s.errors[key]) : '';
    });

    const status = root.querySelector('[data-bk-availability]');
    if (status) {
      const m = availabilityStyle();
      status.className = 'text-sm ' + m.cls;
      status.textContent = m.text;
    }

    const summary = root.querySelector('[data-bk-summary]');
    if (summary) summary.replaceWith(summaryBlock());

    const addressOut = root.querySelector('[data-bk-address-out]');
    if (addressOut) {
      replaceChildren(addressOut, [addressResultList(), addressNote(), distanceNote()]);
    }
  }

  function row(label, value, strong) {
    return el('div', { class: 'flex justify-between gap-4 py-1 ' + (strong ? 'font-semibold text-base' : 'text-sm') }, [
      el('span', { class: (strong ? '' : 'text-slate-500') + ' shrink-0', text: label }),
      el('span', { class: 'text-right', text: value })
    ]);
  }

  // The dialog thumbnail points at the same file as the catalogue card, so it is served
  // from cache: the customer opened the dialog from a card that had already loaded it.
  // src is assigned after creation because an empty string would resolve to this page's
  // own URL and fire a pointless request.
  function vehicleThumb(v) {
    const img = el('img', {
      class: 'w-16 h-12 rounded object-cover bg-slate-200 shrink-0',
      attrs: { alt: i18n.t('catalog.imageAlt', { name: v.name }) },
      onerror: function () {
        this.onerror = null;
        this.src = CFG.fallbackImage;
      }
    });
    img.src = v.image || CFG.fallbackImage;
    return img;
  }

  function summaryBlock() {
    const p = price();
    let feeText;
    if (s.mode === 'pickup') feeText = i18n.t('booking.free');
    else if (p.fee === null) feeText = '—';
    else if (p.fee === 'quote') feeText = i18n.t('booking.deliveryQuote');
    else feeText = p.fee === 0 ? i18n.t('booking.free') : i18n.money(p.fee);

    return el('div', { class: 'mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4', attrs: { 'data-bk-summary': '1' } }, [
      el('p', { class: 'text-sm font-semibold mb-2', text: i18n.t('booking.summary') }),
      row(i18n.t('booking.rental'), p.rental === null ? '—' : i18n.money(p.rental)),
      row(i18n.t('booking.deliveryFee'), feeText),
      row(i18n.t('booking.deposit'), i18n.money(p.deposit)),
      el('div', { class: 'border-t border-slate-200 mt-2 pt-2' }, [
        row(i18n.t('booking.total'), p.total === null ? '—' : i18n.money(p.total), true)
      ]),
      el('p', { class: 'mt-2 text-xs text-slate-500', text: i18n.t('booking.depositNote') })
    ]);
  }

  function render() {
    if (!root) return;
    clear(root);
    if (!s.open || !s.vehicle) return;

    const v = s.vehicle;

    const dialog = el('div', {
      class: 'relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl',
      attrs: {
        role: 'dialog', 'aria-modal': 'true',
        'aria-label': i18n.t('booking.title')
      }
    }, [
      el('div', { class: 'sticky top-0 z-10 flex items-start gap-3 border-b border-slate-200 bg-white px-5 py-4' }, [
        el('div', { class: 'mr-auto' }, [
          el('h2', { class: 'text-lg font-semibold', text: i18n.t('booking.title') }),
          el('p', { class: 'text-sm text-slate-500', text: i18n.t('booking.vehicle') + ' : ' + v.name })
        ]),
        el('button', {
          type: 'button', class: 'rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-slate-100',
          attrs: { 'aria-label': i18n.t('booking.closeModal') },
          text: i18n.t('booking.close'),
          onclick: close
        })
      ]),
      el('div', { class: 'px-5 py-4' }, [
        el('div', { class: 'mb-5 flex items-center gap-3 rounded-lg bg-slate-50 p-3' }, [
          vehicleThumb(v),
          el('div', {}, [
            el('p', { class: 'font-semibold leading-snug', text: v.name }),
            el('p', { class: 'text-sm text-slate-600', text: i18n.t('booking.perHour', { price: v.pricePerHour === null ? '—' : i18n.money(v.pricePerHour) }) })
          ])
        ]),
        periodBlock(),
        modeBlock(),
        addressBlock(),
        el('fieldset', { class: 'mb-5' }, [
          el('legend', { class: 'text-sm font-semibold mb-2', text: i18n.t('booking.contact') }),
          field(i18n.t('booking.name'), 'name', { value: s.name, onInput: function (v2) { s.name = v2; s.errors = validateContact(); renderSummaryOnly(); } }),
          field(i18n.t('booking.email'), 'email', { type: 'email', value: s.email, onInput: function (v2) { s.email = v2; s.errors = validateContact(); renderSummaryOnly(); } }),
          field(i18n.t('booking.phone'), 'phone', { type: 'tel', value: s.phone, onInput: function (v2) { s.phone = v2; s.errors = validateContact(); renderSummaryOnly(); } })
        ]),
        availabilityBlock(),
        summaryBlock(),
        el('button', {
          type: 'button', disabled: true, 'aria-disabled': 'true',
          class: 'w-full rounded-lg bg-slate-200 text-slate-500 px-4 py-3 font-semibold text-sm cursor-not-allowed',
          text: i18n.t('booking.pay')
        }),
        el('p', { class: 'mt-2 text-center text-xs text-slate-500', text: i18n.t('booking.payHint') })
      ])
    ]);

    const overlay = el('div', {
      class: 'fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/50 p-0 sm:p-6 overflow-y-auto',
      onclick: function (e) { if (e.target === this) close(); }
    }, [dialog]);

    root.appendChild(overlay);

    // Focus lands on the start date, the first thing anyone fills in. Landing on the
    // close button would make Escape look like the expected way out of the dialog.
    const first = dialog.querySelector('#bk-from') || dialog.querySelector('input, button, select, textarea');
    if (first) first.focus();
  }

  // Re-rendering the whole dialog on every keystroke would move the caret to the end
  // of the field and lose focus, so typing only refreshes errors, price and status.
  function renderSummaryOnly() {
    patchInPlace();
  }

  // --- public API ------------------------------------------------------------

  function open(vehicle) {
    if (!vehicle || !vehicle.isActive) return;
    s.lastFocused = document.activeElement;
    resetFor(vehicle);
    s.open = true;
    document.body.classList.add('overflow-hidden');
    render();
    scheduleAvailability();
  }

  function close() {
    s.open = false;
    availabilityToken += 1;
    addressToken += 1;
    document.body.classList.remove('overflow-hidden');
    if (root) clear(root);
    if (s.lastFocused && s.lastFocused.focus) s.lastFocused.focus();
    s.lastFocused = null;
  }

  // Called when the UI language changes so the open dialog re-reads its strings.
  function refresh() {
    if (s.open) render();
  }

  // Kept for the next step: everything the Stripe workflow will need, and nothing else.
  function buildPayload() {
    const p = price();
    return {
      scooterId: s.vehicle.id,
      startDatetime: s.start.toISOString(),
      endDatetime: s.end.toISOString(),
      hours: p.hours,
      hourlyRate: s.vehicle.pricePerHour,
      rentalAmount: p.rental,
      deliveryType: s.mode,
      deliveryAddress: s.mode === 'delivery' && s.place ? s.place.label : null,
      // 'quote' is a display state, not a price. Never let it reach the webhook.
      deliveryFee: typeof p.fee === 'number' ? p.fee : null,
      depositAmount: p.deposit,
      totalAmount: p.total,
      customerName: s.name.trim(),
      customerEmail: s.email.trim(),
      customerPhone: s.phone.trim()
    };
  }

  function init() {
    root = document.getElementById('booking-root');
    if (!root) throw new Error('Missing element #booking-root');

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && s.open) close();
    });
  }

  return {
    init: init,
    open: open,
    close: close,
    refresh: refresh,
    buildPayload: buildPayload,
    validatePeriod: validatePeriod,
    validateContact: validateContact,
    price: price,
    isOpen: function () { return s.open; }
  };
})();
