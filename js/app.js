window.AM = window.AM || {};

// Bootstrap, render, event wiring. No business logic here: that lives in filters.js,
// api.js, dates.js and i18n.js.

(function () {
  const CFG = AM.CONFIG;
  const i18n = AM.i18n;
  const filters = AM.filters;

  const state = {
    vehicles: [],
    offline: false,
    drawerOpen: false
  };

  const dom = {};

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

  // --- static values that must not be duplicated in the markup -----------------

  function applyStaticValues() {
    const tel = 'tel:' + CFG.phone.replace(/[^+\d]/g, '');
    [dom.headerCall, dom.bannerCall, dom.footerCall].forEach(function (a) {
      if (a) a.href = tel;
    });
    [dom.headerWhatsapp, dom.bannerWhatsapp].forEach(function (a) {
      if (a) a.href = CFG.whatsapp;
    });
    if (dom.footerEmail) {
      dom.footerEmail.href = 'mailto:' + CFG.contactEmail;
      dom.footerEmail.textContent = CFG.contactEmail;
    }
    if (dom.footerAddress) dom.footerAddress.textContent = CFG.storeAddress;
    if (dom.footerCompany) {
      dom.footerCompany.textContent = CFG.legal.company;
      dom.footerRights.textContent = '© ' + new Date().getFullYear() + ' ' + CFG.legal.company + '. ' + i18n.t('footer.rights');
    }
    if (dom.footerIdentity) {
      dom.footerIdentity.textContent =
        'SIREN ' + CFG.legal.siren + ' · SIRET ' + CFG.legal.siret;
    }
    if (dom.filtersPanel) dom.filtersPanel.setAttribute('aria-label', i18n.t('filters.title'));
  }

  // --- chrome ------------------------------------------------------------------

  function renderLangToggle() {
    const active = i18n.get();
    Array.prototype.forEach.call(dom.langToggle.querySelectorAll('button'), function (btn) {
      const on = btn.getAttribute('data-lang') === active;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.className =
        'px-3 py-2 text-sm font-semibold border-l border-slate-300 first:border-l-0 ' +
        (on ? 'bg-blue-700 text-white' : 'bg-white text-slate-700 hover:bg-slate-100');
    });
  }

  function renderTabs() {
    const s = filters.state();
    clear(dom.tabs);
    ['scooter', 'wheelchair'].forEach(function (cat) {
      const on = cat === s.category;
      const btn = el('button', {
        type: 'button',
        role: 'tab',
        attrs: { 'aria-selected': on ? 'true' : 'false', 'data-category': cat },
        class:
          'px-4 py-2 text-sm font-semibold ' +
          (on ? 'bg-blue-700 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'),
        text: i18n.t('category.' + cat),
        onclick: function () {
          if (cat === s.category) return;
          filters.setCategory(cat);
          render();
        }
      });
      dom.tabs.appendChild(btn);
    });
  }

  function renderFiltersPanel() {
    const s = filters.state();
    const panel = dom.filtersPanel;
    clear(panel);

    // Autonomie — checkboxes, multi-select OR, ">=" semantics.
    // Scooter tab only: a wheelchair is pushed by hand, so range is meaningless
    // there. Removed from the DOM rather than hidden, so it can never be active.
    if (s.category === 'scooter') {
      const aut = el('fieldset', { class: 'mb-5' }, [
        el('legend', { class: 'text-sm font-semibold mb-2', text: i18n.t('filters.autonomie') })
      ]);
      i18n.AUTONOMIE_OPTIONS.forEach(function (km) {
        const id = 'aut-' + km;
        const input = el('input', {
          type: 'checkbox',
          id: id,
          class: 'w-5 h-5 rounded border-slate-400',
          checked: s.autonomie.indexOf(km) !== -1,
          attrs: { 'data-autonomie': km },
          onchange: function () { filters.toggleAutonomie(km); render(); }
        });
        aut.appendChild(
          el('label', { attrs: { for: id }, class: 'flex items-center gap-3 py-1.5 text-sm cursor-pointer' }, [
            input,
            el('span', { text: i18n.t('filters.autonomieUpTo', { km: km }) })
          ])
        );
      });
      aut.appendChild(
        el('p', { class: 'text-xs text-slate-500 mt-1', text: i18n.t('filters.autonomieHint') })
      );
      panel.appendChild(aut);
    }

    // Poids max — single-select radio. There is deliberately no "any" option:
    // unselecting everything is what means "no constraint", and the reset button
    // gets you back there.
    const poids = el('fieldset', { class: 'mb-5' }, [
      el('legend', { class: 'text-sm font-semibold mb-2', text: i18n.t('filters.poids') })
    ]);
    i18n.POIDS_BRACKETS.forEach(function (b, idx) {
      const id = 'poids-' + idx;
      const on = !!s.poidsBracket && s.poidsBracket.min === b.min && s.poidsBracket.max === b.max;
      poids.appendChild(
        el('label', { attrs: { for: id }, class: 'flex items-center gap-3 py-1.5 text-sm cursor-pointer' }, [
          el('input', {
            type: 'radio', name: 'poids', id: id, class: 'w-5 h-5', checked: on,
            attrs: { 'data-poids': b.min + '-' + b.max },
            onchange: function () { filters.setPoidsBracket(b); render(); }
          }),
          el('span', { text: b.min + '–' + b.max + ' kg' })
        ])
      );
    });
    panel.appendChild(poids);

    // Pliant — wheelchair only. Removed from the DOM on the scooter tab rather than
    // hidden, so it can never be submitted as an active filter there.
    if (s.category === 'wheelchair') {
      const id = 'pliant';
      panel.appendChild(
        el('div', { class: 'mb-5' }, [
          el('label', { attrs: { for: id }, class: 'flex items-center gap-3 py-1.5 text-sm cursor-pointer' }, [
            el('input', {
              type: 'checkbox', id: id, class: 'w-5 h-5', checked: s.pliant,
              onchange: function () { filters.setPliant(this.checked); render(); }
            }),
            el('span', { text: i18n.t('filters.pliant') })
          ])
        ])
      );
    }

    panel.appendChild(
      el('button', {
        type: 'button',
        class: 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100',
        text: i18n.t('filters.reset'),
        onclick: function () { filters.reset(); render(); }
      })
    );
  }

  function renderDrawer() {
    const open = state.drawerOpen;
    dom.filtersBackdrop.hidden = !open;
    if (open) {
      dom.filtersPanel.className =
        'fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm overflow-y-auto bg-white p-5 shadow-xl';
    } else {
      dom.filtersPanel.className =
        'hidden lg:block lg:sticky lg:top-24 lg:self-start rounded-xl border border-slate-200 bg-white p-4';
    }
    document.body.classList.toggle('overflow-hidden', open);
  }

  function renderFilterBadge() {
    const n = filters.activeCount();
    dom.filterBadge.hidden = n === 0;
    dom.filterBadge.textContent = String(n);
  }

  // --- catalog -----------------------------------------------------------------

  function renderSkeletons() {
    clear(dom.grid);
    dom.grid.setAttribute('aria-busy', 'true');
    for (let i = 0; i < 6; i++) {
      dom.grid.appendChild(
        el('div', { class: 'rounded-xl border border-slate-200 bg-white p-4' }, [
          el('div', { class: 'skeleton h-40 w-full rounded-lg mb-4' }),
          el('div', { class: 'skeleton h-4 w-3/4 rounded mb-2' }),
          el('div', { class: 'skeleton h-3 w-1/2 rounded mb-4' }),
          el('div', { class: 'skeleton h-9 w-full rounded' })
        ])
      );
    }
    const sr = el('span', { class: 'visually-hidden', text: i18n.t('catalog.loading') });
    dom.grid.appendChild(sr);
  }

  function specRow(label, value) {
    if (value === null || value === undefined || value === '') return null;
    return el('div', { class: 'flex justify-between text-sm py-0.5' }, [
      el('span', { class: 'text-slate-500', text: label }),
      el('span', { class: 'font-medium', text: value })
    ]);
  }

  function specNumber(value, suffix) {
    if (value === null || value === 0) return '—';
    return value + suffix;
  }

  function renderCard(v) {
    const img = el('img', {
      alt: i18n.t('catalog.imageAlt', { name: v.name }),
      loading: 'lazy',
      class: 'h-40 w-full object-cover rounded-lg bg-slate-100',
      onerror: function () {
        this.onerror = null;
        this.src = CFG.fallbackImage;
      }
    });
    img.src = v.image || CFG.fallbackImage;

    const specs = [
      specRow(i18n.t('catalog.autonomie'), specNumber(v.autonomie, ' km')),
      specRow(i18n.t('catalog.poids'), specNumber(v.poidsMax, ' kg'))
    ].filter(Boolean);

    // An inactive vehicle stays in the grid, greyed and labelled, so the catalogue
    // does not look like it is hiding stock. Hidden items invite a support call.
    const inactive = !v.isActive;

    // Selection is not wired until Stage B. Labelled, disabled, and obviously inert —
    // never a dead unlabelled button.
    const cta = el('button', {
      type: 'button',
      disabled: true,
      'aria-disabled': 'true',
      class: 'w-full rounded-lg px-3 py-2.5 text-sm font-semibold cursor-not-allowed ' +
        (inactive ? 'bg-slate-100 text-slate-400' : 'bg-slate-200 text-slate-500'),
      attrs: { title: inactive ? i18n.t('catalog.inactive') : i18n.t('catalog.soonHint') },
      text: inactive ? i18n.t('catalog.inactive') : i18n.t('catalog.soon')
    });

    return el('article', {
      class: 'rounded-xl border border-slate-200 bg-white p-4 flex flex-col' +
        (inactive ? ' opacity-60' : '')
    }, [
      img,
      el('h3', { class: 'mt-3 font-semibold leading-snug', text: v.name }),
      v.description ? el('p', { class: 'mt-1 text-sm text-slate-500', text: v.description }) : null,
      el('div', { class: 'mt-2 flex flex-wrap gap-1' }, [
        el('span', { class: 'rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600', text: i18n.t('category.' + v.category) }),
        v.pliant ? el('span', { class: 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800', text: i18n.t('catalog.pliant') }) : null,
        inactive ? el('span', { class: 'rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900 font-semibold', text: i18n.t('catalog.inactive') }) : null
      ]),
      el('div', { class: 'mt-3' }, specs),
      el('div', { class: 'mt-3 pt-3 border-t border-slate-100 flex items-baseline gap-1' }, [
        el('span', { class: 'text-xl font-bold', text: v.pricePerHour === null ? '—' : i18n.money(v.pricePerHour) }),
        el('span', { class: 'text-sm text-slate-500', text: i18n.t('catalog.perHour') })
      ]),
      el('div', { class: 'mt-4 pt-1' }, [cta])
    ]);
  }

  function renderCatalog() {
    const visible = filters.apply(state.vehicles);
    clear(dom.grid);
    dom.grid.setAttribute('aria-busy', 'false');

    dom.count.textContent = i18n.t('catalog.count', { count: visible.length });

    if (!visible.length) {
      dom.grid.appendChild(
        el('div', { class: 'sm:col-span-2 xl:col-span-3 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center' }, [
          el('p', { class: 'font-medium', text: i18n.t('catalog.empty') }),
          el('p', { class: 'mt-1 text-sm text-slate-500', text: i18n.t('catalog.emptyHint') }),
          el('button', {
            type: 'button',
            class: 'mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-100',
            text: i18n.t('filters.reset'),
            onclick: function () { filters.reset(); render(); }
          })
        ])
      );
      return;
    }

    visible.forEach(function (v) { dom.grid.appendChild(renderCard(v)); });
  }

  // --- offline -----------------------------------------------------------------

  function enterOffline() {
    state.offline = true;
    state.vehicles = AM.mockVehicles.get(i18n.get());
    dom.banner.hidden = false;
    render();
  }

  // --- render ------------------------------------------------------------------

  function render() {
    renderLangToggle();
    renderTabs();
    renderFiltersPanel();
    renderFilterBadge();
    renderDrawer();
    renderCatalog();
    applyStaticValues();
    i18n.applyI18n(document);
  }

  function setLang(lang) {
    i18n.set(lang);
    document.querySelector('meta[property="og:locale"]').setAttribute('content', lang === 'fr' ? 'fr_FR' : 'en_US');
    if (state.offline) state.vehicles = AM.mockVehicles.get(lang);
    render();
  }

  function wire() {
    dom.langToggle.addEventListener('click', function (e) {
      const btn = e.target.closest('button[data-lang]');
      if (btn) setLang(btn.getAttribute('data-lang'));
    });

    dom.sortSelect.addEventListener('change', function () {
      filters.setSort(this.value);
      render();
    });

    dom.openFilters.addEventListener('click', function () {
      state.drawerOpen = true;
      renderDrawer();
      const first = dom.filtersPanel.querySelector('input, button');
      if (first) first.focus();
    });

    dom.filtersBackdrop.addEventListener('click', function () {
      state.drawerOpen = false;
      renderDrawer();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.drawerOpen) {
        state.drawerOpen = false;
        renderDrawer();
        dom.openFilters.focus();
      }
    });
  }

  // Explicit id -> property map. Deriving property names from ids is how
  // `dom.backdrop`/`dom.grid` end up undefined, so the mapping is written out.
  const DOM_IDS = {
    banner: 'offline-banner',
    headerCall: 'header-call',
    headerWhatsapp: 'header-whatsapp',
    bannerCall: 'banner-call',
    bannerWhatsapp: 'banner-whatsapp',
    langToggle: 'lang-toggle',
    tabs: 'category-tabs',
    sortSelect: 'sort-select',
    openFilters: 'open-filters',
    filterBadge: 'filter-count-badge',
    filtersPanel: 'filters-panel',
    filtersBackdrop: 'filters-backdrop',
    count: 'catalog-count',
    grid: 'catalog-grid',
    footerAddress: 'footer-address',
    footerCall: 'footer-call',
    footerEmail: 'footer-email',
    footerCompany: 'footer-company',
    footerIdentity: 'footer-identity',
    footerRights: 'footer-rights'
  };

  function cacheDom() {
    Object.keys(DOM_IDS).forEach(function (key) {
      const node = document.getElementById(DOM_IDS[key]);
      if (!node) throw new Error('Missing element #' + DOM_IDS[key]);
      dom[key] = node;
    });
  }

  function init() {
    cacheDom();
    i18n.init();
    wire();
    filters.reset();
    dom.sortSelect.value = filters.state().sort;
    render();
    renderSkeletons();

    AM.api.fetchCatalog()
      .then(function (vehicles) {
        state.vehicles = vehicles;
        dom.banner.hidden = true;
        render();
      })
      .catch(function (err) {
        enterOffline();
        return err;
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
