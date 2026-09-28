window.AM = window.AM || {};

// Filter state plus pure filter functions. No DOM, no side effects: everything here
// is a function of (vehicles, state) so the behaviour is testable in isolation.

AM.filters = (function () {
  const i18n = AM.i18n;

  function defaultState() {
    return {
      category: 'scooter',
      autonomie: [],          // [], [15], [20], [30] — OR, ">=" semantics. Scooter tab only.
      poidsBracket: null,     // null = any; otherwise {min, max}
      pliant: false,
      sort: 'price_asc'
    };
  }

  function state() {
    if (!current) current = defaultState();
    return current;
  }

  let current = null;

  // Changing category resets everything else: `pliant` is wheelchair-only, and keeping
  // it on the scooter tab produces a plausible-looking empty grid with no explanation.
  // Sort is a presentation choice, not a category filter, so it survives.
  function setCategory(category) {
    const sort = state().sort;
    current = defaultState();
    current.category = category === 'wheelchair' ? 'wheelchair' : 'scooter';
    current.sort = sort;
    return current;
  }

  function setSort(sort) {
    state().sort = sort;
    return state();
  }

  function toggleAutonomie(km) {
    const s = state();
    const i = s.autonomie.indexOf(km);
    if (i === -1) s.autonomie.push(km); else s.autonomie.splice(i, 1);
    s.autonomie.sort(function (a, b) { return a - b; });
    return s;
  }

  function setPoidsBracket(bracket) {
    state().poidsBracket = bracket;
    return state();
  }

  function setPliant(value) {
    state().pliant = value === true;
    return state();
  }

  function reset() {
    const sort = state().sort;
    current = defaultState();
    current.sort = sort;
    return current;
  }

  // "Up to N km" is a FLOOR, not a ceiling: the customer needs a vehicle that can
  // cover the distance, so the vehicle's range must be at least the ticked value.
  // Multi-select OR, so ticking 15 and 30 means "15 km or more".
  function matchesAutonomie(v, selected) {
    if (!selected.length) return true;
    if (v.autonomie === null) return false;
    for (let i = 0; i < selected.length; i++) {
      if (v.autonomie >= selected[i]) return true;
    }
    return false;
  }

  // `poidsMax` is what the vehicle can CARRY, while the bracket is a passenger's
  // weight. The question is therefore "can this vehicle take someone from this
  // range?", which any vehicle rated at or above the top of the range can answer —
  // the same "at least" logic as the range filter.
  //
  // So 50-119 keeps a 150 kg vehicle (it can carry a 119 kg passenger too), and
  // 120-150 drops a 119 kg one (it cannot carry a 150 kg passenger). Brackets stay
  // closed and non-overlapping, so ticking both means "119 kg or more".
  function matchesPoids(v, bracket) {
    if (!bracket) return true;
    if (v.poidsMax === null) return false;
    return v.poidsMax >= bracket.max;
  }

  function matchesPliant(v, pliant) {
    if (!pliant) return true;
    return v.pliant === true;
  }

  function sortKeyPrice(v) {
    return v.pricePerHour === null ? Infinity : v.pricePerHour;
  }

  // Only two sort orders remain. Name is still the tie-break, so equal prices keep a
  // stable, readable order instead of whatever the API happened to return.
  function compare(a, b) {
    const pa = sortKeyPrice(a);
    const pb = sortKeyPrice(b);
    if (pa === pb) return a.name.localeCompare(b.name, i18n.get());
    return state().sort === 'price_desc' ? pb - pa : pa - pb;
  }

  function apply(vehicles) {
    const s = state();
    const out = [];
    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      if (v.category !== s.category) continue;
      // Range is a scooter-only concept. Gating on the category here as well as in the
      // UI means a stale selection can never silently empty the wheelchair tab.
      if (s.category === 'scooter' && !matchesAutonomie(v, s.autonomie)) continue;
      if (!matchesPoids(v, s.poidsBracket)) continue;
      if (!matchesPliant(v, s.pliant)) continue;
      out.push(v);
    }
    out.sort(compare);
    return out;
  }

  function activeCount() {
    const s = state();
    let n = 0;
    if (s.category === 'scooter' && s.autonomie.length) n += 1;
    if (s.poidsBracket) n += 1;
    if (s.pliant) n += 1;
    return n;
  }

  return {
    defaultState: defaultState,
    state: state,
    setCategory: setCategory,
    setSort: setSort,
    toggleAutonomie: toggleAutonomie,
    setPoidsBracket: setPoidsBracket,
    setPliant: setPliant,
    reset: reset,
    apply: apply,
    activeCount: activeCount,
    matchesPoids: matchesPoids,
    matchesAutonomie: matchesAutonomie
  };
})();
