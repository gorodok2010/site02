window.AM = window.AM || {};

// Europe/Paris <-> UTC helpers. No hardcoded CET/CEST offsets: Paris is UTC+1 in
// winter and UTC+2 in summer, and the offset changes on the DST transition dates.

AM.dates = (function () {
  const TZ = AM.CONFIG.timezone;

  const PARTS = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  };
  const hour12 = false;
  let dtf = null;
  function formatter() {
    if (!dtf) dtf = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour12: hour12, ...PARTS });
    return dtf;
  }

  function parts(instant) {
    const out = {};
    for (const p of formatter().formatToParts(instant)) {
      if (p.type !== 'literal') out[p.type] = p.value;
    }
    return {
      y: Number(out.year), m: Number(out.month), d: Number(out.day),
      H: Number(out.hour) % 24, M: Number(out.minute), S: Number(out.second)
    };
  }

  // Paris UTC offset in ms at a given instant (positive east of UTC).
  function tzOffsetMs(instant) {
    const p = parts(instant);
    const asUtc = Date.UTC(p.y, p.m - 1, p.d, p.H, p.M, p.S);
    return asUtc - instant.getTime();
  }

  // The UTC instant for a Paris wall-clock time. One refinement pass makes it correct
  // across a DST transition, where the naive guess can land on the wrong side.
  function parisWallToUtc(w) {
    const guess = Date.UTC(w.y, w.m - 1, w.d, w.H, w.M, 0);
    const off1 = tzOffsetMs(new Date(guess));
    let t = guess - off1;
    const off2 = tzOffsetMs(new Date(t));
    if (off2 !== off1) t = guess - off2;
    return new Date(t);
  }

  function utcToParisWall(instant) {
    return parts(instant);
  }

  function shiftHour(w, delta) {
    const d = new Date(Date.UTC(w.y, w.m - 1, w.d, w.H, w.M, 0));
    d.setUTCHours(d.getUTCHours() + delta);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), H: d.getUTCHours(), M: d.getUTCMinutes() };
  }

  // The next full Paris hour, strictly after `now`.
  function nextFullHour(now) {
    const w = utcToParisWall(now);
    const ceil = parisWallToUtc({ y: w.y, m: w.m, d: w.d, H: w.H, M: 0 }).getTime();
    if (ceil > now.getTime()) return new Date(ceil);
    return new Date(ceil + 3600000);
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  // "Y-m-d H:i" as seen in Paris — the value bound to the flatpickr inputs.
  function parisToInputValue(instant) {
    if (!instant) return '';
    const w = utcToParisWall(instant);
    return `${w.y}-${pad2(w.m)}-${pad2(w.d)} ${pad2(w.H)}:${pad2(w.M)}`;
  }

  function inputValueToUtc(value) {
    const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(String(value || '').trim());
    if (!m) return null;
    return parisWallToUtc({ y: +m[1], m: +m[2], d: +m[3], H: +m[4], M: +m[5] });
  }

  function isOnTheHour(instant) {
    if (!instant) return false;
    const w = utcToParisWall(instant);
    return w.M === 0;
  }

  function hoursBetween(startUtc, endUtc) {
    if (!startUtc || !endUtc) return 0;
    return (endUtc.getTime() - startUtc.getTime()) / 3600000;
  }

  // Human-readable duration for error messages, e.g. "1 h 30" / "2 h".
  function formatDuration(hours, locale) {
    const total = Math.round(hours * 60);
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h === 0) return m + ' min';
    if (m === 0) return h + ' h';
    const nf = new Intl.NumberFormat(locale, { style: 'unit', unit: 'hour', unitDisplay: 'short' });
    const nfMin = new Intl.NumberFormat(locale, { style: 'unit', unit: 'minute', unitDisplay: 'short' });
    return nf.format(h) + ' ' + nfMin.format(m);
  }

  function formatParis(instant, locale, opts) {
    if (!instant) return '';
    return new Intl.DateTimeFormat(locale, { timeZone: TZ, ...opts }).format(instant);
  }

  return {
    TZ: TZ,
    tzOffsetMs: tzOffsetMs,
    parisWallToUtc: parisWallToUtc,
    utcToParisWall: utcToParisWall,
    shiftHour: shiftHour,
    nextFullHour: nextFullHour,
    parisToInputValue: parisToInputValue,
    inputValueToUtc: inputValueToUtc,
    isOnTheHour: isOnTheHour,
    hoursBetween: hoursBetween,
    formatDuration: formatDuration,
    formatParis: formatParis
  };
})();
