window.AM = window.AM || {};

AM.CONFIG = {
  phone: '+33 4 12 13 61 41',
  whatsapp: 'https://wa.me/33412136141',
  contactEmail: 'info@amiscoot.fr',

  timezone: 'Europe/Paris',
  baseCoords: { lat: 49.2486, lon: 4.0197 },
  storeAddress: '180 Rue de Vesle, 51100 Reims',
  legal: {
    company: 'AMISCOOT',
    siren: '994 251 882',
    siret: '99425188200019',
    address: '180 Rue de Vesle',
    postalCode: '51100',
    city: 'Reims'
  },

  pocketBaseUrl: 'https://s.reims2026.online',
  n8nWebhookUrl: 'https://n.reims2026.online/webhook/stripe-events',
  nominatimUrl: 'https://nominatim.openstreetmap.org/search',
  addressCountryCode: 'fr',

  deliveryTiers: [
    { maxKm: 5, fee: 0 },
    { maxKm: 15, fee: 50 }
  ],
  deliveryMaxKm: 15,

  minRentalHours: 2,
  maxRentalHours: 720,
  timeoutMs: 5000,

  bookingDisabled: false,

  // Set to the custom domain once it is attached (e.g. 'https://amiscoot.fr'), and
  // update the n8n CORS allowlist in the same commit. While null, the origin is derived
  // from window.location, which is correct on Pages, on previews and locally.
  siteOrigin: null,
  basePath: '/',

  fallbackImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e5e7eb'/%3E%3Ccircle cx='200' cy='140' r='46' fill='none' stroke='%239ca3af' stroke-width='10'/%3E%3Cpath d='M120 232h160' stroke='%239ca3af' stroke-width='10' stroke-linecap='round'/%3E%3C/svg%3E"
};

// If siteOrigin is null, derive from the live location so the site is correct on
// Pages, on preview deployments and locally without any edit.
AM.CONFIG.origin = AM.CONFIG.siteOrigin || window.location.origin;
AM.CONFIG.base = AM.CONFIG.origin + (AM.CONFIG.basePath === '/' ? '' : AM.CONFIG.basePath);
