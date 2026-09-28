window.AM = window.AM || {};

// Offline fallback catalog. Rendered when PocketBase is unreachable so the site stays
// useful as a catalogue + contact funnel. Names are localized: there are no hardcoded
// user-visible strings anywhere, including here.

AM.mockVehicles = {
  fr: [
    { id: 'mock-1', name: 'Trottinette électrique Cruiser', description: 'Autonomie 30 km, selle confortable, vitesse maximale 25 km/h.', category: 'scooter', autonomie: 30, poidsMax: 120, pliant: false, pricePerHour: 20, caution: 200, isActive: true },
    { id: 'mock-2', name: 'Trottinette électrique Compacte', description: 'Pliante, légère, idéale pour les trajets courts.', category: 'scooter', autonomie: 20, poidsMax: 130, pliant: true, pricePerHour: 15, caution: 200, isActive: true },
    { id: 'mock-3', name: 'Fauteuil roulant pliable Actif', description: 'Pliable, poids léger, freins réglables.', category: 'wheelchair', autonomie: 20, poidsMax: 120, pliant: true, pricePerHour: 10, caution: 50, isActive: true },
    { id: 'mock-4', name: 'Fauteuil roulant Grand Plateau', description: 'Grand plateau, stable pour les longues distances.', category: 'wheelchair', autonomie: 15, poidsMax: 130, pliant: false, pricePerHour: 13, caution: 150, isActive: false }
  ],
  en: [
    { id: 'mock-1', name: 'Cruiser electric scooter', description: '30 km range, comfortable seat, 25 km/h top speed.', category: 'scooter', autonomie: 30, poidsMax: 120, pliant: false, pricePerHour: 20, caution: 200, isActive: true },
    { id: 'mock-2', name: 'Compact electric scooter', description: 'Folding, lightweight, ideal for short trips.', category: 'scooter', autonomie: 20, poidsMax: 130, pliant: true, pricePerHour: 15, caution: 200, isActive: true },
    { id: 'mock-3', name: 'Active folding wheelchair', description: 'Folding, low weight, adjustable brakes.', category: 'wheelchair', autonomie: 20, poidsMax: 120, pliant: true, pricePerHour: 10, caution: 50, isActive: true },
    { id: 'mock-4', name: 'Large-platform wheelchair', description: 'Large platform, stable for long distances.', category: 'wheelchair', autonomie: 15, poidsMax: 130, pliant: false, pricePerHour: 13, caution: 150, isActive: false }
  ],

  get: function (lang) {
    const list = this[lang] || this.fr;
    return list.map(function (v) { return Object.assign({}, v); });
  }
};
