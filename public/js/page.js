window.AM = window.AM || {};

// Shared chrome for the static pages (FAQ, CGV, privacy, legal).
//
// These pages are deliberately almost empty HTML: header, footer, language toggle
// and the page body are all rendered from here, so the four pages do not carry
// four copies of the same markup that drift apart the moment a label changes.

(function () {
  const CFG = AM.CONFIG;
  const i18n = AM.i18n;

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

  function langToggle() {
    const wrap = el('div', {
      attrs: { id: 'lang-toggle', role: 'group' },
      class: 'inline-flex rounded-lg border border-slate-300 overflow-hidden'
    });
    ['fr', 'en'].forEach(function (code, i) {
      wrap.appendChild(el('button', {
        type: 'button',
        text: i18n.t('lang.' + code),
        attrs: { 'data-lang': code, 'aria-pressed': String(code === i18n.get()) },
        onclick: function () { if (code !== i18n.get()) { i18n.set(code); location.reload(); } }
      }));
    });
    return wrap;
  }

  function header() {
    const tel = 'tel:' + CFG.phone.replace(/[^+\d]/g, '');
    return el('header', { class: 'bg-white border-b border-slate-200 no-print' }, [
      el('div', { class: 'mx-auto max-w-3xl px-4 py-3 flex items-center gap-3 flex-wrap' }, [
        el('a', { attrs: { href: 'index.html' }, class: 'flex items-center gap-2 mr-auto' }, [
          el('span', { class: 'w-9 h-9 rounded-lg bg-blue-700 text-white grid place-items-center font-bold', text: 'A', attrs: { 'aria-hidden': 'true' } }),
          el('span', { class: 'leading-tight' }, [
            el('span', { class: 'block font-semibold', text: i18n.t('brand.name') }),
            el('span', { class: 'block text-xs text-slate-500', text: i18n.t('brand.tagline') })
          ])
        ]),
        el('a', { attrs: { href: tel }, class: 'rounded-lg bg-blue-700 text-white px-3 py-2 text-sm font-semibold hover:bg-blue-800', text: i18n.t('nav.call') }),
        el('a', {
          attrs: { href: CFG.whatsapp, target: '_blank', rel: 'noopener noreferrer' },
          class: 'hidden sm:inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100',
          text: i18n.t('nav.whatsapp')
        }),
        langToggle()
      ])
    ]);
  }

  function footer() {
    const link = function (href, key) {
      return el('a', { attrs: { href: href }, class: 'text-blue-700 underline', text: i18n.t(key) });
    };
    return el('footer', { class: 'bg-white border-t border-slate-200 mt-12 no-print' }, [
      el('div', { class: 'mx-auto max-w-3xl px-4 py-8 grid gap-6 sm:grid-cols-3 text-sm' }, [
        el('div', {}, [
          el('p', { class: 'font-semibold', text: i18n.t('footer.contact') }),
          el('p', { class: 'mt-2 text-slate-600', text: CFG.storeAddress }),
          el('p', { class: 'text-slate-600' }, [
            el('a', { attrs: { href: 'tel:' + CFG.phone.replace(/[^+\d]/g, '') }, class: 'text-blue-700 underline', text: i18n.t('nav.call') }),
            ' · ',
            el('a', { attrs: { href: 'mailto:' + CFG.contactEmail }, class: 'text-blue-700 underline', text: CFG.contactEmail })
          ])
        ]),
        el('div', {}, [
          el('p', { class: 'font-semibold', text: CFG.legal.company }),
          el('p', { class: 'mt-2 text-slate-600', text: 'SIREN ' + CFG.legal.siren }),
          el('p', { class: 'text-slate-600', text: 'SIRET ' + CFG.legal.siret })
        ]),
        el('div', {}, [
          el('nav', { class: 'flex flex-col gap-1' }, [
            link('faq.html', 'footer.faq'),
            link('cgv.html', 'footer.terms'),
            link('confidentialite.html', 'footer.privacy'),
            link('mentions-legales.html', 'footer.legal')
          ]),
          el('p', { class: 'mt-3 text-slate-500', text: i18n.t('footer.dataUse') })
        ])
      ]),
      el('div', { class: 'border-t border-slate-200' }, [
        el('p', {
          class: 'mx-auto max-w-3xl px-4 py-4 text-xs text-slate-500',
          text: '© ' + new Date().getFullYear() + ' ' + CFG.legal.company + '. ' + i18n.t('footer.rights')
        })
      ])
    ]);
  }

  // --- page bodies ------------------------------------------------------------

  function draftNotice() {
    return el('p', { class: 'rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm p-4', text: i18n.t('pages.draftNotice') });
  }

  function section(pageKey) {
    const data = i18n.DICT[i18n.get()][pageKey] || {};
    return {
      title: data.title || pageKey,
      intro: data.intro || '',
      sections: Array.isArray(data.sections) ? data.sections : []
    };
  }

  function renderFaq() {
    const data = i18n.DICT[i18n.get()].faq || {};
    const items = Array.isArray(data.items) ? data.items : [];
    return [
      el('h1', { class: 'text-3xl font-bold tracking-tight', text: data.title || 'FAQ' }),
      el('p', { class: 'mt-3 text-slate-600', text: data.intro || '' }),
      el('div', { class: 'mt-8 space-y-3' }, items.map(function (item) {
        return el('details', { class: 'rounded-lg border border-slate-200 bg-white p-4' }, [
          el('summary', { class: 'cursor-pointer font-medium', text: item.q }),
          el('p', { class: 'mt-2 text-slate-600', text: item.a })
        ]);
      })),
      el('p', { class: 'mt-8 text-slate-600' }, [
        (data.stillStuck || '') + ' ',
        el('a', { attrs: { href: 'tel:' + CFG.phone.replace(/[^+\d]/g, '') }, class: 'text-blue-700 underline', text: CFG.phone })
      ])
    ];
  }

  function renderLegal(pageKey) {
    const data = section(pageKey);
    return [
      el('h1', { class: 'text-3xl font-bold tracking-tight', text: data.title }),
      el('p', { class: 'mt-3 text-slate-600', text: data.intro }),
      draftNotice(),
      el('div', { class: 'mt-8 space-y-6' }, data.sections.map(function (s) {
        return el('section', {}, [
          el('h2', { class: 'text-lg font-semibold', text: s.h }),
          el('div', { class: 'mt-2 space-y-2' }, (s.p || []).map(function (para) {
            return el('p', { class: 'text-slate-600', text: para });
          }))
        ]);
      }))
    ];
  }

  const RENDERERS = { faq: renderFaq, cgv: 'cgv', privacy: 'privacy', legal: 'legal' };

  function renderBody() {
    const key = document.body.getAttribute('data-page');
    const host = document.getElementById('page-body');
    if (!host || !key) return;
    const target = RENDERERS[key];
    if (!target) return;
    const nodes = typeof target === 'function' ? target() : renderLegal(target);
    nodes.forEach(function (n) { host.appendChild(n); });
  }

  function init() {
    i18n.init();
    i18n.applyI18n(document);
    const head = document.getElementById('chrome-header');
    const foot = document.getElementById('chrome-footer');
    if (head) head.appendChild(header());
    if (foot) foot.appendChild(footer());
    renderBody();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
