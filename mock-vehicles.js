window.AM = window.AM || {};

// Offline fallback catalog. Rendered when PocketBase is unreachable so the site stays
// useful as a catalogue + contact funnel. Names are localized: there are no hardcoded
// user-visible strings anywhere, including here.

AM.mockVehicles = {
  fr: [
    { id: 'mock-1', name: 'Trottinette électrique Cruiser', category: 'scooter', autonomie: 30, poidsMax: 120, pliant: false, pricePerHour: 12, caution: 150,
      description: 'Autonomie 30 km, selle confortable, vitesse maximale 25 km/h.' },
    { id: 'mock-2', name: 'Trottinette électrique Compacte', category: 'scooter', autonomie: 20, poidsMax: 100, pliant: true, pricePerHour: 9, caution: 100,
      description: 'Pliante, légère, idéale pour les trajets courts.' },
    { id: 'mock-3', name: 'Fauteuil roulant pliable Actif', category: 'wheelchair', autonomie: 20, poidsMax: 110, pliant: true, pricePerHour: 15, caution: 200,
      description: 'Pliable, poids léger, freins réglables.' },
    { id: 'mock-4', name: 'Fauteuil roulant Grand Plateau', category: 'wheelchair', autonomie: 15, poidsMax: 140, pliant: false, pricePerHour: 13, caution: 250,
      description: 'Grand plateau, stable pour les longues distances.' }
  ],
  en: [
    { id: 'mock-1', name: 'Cruiser electric scooter', category: 'scooter', autonomie: 30, poidsMax: 120, pliant: false, pricePerHour: 12, caution: 150,
      description: '30 km range, comfortable seat, 25 km/h top speed.' },
    { id: 'mock-2', name: 'Compact electric scooter', category: 'scooter', autonomie: 20, poidsMax: 100, pliant: true, pricePerHour: 9, caution: 100,
      description: 'Folding, lightweight, ideal for short trips.' },
    { id: 'mock-3', name: 'Active folding wheelchair', category: 'wheelchair', autonomie: 20, poidsMax: 110, pliant: true, pricePerHour: 15, caution: 200,
      description: 'Folding, low weight, adjustable brakes.' },
    { id: 'mock-4', name: 'Large-platform wheelchair', category: 'wheelchair', autonomie: 15, poidsMax: 140, pliant: false, pricePerHour: 13, caution: 250,
      description: 'Large platform, stable for long distances.' }
  ],

  get: function (lang) {
    const list = this[lang] || this.fr;
    return list.map(function (v) { return Object.assign({}, v); });
  }
};
