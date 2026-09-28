window.AM = window.AM || {};

// Runtime translation mechanism. Editable copy lives in content.js, not here.
// This file owns: the language choice, key resolution, plural rules, number and
// money formatting, and the DOM binding.

AM.i18n = (function () {
  const STORAGE_KEY = 'lang';
  const SUPPORTED = ['fr', 'en'];
  const DEFAULT = 'fr';

  // Technical strings that are not editorial content and never need translating
  // by hand. Everything a human might want to reword lives in content.js.
  const RUNTIME = {
    fr: {
      lang: { label: 'Langue', fr: 'FR', en: 'EN' },
      nav: { call: 'Appeler', whatsapp: 'WhatsApp' },
      banner: {
        offline: 'Le service de réservation en ligne est momentanément indisponible. Pour réserver immédiatement, contactez-nous par téléphone ou WhatsApp au : +33 4 12 13 61 41'
      },
      catalog: { loading: 'Chargement du catalogue' },
      a11y: { skipToContent: 'Aller au contenu principal', loading: 'Chargement' }
    },
    en: {
      lang: { label: 'Language', fr: 'FR', en: 'EN' },
      nav: { call: 'Call', whatsapp: 'WhatsApp' },
      banner: {
        offline: 'Online booking is temporarily unavailable. To book right away, please call or WhatsApp us at: +33 4 12 13 61 41'
      },
      catalog: { loading: 'Loading the catalog' },
      a11y: { skipToContent: 'Skip to main content', loading: 'Loading' }
    }
  };

  // Editorial copy from content.js wins over the runtime defaults, and is merged
  // one level deep so a partial override never discards sibling keys.
  function merge(base, override) {
    const out = Object.assign({}, base);
    Object.keys(override).forEach(function (key) {
      const v = override[key];
      if (v && typeof v === 'object' && !Array.isArray(v) && base[key] && typeof base[key] === 'object') {
        out[key] = merge(base[key], v);
      } else {
        out[key] = v;
      }
    });
    return out;
  }

  const EDITORIAL = (window.AM && AM.CONTENT) || { fr: {}, en: {} };
  const DICT = {
    fr: merge(RUNTIME.fr, EDITORIAL.fr || {}),
    en: merge(RUNTIME.en, EDITORIAL.en || {})
  };

  // Filter option values. These are business rules, not copy: changing them
  // changes what the catalogue means.
  const AUTONOMIE_OPTIONS = [15, 20, 30];

  // Closed and non-overlapping. A vehicle below the floor or above the ceiling
  // matches no bracket and is hidden whenever a bracket is selected.
  const POIDS_BRACKETS = [
    { min: 50, max: 119 },
    { min: 120, max: 150 }
  ];

  let lang = readStoredLang();

  function readStoredLang() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    } catch (e) { /* private mode: fall through to the default */ }
    return DEFAULT;
  }

  function store(l) {
    try { window.localStorage.setItem(STORAGE_KEY, l); } catch (e) { /* ignore */ }
  }

  function get() { return lang; }

  function resolve(dict, path) {
    const parts = path.split('.');
    let node = dict;
    for (let i = 0; i < parts.length; i++) {
      if (node === null || typeof node !== 'object' || !(parts[i] in node)) return undefined;
      node = node[parts[i]];
    }
    return node;
  }

  // t('catalog.count', {count: 12}) picks the plural variant via Intl.PluralRules.
  function t(key, params) {
    const p = params || {};
    let node = resolve(DICT[lang], key);
    if (node === undefined && lang !== DEFAULT) node = resolve(DICT[DEFAULT], key);
    if (node === undefined) return key;

    if (typeof node === 'object' && !Array.isArray(node)) {
      if (p.count !== undefined) {
        const cat = new Intl.PluralRules(lang).select(p.count);
        node = node[cat] !== undefined ? node[cat] : node.other;
      } else {
        return key; // a plural group addressed without a count has no single form
      }
    }
    if (typeof node !== 'string') return key;

    return node.replace(/\{(\w+)\}/g, function (m, name) {
      return p[name] === undefined ? m : String(p[name]);
    });
  }

  function money(amount) {
    return new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(amount);
  }

  function number(value) {
    return new Intl.NumberFormat(lang).format(value);
  }

  function locale() {
    return lang === 'fr' ? 'fr-FR' : 'en-GB';
  }

  // data-i18n -> textContent; data-i18n-attr -> "attr:key,attr:key".
  function applyI18n(root) {
    const scope = root || document;

    scope.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'), readParams(el));
    });

    scope.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(',').forEach(function (chunk) {
        const idx = chunk.indexOf(':');
        if (idx === -1) return;
        const attr = chunk.slice(0, idx).trim();
        const key = chunk.slice(idx + 1).trim();
        el.setAttribute(attr, t(key, readParams(el)));
      });
    });
  }

  function readParams(el) {
    const raw = el.getAttribute('data-i18n-count');
    if (raw === null) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? { count: n } : undefined;
  }

  function set(next) {
    if (SUPPORTED.indexOf(next) === -1) return;
    lang = next;
    store(lang);
    document.documentElement.lang = lang;
  }

  function init() {
    document.documentElement.lang = lang;
  }

  return {
    DICT: DICT,
    SUPPORTED: SUPPORTED,
    DEFAULT: DEFAULT,
    AUTONOMIE_OPTIONS: AUTONOMIE_OPTIONS,
    POIDS_BRACKETS: POIDS_BRACKETS,
    get: get,
    set: set,
    init: init,
    t: t,
    money: money,
    number: number,
    locale: locale,
    applyI18n: applyI18n
  };
})();
