window.AM = window.AM || {};

AM.i18n = (function () {
  const STORAGE_KEY = 'lang';
  const SUPPORTED = ['fr', 'en'];
  const DEFAULT = 'fr';

  const DICT = {
    fr: {
      meta: {
        title: 'AmiScoot Reims — Location de trottinettes et fauteuils roulants',
        description: 'Louez une trottinette électrique ou un fauteuil roulant à Reims. Livraison possible dans un rayon de 15 km. Réservation en ligne et paiement sécurisé.'
      },
      brand: { name: 'AmiScoot', tagline: 'Location à Reims' },
      lang: { label: 'Langue', fr: 'FR', en: 'EN', switchTo: 'English' },
      nav: { call: 'Appeler', whatsapp: 'WhatsApp' },
      banner: {
        offline: 'Le service de réservation en ligne est momentanément indisponible. Pour réserver immédiatement, contactez-nous par téléphone ou WhatsApp au : +33 4 12 13 61 41'
      },
      hero: {
        title: 'Louez une trottinette ou un fauteuil roulant à Reims',
        subtitle: 'Rapide, simple, fiable. Livraison disponible dans un rayon de 15 km.'
      },
      category: {
        label: 'Catégorie',
        scooter: 'Trottinette électrique',
        wheelchair: 'Fauteuil roulant'
      },
      sort: {
        label: 'Trier',
        price_asc: 'Prix croissant',
        price_desc: 'Prix décroissant',
        name_asc: 'Nom (A–Z)'
      },
      filters: {
        title: 'Filtres',
        advanced: 'Filtres avancés',
        open: 'Ouvrir les filtres',
        close: 'Fermer',
        autonomie: 'Autonomie',
        autonomieHint: 'Cochez pour une autonomie minimale',
        poids: 'Poids max. supporté',
        poidsAny: 'Indifférent',
        pliant: 'Pliant',
        reset: 'Réinitialiser les filtres',
        activeCount: '{count} filtre(s) actif(s)'
      },
      catalog: {
        count: { one: '{count} véhicule disponible', other: '{count} véhicules disponibles' },
        loading: 'Chargement du catalogue',
        empty: 'Aucun véhicule ne correspond à ces critères.',
        emptyHint: 'Essayez d’élargir votre sélection.',
        select: 'Choisir',
        soon: 'Bientôt disponible',
        soonHint: 'La réservation en ligne arrive à l’étape suivante.',
        perHour: '/ heure',
        autonomie: 'Autonomie',
        poids: 'Poids max.',
        pliant: 'Pliant',
        imageAlt: '{name}'
      },
      footer: {
        legal: 'Mentions légales',
        privacy: 'Politique de confidentialité',
        terms: 'CGV',
        rights: 'Tous droits réservés.',
        contact: 'Nous contacter',
        dataUse: 'Vos données servent uniquement au traitement de votre réservation.'
      },
      a11y: { skipToContent: 'Aller au contenu principal', loading: 'Chargement' }
    },

    en: {
      meta: {
        title: 'AmiScoot Reims — Scooter and wheelchair rental',
        description: 'Rent an electric scooter or a wheelchair in Reims. Delivery within a 15 km radius. Book online and pay securely.'
      },
      brand: { name: 'AmiScoot', tagline: 'Rental in Reims' },
      lang: { label: 'Language', fr: 'FR', en: 'EN', switchTo: 'Français' },
      nav: { call: 'Call', whatsapp: 'WhatsApp' },
      banner: {
        offline: 'Online booking is temporarily unavailable. To book right away, please call or WhatsApp us at: +33 4 12 13 61 41'
      },
      hero: {
        title: 'Rent a scooter or a wheelchair in Reims',
        subtitle: 'Fast, simple, reliable. Delivery available within a 15 km radius.'
      },
      category: {
        label: 'Category',
        scooter: 'Electric scooter',
        wheelchair: 'Wheelchair'
      },
      sort: {
        label: 'Sort',
        price_asc: 'Price: low to high',
        price_desc: 'Price: high to low',
        name_asc: 'Name (A–Z)'
      },
      filters: {
        title: 'Filters',
        advanced: 'Advanced filters',
        open: 'Open filters',
        close: 'Close',
        autonomie: 'Range',
        autonomieHint: 'Tick for a minimum range',
        poids: 'Max. supported weight',
        poidsAny: 'Any',
        pliant: 'Folding',
        reset: 'Reset filters',
        activeCount: '{count} active filter(s)'
      },
      catalog: {
        count: { one: '{count} vehicle available', other: '{count} vehicles available' },
        loading: 'Loading the catalog',
        empty: 'No vehicle matches these filters.',
        emptyHint: 'Try widening your selection.',
        select: 'Select',
        soon: 'Coming next stage',
        soonHint: 'Online booking arrives in the next stage.',
        perHour: '/ hour',
        autonomie: 'Range',
        poids: 'Max. load',
        pliant: 'Folding',
        imageAlt: '{name}'
      },
      footer: {
        legal: 'Legal notice',
        privacy: 'Privacy policy',
        terms: 'Terms & conditions',
        rights: 'All rights reserved.',
        contact: 'Contact us',
        dataUse: 'Your data is used solely to process your booking.'
      },
      a11y: { skipToContent: 'Skip to main content', loading: 'Loading' }
    }
  };

  // Category -> weight bracket definitions live with the data they describe.
  const AUTONOMIE_OPTIONS = [15, 20, 30];
  const POIDS_BRACKETS = [
    { min: 81, max: 90 }, { min: 91, max: 100 }, { min: 101, max: 110 },
    { min: 111, max: 120 }, { min: 121, max: 130 }, { min: 131, max: 140 },
    { min: 141, max: 150 }
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

  // t('catalog.count', {count: 12}) -> plural variant chosen by Intl.PluralRules.
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

  // data-i18n -> textContent; data-i18n-attr -> "attr:key,attr:key" with params.
  function applyI18n(root) {
    const scope = root || document;

    scope.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'), readParams(el));
    });

    scope.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      const spec = el.getAttribute('data-i18n-attr');
      spec.split(',').forEach(function (chunk) {
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
    applyI18n: applyI18n
  };
})();
