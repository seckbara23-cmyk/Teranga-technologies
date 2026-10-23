/* ============================================================
   Teranga Technologies — Main Script
   Pages are static and already in the right language (/ and /fr).
   This script only adds behaviour:
   - Language preference and redirects (?lang=, saved choice, browser)
   - Old one-page links (/#services …) sent to the new pages
   - Mobile navigation
   - Hero demo animation (Radiora reporting flow)
   - Discovery form → /api/contact (validation, fallback, attribution)
   - Entrance motion (respects reduced motion)
   - Conversion events (forwarded to analytics if one is installed)
   ============================================================ */

(function () {
  'use strict';

  var NB = ' '; // non-breaking space for French punctuation
  var lang = document.documentElement.lang === 'fr' ? 'fr' : 'en';
  var page = document.body.getAttribute('data-page') || '';

  // Messages created at runtime. Everything else is already in the page's language.
  var MESSAGES = {
    en: {
      menuOpen:  'Open menu',
      menuClose: 'Close menu',
      structuring: 'Structuring',
      ready: 'Ready for review',
      formTitle: 'Request a discovery call',
      sending: 'Sending…',
      vName:    'Enter your name.',
      vEmail:   'Enter a valid email address, like name@company.com.',
      vService: 'Choose the service closest to your need.',
      vMessage: 'Tell us in a few words what you want to achieve (at least 10 characters).',
      success:  'Request sent. We aim to reply within one business day to schedule your discovery call.',
      error:    'We couldn’t send your request, but your message is not lost. Send it to <a href="mailto:seckbara23@gmail.com" data-fallback="email">seckbara23@gmail.com</a> or on <a href="https://wa.me/221707157070" target="_blank" rel="noopener noreferrer" data-fallback="whatsapp">WhatsApp</a>: both open with your message already filled in.'
    },
    fr: {
      menuOpen:  'Ouvrir le menu',
      menuClose: 'Fermer le menu',
      structuring: 'Structuration',
      ready: 'Prêt pour relecture',
      formTitle: 'Demander un appel découverte',
      sending: 'Envoi…',
      vName:    'Indiquez votre nom.',
      vEmail:   'Indiquez une adresse e-mail valide, par exemple nom@entreprise.com.',
      vService: 'Choisissez le service le plus proche de votre besoin.',
      vMessage: 'Décrivez en quelques mots ce que vous voulez obtenir (10' + NB + 'caractères minimum).',
      success:  'Demande envoyée. Nous nous efforçons de vous répondre sous un jour ouvré pour planifier votre appel découverte.',
      error:    'Votre demande n’a pas pu être envoyée, mais votre message n’est pas perdu. Envoyez-le à <a href="mailto:seckbara23@gmail.com" data-fallback="email">seckbara23@gmail.com</a> ou sur <a href="https://wa.me/221707157070" target="_blank" rel="noopener noreferrer" data-fallback="whatsapp">WhatsApp</a>' + NB + ': les deux s’ouvrent avec votre message déjà rempli.'
    }
  };
  var M = MESSAGES[lang];

  // ── Storage helpers (storage can be blocked) ───────────────
  function store(key, val) {
    try {
      if (val === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, val);
    } catch { /* ignore */ }
    return null;
  }

  function session(key, val) {
    try {
      if (val === undefined) return window.sessionStorage.getItem(key);
      if (val === null) window.sessionStorage.removeItem(key);
      else window.sessionStorage.setItem(key, val);
    } catch { /* ignore */ }
    return null;
  }

  // ── Analytics bridge (no-op unless an analytics script exists) ─
  function track(name, props) {
    props = props || {};
    try {
      if (typeof window.va === 'function') window.va('event', { name: name, data: props });
      if (typeof window.plausible === 'function') window.plausible(name, { props: props });
      if (Array.isArray(window.dataLayer)) window.dataLayer.push(Object.assign({ event: name }, props));
    } catch { /* ignore */ }
  }

  // ── Language: ?lang= → saved choice → browser (English pages only) ─
  // The other language's URL comes from the page's hreflang link, so this works on any host.
  function altPath(l) {
    var link = document.querySelector('link[rel="alternate"][hreflang="' + l + '"]');
    if (!link) return null;
    try { return new URL(link.href).pathname; } catch { return null; }
  }

  function prefersFrench() {
    var prefs = navigator.languages || [navigator.language || 'en'];
    for (var i = 0; i < prefs.length; i++) {
      var p = String(prefs[i]).toLowerCase();
      if (p.indexOf('fr') === 0) return true;
      if (p.indexOf('en') === 0) return false;
    }
    return false;
  }

  function redirectForLanguage() {
    var params = new URLSearchParams(window.location.search);
    var asked = params.get('lang');
    var want = null;
    if (asked === 'fr' || asked === 'en') {
      store('tt-lang', asked);
      want = asked;
    } else {
      var saved = store('tt-lang');
      if (saved === 'fr' || saved === 'en') want = saved;
      else if (lang === 'en' && prefersFrench()) want = 'fr';
    }
    if (!want || want === lang) return false;
    var target = altPath(want);
    if (!target) return false;
    params.delete('lang');
    var qs = params.toString();
    window.location.replace(target + (qs ? '?' + qs : '') + window.location.hash);
    return true;
  }

  // Links from the previous one-page site (/#services, /#work-radiora …) now live on their own pages.
  var LEGACY_HASHES = {
    'services': ['services'], 'svc-saas': ['services', 'saas'], 'svc-ai': ['services', 'ai'],
    'svc-webapp': ['services', 'web-applications'], 'svc-mobile': ['services', 'mobile-apps'],
    'svc-design': ['services', 'websites'], 'ai': ['ai-engineering'], 'work': ['work'],
    'work-radiora': ['work', 'radiora'], 'work-edusen': ['work', 'edusen'],
    'faq': ['contact', 'faq'], 'contact': ['contact']
  };

  function redirectLegacyHash() {
    if (page !== 'home') return false;
    var target = LEGACY_HASHES[window.location.hash.slice(1)];
    if (!target) return false;
    var prefix = lang === 'fr' ? '/fr' : '';
    window.location.replace(prefix + '/' + target[0] + window.location.search + (target[1] ? '#' + target[1] : ''));
    return true;
  }

  if (redirectForLanguage() || redirectLegacyHash()) return;

  // ── Lead source (campaign tags and referring site only) ─────
  // Kept for the visit so a lead can be attributed even if the form is sent from another page.
  function leadSource() {
    var src = {};
    try {
      var params = new URLSearchParams(window.location.search);
      ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) {
        if (params.get(k)) src[k] = params.get(k).slice(0, 100);
      });
      var ref = document.referrer ? new URL(document.referrer).hostname : '';
      if (ref && ref !== window.location.hostname) src.referrer = ref;
    } catch { /* ignore */ }
    if (Object.keys(src).length) session('tt-src', JSON.stringify(src));
    else {
      try { src = JSON.parse(session('tt-src') || '{}'); } catch { src = {}; }
    }
    return src;
  }

  var source = leadSource();

  // ── Language links: remember the choice, keep a form draft ─
  document.querySelectorAll('[data-lang-link]').forEach(function (a) {
    a.addEventListener('click', function () {
      var next = a.getAttribute('data-lang-link');
      store('tt-lang', next);
      track('language_switch', { lang: next });
      saveDraft();
    });
  });

  // ── Mobile menu ────────────────────────────────────────────
  var menuToggle = document.getElementById('menu-toggle');
  var mobileNav  = document.getElementById('mobile-nav');

  function menuOpen() { return menuToggle && menuToggle.getAttribute('aria-expanded') === 'true'; }

  function setMenu(open, returnFocus) {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? M.menuClose : M.menuOpen);
    mobileNav.hidden = !open;
    if (!open && returnFocus) menuToggle.focus();
  }

  function initMenu() {
    if (!menuToggle || !mobileNav) return;
    menuToggle.addEventListener('click', function () { setMenu(!menuOpen()); });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuOpen()) setMenu(false, true);
    });
    window.matchMedia('(min-width: 1241px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  // ── Hero demo ──────────────────────────────────────────────
  function initDemo(root) {
    var timers = [];
    var state = 'idle';

    function q(sel) { return root.querySelector(sel); }

    function setStatus(s, label) {
      var pill = q('.demo-status');
      var text = q('.demo-status-text');
      if (!pill || !text) return;
      pill.setAttribute('data-state', s);
      if (label) text.textContent = label;
    }

    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

    function finish() {
      timers.forEach(clearTimeout);
      timers = [];
      root.classList.remove('demo-armed');
      setStatus('ready', M.ready);
      state = 'done';
    }

    function play() {
      if (state !== 'idle') return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }

      state = 'playing';
      var transcript = q('.demo-transcript');
      var words = transcript.textContent.split(/(\s+)/);
      transcript.innerHTML = words.map(function (w) {
        return /^\s+$/.test(w) ? w : '<span class="w">' + w.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span>';
      }).join('');
      root.classList.add('demo-armed');

      var spans = transcript.querySelectorAll('.w');
      var step = 55;
      spans.forEach(function (s, i) { later(function () { s.classList.add('is-in'); }, 250 + i * step); });

      var t0 = 250 + spans.length * step + 300;
      later(function () { setStatus('structuring', M.structuring); }, t0);
      root.querySelectorAll('.demo-row').forEach(function (row, i) {
        later(function () { row.classList.add('is-in'); }, t0 + 500 + i * 420);
      });
      later(function () {
        var s = q('.demo-signoff');
        if (s) s.classList.add('is-in');
      }, t0 + 500 + 4 * 420 + 200);
      later(finish, t0 + 500 + 4 * 420 + 900);
    }

    if (!('IntersectionObserver' in window)) { play(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); play(); }
    }, { threshold: 0.35 });
    io.observe(root);
  }

  // ── Entrance motion: only elements below the fold, never content already on screen ─
  function initReveal() {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-revealed');
        e.target.classList.remove('reveal-pending');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    var fold = window.innerHeight;
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      if (el.getBoundingClientRect().top < fold) return;
      el.classList.add('reveal-pending');
      io.observe(el);
    });
  }

  // ── CTA tracking ───────────────────────────────────────────
  function initCtas() {
    document.querySelectorAll('[data-cta]').forEach(function (el) {
      el.addEventListener('click', function () {
        track('cta_click', { location: el.getAttribute('data-cta'), service: el.getAttribute('data-service') || '' });
      });
    });
  }

  // ── Discovery form ─────────────────────────────────────────
  var form = document.getElementById('contact-form');
  var fields = form ? {
    name:    form.querySelector('#f-name'),
    email:   form.querySelector('#f-email'),
    company: form.querySelector('#f-company'),
    service: form.querySelector('#f-service'),
    timeline:form.querySelector('#f-timeline'),
    message: form.querySelector('#f-message'),
    website: form.querySelector('#f-website')
  } : null;
  var DRAFT_FIELDS = ['name', 'email', 'company', 'service', 'timeline', 'message'];

  // A visitor who switches language while filling the form keeps what they typed.
  function saveDraft() {
    if (!fields) return;
    var draft = {};
    var any = false;
    DRAFT_FIELDS.forEach(function (k) { draft[k] = fields[k].value; if (fields[k].value) any = true; });
    if (any) session('tt-draft', JSON.stringify(draft));
  }

  function restoreDraft() {
    var raw = session('tt-draft');
    if (!raw) return;
    session('tt-draft', null);
    try {
      var draft = JSON.parse(raw);
      DRAFT_FIELDS.forEach(function (k) { if (typeof draft[k] === 'string' && draft[k]) fields[k].value = draft[k]; });
    } catch { /* ignore */ }
  }

  function preselectService() {
    var wanted = null;
    try { wanted = new URLSearchParams(window.location.search).get('service'); } catch { /* ignore */ }
    if (!wanted) return;
    for (var i = 0; i < fields.service.options.length; i++) {
      if (fields.service.options[i].value === wanted) { fields.service.value = wanted; return; }
    }
  }

  function initForm() {
    if (!form) return;
    var submit   = document.getElementById('f-submit');
    var label    = submit.querySelector('.btn-text');
    var idle     = label.textContent;
    var feedback = document.getElementById('f-feedback');
    var started  = false;
    var sending  = false;

    preselectService();
    restoreDraft();

    function setError(name, msg) {
      var el = fields[name];
      var err = document.getElementById('f-' + name + '-err');
      if (msg) {
        el.setAttribute('aria-invalid', 'true');
        if (err) err.textContent = msg;
      } else {
        el.removeAttribute('aria-invalid');
        if (err) err.textContent = '';
      }
    }

    function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

    function validate() {
      var problems = [];
      var name = fields.name.value.trim();
      var email = fields.email.value.trim();
      var msg = fields.message.value.trim();

      setError('name',    name.length >= 2 ? null : M.vName);           if (name.length < 2) problems.push('name');
      setError('email',   isEmail(email) ? null : M.vEmail);            if (!isEmail(email)) problems.push('email');
      setError('service', fields.service.value ? null : M.vService);    if (!fields.service.value) problems.push('service');
      setError('message', msg.length >= 10 ? null : M.vMessage);        if (msg.length < 10) problems.push('message');
      return problems;
    }

    ['name', 'email', 'service', 'message'].forEach(function (k) {
      var ev = k === 'service' ? 'change' : 'input';
      fields[k].addEventListener(ev, function () {
        if (fields[k].getAttribute('aria-invalid') === 'true') setError(k, null);
      });
    });

    form.addEventListener('focusin', function () {
      if (!started) { started = true; track('form_start'); }
    });

    function setLoading(on) {
      submit.disabled = on;
      submit.classList.toggle('is-loading', on);
      submit.setAttribute('aria-busy', String(on));
      label.textContent = on ? M.sending : idle;
    }

    function show(type, html) {
      feedback.className = 'form-feedback is-' + type;
      feedback.innerHTML = html;
    }

    function optionText(select) {
      var opt = select.options[select.selectedIndex];
      return opt && opt.value ? opt.text : '';
    }

    // If sending fails, the email and WhatsApp links open with the visitor's request filled in,
    // so nothing has to be typed again.
    function prefillFallback() {
      var company = fields.company.value.trim();
      var summary = [
        fields.name.value.trim() + (company ? ' — ' + company : ''),
        [optionText(fields.service), optionText(fields.timeline)].filter(Boolean).join(' · '),
        ''
      ].join('\n');
      var message = fields.message.value.trim();
      var mail = feedback.querySelector('a[data-fallback="email"]');
      var wa   = feedback.querySelector('a[data-fallback="whatsapp"]');
      if (mail) {
        mail.href = 'mailto:seckbara23@gmail.com?subject=' +
          encodeURIComponent(M.formTitle + ' — ' + optionText(fields.service)) +
          '&body=' + encodeURIComponent(summary + message.slice(0, 1200));
      }
      if (wa) wa.href = 'https://wa.me/221707157070?text=' + encodeURIComponent(summary + message.slice(0, 600));
    }

    feedback.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-fallback]');
      if (a) track('lead_fallback', { channel: a.getAttribute('data-fallback') });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      feedback.className = 'form-feedback';
      feedback.textContent = '';

      var problems = validate();
      if (problems.length) {
        fields[problems[0]].focus();
        track('form_invalid', { fields: problems.join(',') });
        return;
      }

      sending = true;
      setLoading(true);
      var controller = ('AbortController' in window) ? new AbortController() : null;
      var timeout = setTimeout(function () { if (controller) controller.abort(); }, 15000);

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller ? controller.signal : undefined,
        body: JSON.stringify({
          type:     'discovery',
          name:     fields.name.value.trim(),
          email:    fields.email.value.trim(),
          company:  fields.company.value.trim(),
          service:  fields.service.value,
          timeline: fields.timeline.value,
          message:  fields.message.value.trim(),
          lang:     lang,
          page:     window.location.pathname,
          source:   source,
          website:  fields.website ? fields.website.value : ''
        })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          show('success', M.success);
          track('lead_submitted', { service: fields.service.value });
          form.reset();
          started = false;
        })
        .catch(function (err) {
          show('error', M.error);
          prefillFallback();
          track('lead_failed', { reason: String(err && err.message || err) });
        })
        .then(function () {
          clearTimeout(timeout);
          sending = false;
          setLoading(false);
          feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    });
  }

  // ── Boot ───────────────────────────────────────────────────
  initMenu();
  initCtas();
  initForm();
  document.querySelectorAll('[data-demo]').forEach(initDemo);
  initReveal();

  // expose for tests/debugging
  window.TT = { lang: lang, messages: MESSAGES };
})();
