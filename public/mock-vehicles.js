window.AM = window.AM || {};

// Offline fallback catalog. Rendered when PocketBase is unreachable so the site stays
// useful as a catalogue + contact funnel. Names are localized: there are no hardcoded
// user-visible strings anywhere, including here.
//
// Records carry both description languages rather than a pre-localised `description`,
// so they have the same shape as normalizeScooter() output. A single record set serves
// both languages and the resolver picks, which keeps the offline path honest.

AM.mockVehicles = {
  list: [
    {
      id: 'mock-1', category: 'scooter', autonomie: 30, poidsMax: 120, pliant: false,
      pricePerHour: 20, caution: 200, isActive: true,
      nameFr: 'Trottinette électrique Cruiser', nameEn: 'Cruiser electric scooter',
      descriptionFr: 'Autonomie 30 km, selle confortable, vitesse maximale 25 km/h.',
      descriptionEn: '30 km range, comfortable seat, 25 km/h top speed.'
    },
    {
      id: 'mock-2', category: 'scooter', autonomie: 20, poidsMax: 130, pliant: true,
      pricePerHour: 15, caution: 200, isActive: true,
      nameFr: 'Trottinette électrique Compacte', nameEn: 'Compact electric scooter',
      descriptionFr: 'Pliante, légère, idéale pour les trajets courts.',
      descriptionEn: 'Folding, lightweight, ideal for short trips.'
    },
    {
      id: 'mock-3', category: 'wheelchair', autonomie: 20, poidsMax: 120, pliant: true,
      pricePerHour: 10, caution: 50, isActive: true,
      nameFr: 'Fauteuil roulant pliable Actif', nameEn: 'Active folding wheelchair',
      descriptionFr: 'Pliable, poids léger, freins réglables.',
      descriptionEn: 'Folding, low weight, adjustable brakes.'
    },
    {
      id: 'mock-4', category: 'wheelchair', autonomie: 15, poidsMax: 130, pliant: false,
      pricePerHour: 13, caution: 150, isActive: false,
      nameFr: 'Fauteuil roulant Grand Plateau', nameEn: 'Large-platform wheelchair',
      descriptionFr: 'Grand plateau, stable pour les longues distances.',
      descriptionEn: 'Large platform, stable for long distances.'
    }
  ],

  get: function (lang) {
    const en = lang === 'en';
    return this.list.map(function (v) {
      return {
        id: v.id,
        name: en ? v.nameEn : v.nameFr,
        descriptionFr: v.descriptionFr,
        descriptionEn: v.descriptionEn,
        category: v.category,
        autonomie: v.autonomie,
        poidsMax: v.poidsMax,
        pliant: v.pliant,
        pricePerHour: v.pricePerHour,
        caution: v.caution,
        isActive: v.isActive
      };
    });
  }
};
