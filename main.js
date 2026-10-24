/* ============================================================
   Teranga Technologies — Main Script
   Pages are static and already in the right language (/ and /fr).
   This script only adds behaviour:
   - Language preference and redirects (?lang=, saved choice, browser)
   - Old one-page links (/#services …) sent to the new pages
   - Mobile navigation
   - Hero demo animation (Radiora reporting flow)
   - Discovery form → /api/contact (validation, confirmation, fallback, attribution)
   - Entrance motion (respects reduced motion)
   - Conversion events from one schema (docs/TERANGA-05A-analytics-taxonomy.md)
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
      vCheck:   'Please check the highlighted field, then send again.',
      error:   'We couldn’t send your request, but your message is not lost. Send it to <a href="mailto:seckbara23@gmail.com" data-fallback="email">seckbara23@gmail.com</a> or on <a href="https://wa.me/221707157070" target="_blank" rel="noopener noreferrer" data-fallback="whatsapp">WhatsApp</a>: both open with your message already filled in.'
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
      vCheck:   'Vérifiez le champ signalé, puis envoyez à nouveau.',
      error:   'Votre demande n’a pas pu être envoyée, mais votre message n’est pas perdu. Envoyez-le à <a href="mailto:seckbara23@gmail.com" data-fallback="email">seckbara23@gmail.com</a> ou sur <a href="https://wa.me/221707157070" target="_blank" rel="noopener noreferrer" data-fallback="whatsapp">WhatsApp</a>' + NB + ': les deux s’ouvrent avec votre message déjà rempli.'
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

  // ── Conversion events ──────────────────────────────────────
  // Every event and property is declared here, and each value must match its pattern, so nothing
  // a visitor types (name, email, company, message) can reach analytics. Properties are listed by
  // priority: when events are forwarded to Vercel only the first N are sent (N from the page).
  // Events always go to the page itself (window.TT.events, "tt:analytics" DOM event) for checks.
  // A lead is counted from the server's records, never from these events.
  var SERVICE = /^(saas|ai|webapp|mobile|webdesign|support|other|none)$/;
  var SLUG = /^[a-z0-9-]{1,40}$/;
  var FIELD_LIST = /^(name|email|service|message)(,(name|email|service|message)){0,3}$/;
  var EVENTS = {
    service_cta_click:             { service: SERVICE, location: SLUG },
    case_study_click:              { project: SLUG, action: /^(open|visit)$/ },
    contact_form_start:            { service: SERVICE },
    contact_form_validation_error: { fields: FIELD_LIST },
    lead_submit_success:           { service: SERVICE },
    lead_submit_failure:           { reason: /^(network|timeout|rate_limited|rejected|server)$/, service: SERVICE },
    whatsapp_click:                { location: SLUG },
    email_click:                   { location: SLUG }
  };
  var DEDUPE_MS = 1000;
  var events = [];
  var lastSeen = {};
  var vaProps = Number(document.body.getAttribute('data-va-events')) || 0;
  if (vaProps > 0) {
    // Queue for the Vercel script, which loads after this one (deferred) and replays it.
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  }

  function emit(name, props) {
    try {
      var spec = EVENTS[name];
      if (!spec) return;
      var data = {};
      Object.keys(spec).forEach(function (k) {
        var v = props && props[k];
        if (typeof v === 'string' && spec[k].test(v)) data[k] = v;
      });
      // The same event with the same properties within a second is a double click, not a second action.
      var key = name + '|' + JSON.stringify(data);
      var now = Date.now();
      if (lastSeen[key] && now - lastSeen[key] < DEDUPE_MS) return;
      lastSeen[key] = now;

      var evt = { name: name, data: data, lang: lang, page: page, at: new Date(now).toISOString() };
      events.push(evt);
      if (events.length > 50) events.shift();
      document.dispatchEvent(new CustomEvent('tt:analytics', { detail: evt }));

      if (vaProps > 0 && typeof window.va === 'function') {
        var sent = {};
        Object.keys(data).slice(0, vaProps).forEach(function (k) { sent[k] = data[k]; });
        window.va('event', { name: name, data: sent });
      }
    } catch { /* measurement must never break the page */ }
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

  // ── Visit attribution (campaign tags, referring site's name, entry page) ─
  // Kept for the tab's session so a lead sent from another page is still attributed. A new
  // campaign link or referral starts a new attribution; moving around the site keeps it.
  // Only the referrer's host name is kept, never its path or query. The server re-validates it all.
  // It is read before the language redirects below: after one, the referrer is this site itself.
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  function visitSource() {
    var here = window.location.pathname.slice(0, 80);
    var saved = null;
    try { saved = JSON.parse(session('tt-src') || 'null'); } catch { saved = null; }
    if (!saved || typeof saved !== 'object') saved = null;
    var hop = session('tt-hop');
    if (hop) session('tt-hop', null);
    if (hop && saved) {
      // Arrived through our own redirect: same visit, now on the page actually shown.
      saved.entry = here;
      session('tt-src', JSON.stringify(saved));
      return saved;
    }
    var fresh = {};
    try {
      var params = new URLSearchParams(window.location.search);
      UTM_KEYS.forEach(function (k) { if (params.get(k)) fresh[k] = params.get(k).slice(0, 150); });
      var ref = document.referrer ? new URL(document.referrer).hostname : '';
      if (ref && ref !== window.location.hostname) fresh.referrer = ref;
    } catch { /* ignore */ }
    if (saved && saved.entry && !Object.keys(fresh).length) return saved;
    fresh.entry = here;
    session('tt-src', JSON.stringify(fresh));
    return fresh;
  }

  var source = visitSource();

  if (redirectForLanguage() || redirectLegacyHash()) {
    session('tt-hop', '1');
    return;
  }

  // ── Language links: remember the choice, keep a form draft ─
  document.querySelectorAll('[data-lang-link]').forEach(function (a) {
    a.addEventListener('click', function () {
      store('tt-lang', a.getAttribute('data-lang-link'));
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
  // Positions come from IntersectionObserver, after the browser's own layout. Reading them here
  // (getBoundingClientRect) forced the page's whole first layout into this script's task.
  function initReveal() {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-revealed');
        e.target.classList.remove('reveal-pending');
        reveal.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    // First report for each element: on screen or above it → left alone; below → hidden until it scrolls in.
    var sort = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        sort.unobserve(e.target);
        if (e.isIntersecting || e.boundingClientRect.top < 0) return;
        e.target.classList.add('reveal-pending');
        reveal.observe(e.target);
      });
    });
    document.querySelectorAll('[data-reveal]').forEach(function (el) { sort.observe(el); });
  }

  // ── Click events: discovery CTAs, case studies, WhatsApp and email ─
  // data-cta names where a link sits (header, hero, svc-saas, footer …); the channel comes from the href.
  function initClicks() {
    var contactPath = lang === 'fr' ? '/fr/contact' : '/contact';
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      var where = a.hasAttribute('data-fallback') ? 'form-fallback' : (a.getAttribute('data-cta') || 'inline');
      if (href.indexOf('https://wa.me/') === 0) emit('whatsapp_click', { location: where });
      else if (href.indexOf('mailto:') === 0) emit('email_click', { location: where });
      else if (a.hasAttribute('data-case')) {
        emit('case_study_click', { project: a.getAttribute('data-case'), action: a.target === '_blank' ? 'visit' : 'open' });
      } else if (a.hasAttribute('data-cta') && a.pathname === contactPath) {
        emit('service_cta_click', { service: a.getAttribute('data-service') || 'none', location: where });
      }
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
    website: form.querySelector('#f-hp')
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
    var confirm  = document.getElementById('f-confirm');
    var started  = false;
    var sending  = false;
    var counted  = {}; // lead references already reported as a success

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

    // The server's rule (api/_lib/contact.js isValidEmail), so an address is never accepted here and
    // refused there.
    function isEmail(v) { return /^[^\s@<>"',]+@[^\s@<>"',]+\.[^\s@<>"',]{2,}$/.test(v); }
    var FIELD_MESSAGES = { name: 'vName', email: 'vEmail', service: 'vService', message: 'vMessage' };

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

    // Started = the visitor typed or chose something (focus alone is not intent). The hidden
    // anti-spam field is ignored.
    function onFirstInput(e) {
      if (started || e.target === fields.website) return;
      started = true;
      emit('contact_form_start', { service: fields.service.value || 'none' });
    }
    form.addEventListener('input', onFirstInput);
    form.addEventListener('change', onFirstInput);

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

    // Shown only after /api/contact has answered 2xx, i.e. the notification was accepted for delivery.
    // The reply address is shown back so a mistyped email can be noticed and the request resent.
    function showConfirmation(ref, email) {
      var box = document.getElementById('f-confirm-ref-box');
      document.getElementById('f-confirm-ref').textContent = ref || '';
      box.hidden = !ref;
      document.getElementById('f-confirm-email').textContent = email || '';
      document.getElementById('f-confirm-to').hidden = !email;
      form.hidden = true;
      confirm.hidden = false;
      document.getElementById('f-confirm-title').focus();
      confirm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    document.getElementById('f-again').addEventListener('click', function () {
      confirm.hidden = true;
      form.hidden = false;
      fields.name.focus();
    });

    function failureReason(err, status) {
      if (status === 429) return 'rate_limited';
      if (status >= 500) return 'server';
      if (status >= 400) return 'rejected';
      return err && err.name === 'AbortError' ? 'timeout' : 'network';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      feedback.className = 'form-feedback';
      feedback.textContent = '';

      var problems = validate();
      if (problems.length) {
        fields[problems[0]].focus();
        emit('contact_form_validation_error', { fields: problems.join(',') });
        return;
      }

      sending = true;
      setLoading(true);
      var service = fields.service.value;
      var email = fields.email.value.trim();
      var status = 0;
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
          status = res.status;
          return res.json().catch(function () { return {}; }).then(function (body) {
            if (res.ok) return body;
            var failure = new Error('HTTP ' + res.status);
            failure.body = body;
            throw failure;
          });
        })
        .then(function (body) {
          var ref = body && typeof body.ref === 'string' && /^TT-\d{8}-[0-9A-F]{4}$/.test(body.ref) ? body.ref : '';
          // A repeated answer for the same reference (the server's duplicate guard) is one lead, not two.
          if (!ref || !counted[ref]) emit('lead_submit_success', { service: service });
          if (ref) counted[ref] = true;
          form.reset();
          started = false;
          showConfirmation(ref, email);
        }, function (err) {
          // A field the server refused (e.g. an address it considers invalid) is shown on that field,
          // so the visitor can correct it; anything else gets the email/WhatsApp fallback.
          var field = status === 400 && err && err.body && FIELD_MESSAGES[err.body.field] ? err.body.field : '';
          if (field) {
            setError(field, M[FIELD_MESSAGES[field]]);
            show('error', M.vCheck);
            fields[field].focus();
          } else {
            show('error', M.error);
            prefillFallback();
          }
          emit('lead_submit_failure', { reason: failureReason(err, status), service: service });
          feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        })
        .then(done, done);

      function done() {
        clearTimeout(timeout);
        sending = false;
        setLoading(false);
      }
    });
  }

  // ── Boot ───────────────────────────────────────────────────
  initMenu();
  initClicks();
  initForm();
  document.querySelectorAll('[data-demo]').forEach(initDemo);
  initReveal();

  // expose for tests/debugging (events holds names and allow-listed properties only)
  window.TT = { lang: lang, messages: MESSAGES, events: events, schema: Object.keys(EVENTS) };
})();
