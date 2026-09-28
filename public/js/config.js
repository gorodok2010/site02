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

  // Communes we deliver to, with coordinates resolved once from OpenStreetMap.
  // Typed city or postal code is matched here locally, so the common case needs
  // no geocoding request at all. The free-text street search that follows is
  // bounded to the commune the customer picked.
  //
  // A commune in this list IS deliverable. `deliveryMaxKm` only drives the
  // distance bands, so a listed commune beyond 15 km is still offered.
  deliveryCommunes: [
    { name: 'Auménancourt', postalCode: '51110', lat: 49.3849738, lon: 4.0679358 },
    { name: 'Bazancourt', postalCode: '51110', lat: 49.3624227, lon: 4.1719947 },
    { name: 'Beaumont-sur-Vesle', postalCode: '51360', lat: 49.1733678, lon: 4.1844893 },
    { name: 'Berméricourt', postalCode: '51220', lat: 49.3573128, lon: 3.9932406 },
    { name: 'Berru', postalCode: '51420', lat: 49.2705732, lon: 4.1492358 },
    { name: 'Bétheny', postalCode: '51450', lat: 49.2845383, lon: 4.0535127 },
    { name: 'Bezannes', postalCode: '51430', lat: 49.2195271, lon: 3.9864282 },
    { name: 'Boult-sur-Suippe', postalCode: '51110', lat: 49.3708335, lon: 4.1478223 },
    { name: 'Bourgogne-Fresne', postalCode: '51110', lat: 49.3492164, lon: 4.0713362 },
    { name: 'Brimont', postalCode: '51220', lat: 49.3408297, lon: 4.0255319 },
    { name: 'Caurel', postalCode: '51110', lat: 49.3033551, lon: 4.152958 },
    { name: 'Cauroy-lès-Hermonville', postalCode: '51220', lat: 49.3489721, lon: 3.923405 },
    { name: 'Cernay-lès-Reims', postalCode: '51420', lat: 49.2641778, lon: 4.1040521 },
    { name: 'Châlons-sur-Vesle', postalCode: '51140', lat: 49.2893549, lon: 3.9182096 },
    { name: 'Chamery', postalCode: '51500', lat: 49.1724784, lon: 3.9557464 },
    { name: 'Champfleury', postalCode: '51500', lat: 49.1984834, lon: 4.0165459 },
    { name: 'Champigny', postalCode: '51370', lat: 49.2683007, lon: 3.9671604 },
    { name: 'Chenay', postalCode: '51140', lat: 49.2979926, lon: 3.9293797 },
    { name: 'Chigny-les-Roses', postalCode: '51500', lat: 49.1565861, lon: 4.062423 },
    { name: 'Cormicy', postalCode: '51220', lat: 49.3703024, lon: 3.8954464 },
    { name: 'Cormontreuil', postalCode: '51350', lat: 49.2234466, lon: 4.0534118 },
    { name: 'Coulommes-la-Montagne', postalCode: '51390', lat: 49.2255674, lon: 3.9114772 },
    { name: 'Courcy', postalCode: '51220', lat: 49.3230873, lon: 4.0014265 },
    { name: 'Écueil', postalCode: '51500', lat: 49.1876034, lon: 3.9552457 },
    { name: 'Fresne-lès-Reims', postalCode: '51110', lat: 49.3397069, lon: 4.1024099 },
    { name: 'Gueux', postalCode: '51390', lat: 49.2511954, lon: 3.9102946 },
    { name: 'Hermonville', postalCode: '51220', lat: 49.3355571, lon: 3.9095109 },
    { name: 'Heutrégiville', postalCode: '51110', lat: 49.3260357, lon: 4.263091 },
    { name: 'Isles-sur-Suippe', postalCode: '51110', lat: 49.3548635, lon: 4.199203 },
    { name: 'Jouy-lès-Reims', postalCode: '51390', lat: 49.2155529, lon: 3.9282743 },
    { name: 'Lavannes', postalCode: '51110', lat: 49.3137567, lon: 4.1710463 },
    { name: 'Les Mesneux', postalCode: '51370', lat: 49.2194563, lon: 3.9631738 },
    { name: 'Loivre', postalCode: '51220', lat: 49.3462654, lon: 3.9801594 },
    { name: 'Ludes', postalCode: '51500', lat: 49.1551929, lon: 4.0803069 },
    { name: 'Mailly-Champagne', postalCode: '51500', lat: 49.157657, lon: 4.1112769 },
    { name: 'Merfy', postalCode: '51220', lat: 49.2960704, lon: 3.9474259 },
    { name: 'Montbré', postalCode: '51500', lat: 49.1922424, lon: 4.0413005 },
    { name: 'Nogent-l\'Abbesse', postalCode: '51420', lat: 49.2543803, lon: 4.1571529 },
    { name: 'Ormes', postalCode: '51370', lat: 49.2384907, lon: 3.9569599 },
    { name: 'Pargny-lès-Reims', postalCode: '51390', lat: 49.2199294, lon: 3.9245653 },
    { name: 'Pomacle', postalCode: '51110', lat: 49.3352507, lon: 4.1467008 },
    { name: 'Pouillon', postalCode: '51220', lat: 49.3138671, lon: 3.9491426 },
    { name: 'Prunay', postalCode: '51360', lat: 49.1964785, lon: 4.1828575 },
    { name: 'Puisieulx', postalCode: '51500', lat: 49.1931568, lon: 4.1138683 },
    { name: 'Rilly-la-Montagne', postalCode: '51500', lat: 49.1650534, lon: 4.0446122 },
    { name: 'Sacy', postalCode: '51500', lat: 49.1966285, lon: 3.9484147 },
    { name: 'Saint-Brice-Courcelles', postalCode: '51370', lat: 49.2619631, lon: 3.9866881 },
    { name: 'Saint-Étienne-sur-Suippe', postalCode: '51110', lat: 49.386381, lon: 4.0958518 },
    { name: 'Saint-Léonard', postalCode: '51500', lat: 49.2215519, lon: 4.0968488 },
    { name: 'Saint-Thierry', postalCode: '51220', lat: 49.3043539, lon: 3.9651071 },
    { name: 'Sermiers', postalCode: '51500', lat: 49.1589542, lon: 3.9838279 },
    { name: 'Sillery', postalCode: '51500', lat: 49.1971054, lon: 4.1305935 },
    { name: 'Taissy', postalCode: '51500', lat: 49.2140339, lon: 4.0937014 },
    { name: 'Thil', postalCode: '51220', lat: 49.3154474, lon: 3.9640012 },
    { name: 'Thillois', postalCode: '51370', lat: 49.2543702, lon: 3.9530195 },
    { name: 'Tinqueux', postalCode: '51430', lat: 49.2479272, lon: 3.9861411 },
    { name: 'Trois-Puits', postalCode: '51500', lat: 49.2055167, lon: 4.0392946 },
    { name: 'Val-de-Vesle', postalCode: '51360', lat: 49.1783278, lon: 4.2166514 },
    { name: 'Verzenay', postalCode: '51360', lat: 49.1593602, lon: 4.1443389 },
    { name: 'Ville-Dommange', postalCode: '51390', lat: 49.201079, lon: 3.9346853 },
    { name: 'Villers-Allerand', postalCode: '51500', lat: 49.1660122, lon: 4.0245971 },
    { name: 'Villers-aux-Nœuds', postalCode: '51500', lat: 49.1945838, lon: 3.9973603 },
    { name: 'Villers-Franqueux', postalCode: '51220', lat: 49.3284469, lon: 3.9453038 },
    { name: 'Vrigny', postalCode: '51390', lat: 49.2352884, lon: 3.9118668 },
    { name: 'Warmeriville', postalCode: '51110', lat: 49.3499703, lon: 4.2202414 },
    { name: 'Witry-lès-Reims', postalCode: '51420', lat: 49.2902975, lon: 4.115644 }
  ],
  // Centre used as the origin for the distance bands above.
  agencyCommune: "Reims",
  agencyPostalCode: "51",

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
