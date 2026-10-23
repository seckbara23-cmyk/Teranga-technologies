// Reusable page components. Each returns markup from html``; ctx = { lang, c, page, link(), asset() }.

import { html, rich } from './lib/html.mjs';
import { CONTACT, PRODUCTS, PAGES, BOOKING_URL } from './config.mjs';

const arrow = html`<svg class="icon-arrow" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export function newTab(ctx) {
  return html`<span class="sr-only"> ${ctx.c.common.newTab}</span>`;
}

/** Discovery-call CTA target: the contact page (optionally pre-selecting a service), or a booking page if configured. */
export function ctaHref(ctx, service) {
  if (BOOKING_URL) return BOOKING_URL;
  const base = ctx.link('contact');
  return service ? `${base}?service=${service}` : base;
}

export function ctaLabel(ctx, label) {
  return BOOKING_URL ? ctx.c.common.ctaBook : label;
}

export function button(ctx, { label, href, variant = 'amber', size, cta, service, external }) {
  const cls = ['btn', `btn-${variant}`, size ? `btn-${size}` : ''].filter(Boolean).join(' ');
  return html`<a href="${href}" class="${cls}"${cta ? html` data-cta="${cta}"` : ''}${service ? html` data-service="${service}"` : ''}${external ? html` target="_blank" rel="noopener noreferrer"` : ''}>${label}${external ? newTab(ctx) : ''}</a>`;
}

export function textLink(label, href, extra = '') {
  return html`<a href="${href}" class="text-link"${extra ? html` ${extra}` : ''}><span>${label}</span>${arrow}</a>`;
}

/** SectionHeading: eyebrow, heading and optional intro. */
export function sectionHeading({ eyebrow, title, intro, id, level = 2, center = false, tone }) {
  const h = level === 1 ? html`<h1${id ? html` id="${id}"` : ''}>${title}</h1>` : html`<h2${id ? html` id="${id}"` : ''}>${title}</h2>`;
  return html`<div class="section-heading${center ? ' is-center' : ''}${tone === 'dark' ? ' on-dark' : ''}">
      ${eyebrow ? html`<p class="eyebrow">${eyebrow}</p>` : ''}
      ${h}
      ${intro ? html`<p class="section-intro">${intro}</p>` : ''}
    </div>`;
}

/** Page hero for inner pages. */
export function pageHero(ctx, { eyebrow, title, lead }) {
  return html`<section class="page-hero" aria-labelledby="page-title">
    <div class="container">
      <p class="eyebrow">${eyebrow}</p>
      <h1 id="page-title">${title}</h1>
      <p class="page-hero-lead">${lead}</p>
    </div>
  </section>`;
}

/** Real product screenshot in a light browser frame. */
export function browserFrame(ctx, key, { eager = false, sizes } = {}) {
  const p = PRODUCTS[key];
  const alt = ctx.c.common.shotAlt[key];
  const src = `/assets/portfolio/${p.image}`;
  return html`<figure class="browser-frame">
      <div class="browser-bar" aria-hidden="true"><span></span><span></span><span></span></div>
      <picture>
        ${p.webp ? html`<source srcset="${src}.webp" type="image/webp">` : ''}
        <img src="${src}.png" width="${p.width}" height="${p.height}" alt="${alt}" ${eager ? html`fetchpriority="high"` : html`loading="lazy"`} decoding="async"${sizes ? html` sizes="${sizes}"` : ''}>
      </picture>
    </figure>`;
}

/** The Radiora reporting flow, rendered statically (animated by main.js when motion is allowed). */
export function demoWindow(ctx) {
  const d = ctx.c.common.demo;
  return html`<div class="demo-window" data-demo>
      <div class="demo-bar">
        <span class="demo-product">${d.product}</span>
        <span class="demo-status" data-state="listening">
          <span class="demo-dot" aria-hidden="true"></span>
          <span class="demo-status-text">${d.listening}</span>
        </span>
      </div>
      <div class="demo-block demo-dictation">
        <p class="demo-label">${d.dictation}</p>
        <p class="demo-transcript">${d.transcript}</p>
      </div>
      <div class="demo-block demo-report">
        <p class="demo-label">${d.report}</p>
        <dl class="demo-sections">
          ${d.sections.map(([k, v]) => html`<div class="demo-row"><dt>${k}</dt><dd>${v}</dd></div>`)}
        </dl>
      </div>
      <div class="demo-signoff">
        <svg class="demo-lock" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M6 9V6.5a4 4 0 1 1 8 0V9" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="4" y="9" width="12" height="8" rx="2" fill="currentColor"/></svg>
        <span>${d.sign}</span>
      </div>
    </div>`;
}

/** HeroSection for the home page: copy + composition of the Radiora flow and a real EduSen screenshot. */
export function homeHero(ctx) {
  const h = ctx.c.pages.home.hero;
  return html`<section class="hero" aria-labelledby="hero-title">
    <div class="container hero-grid">
      <div class="hero-copy">
        <p class="eyebrow eyebrow-amber">${h.eyebrow}</p>
        <h1 id="hero-title">${h.title}</h1>
        <p class="hero-sub">${h.sub}</p>
        <div class="hero-actions">
          ${button(ctx, { label: ctaLabel(ctx, h.primary), href: ctaHref(ctx), size: 'lg', cta: 'hero' })}
          ${button(ctx, { label: h.secondary, href: ctx.link('work'), variant: 'ghost-light', size: 'lg', cta: 'hero-work' })}
        </div>
        <p class="hero-note">${h.note}</p>
      </div>
      <figure class="hero-visual" aria-labelledby="hero-caption">
        <div class="hero-stack">
          <div class="hero-shot" aria-hidden="true">${browserFrame(ctx, 'edusen', { eager: true })}</div>
          ${demoWindow(ctx)}
        </div>
        <figcaption id="hero-caption">${h.caption}</figcaption>
      </figure>
    </div>
  </section>`;
}

/** ServiceCard used on the home page capability grid. */
export function capabilityCard(ctx, item, i) {
  const href = ctx.link(item.link.page, item.link.hash);
  return html`<li class="capability" data-reveal>
      <span class="capability-index" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      <h3><a href="${href}" class="stretched">${item.title}</a></h3>
      <p>${item.text}</p>
      <span class="capability-more" aria-hidden="true">${ctx.c.common.learnMore}${arrow}</span>
    </li>`;
}

/** FeaturedProject: compact project card linking to its case study. */
export function featuredProject(ctx, p) {
  return html`<article class="project-card" data-reveal>
      ${browserFrame(ctx, p.key)}
      <div class="project-card-body">
        <p class="eyebrow">${p.sector}</p>
        <h3>${p.name}</h3>
        <p>${p.text}</p>
        ${textLink(p.linkLabel, ctx.link(p.link.page, p.link.hash))}
      </div>
    </article>`;
}

/** ProofStatement: a short editorial statement. */
export function proofStatement(text) {
  return html`<blockquote class="proof-statement"><p>${text}</p></blockquote>`;
}

/** ProcessTimeline: numbered steps with client involvement and deliverable. */
export function processTimeline(ctx, p) {
  return html`<ol class="timeline">
      ${p.steps.map((s, i) => html`<li class="timeline-step" data-reveal>
        <span class="timeline-num" aria-hidden="true">${i + 1}</span>
        <h3>${s.title}</h3>
        <p>${s.text}</p>
        <dl class="timeline-meta">
          <div><dt>${p.you}</dt><dd>${s.you}</dd></div>
          <div><dt>${p.get}</dt><dd>${s.get}</dd></div>
        </dl>
      </li>`)}
    </ol>`;
}

/** CTASection: closing invitation used on every page. */
export function ctaSection(ctx, { title, text, button: label, service, cta = 'final' } = {}) {
  const f = ctx.c.common.finalCta;
  return html`<section class="cta-band" aria-labelledby="cta-title">
    <div class="container cta-inner" data-reveal>
      <div>
        <h2 id="cta-title">${title || f.title}</h2>
        <p>${text || f.text}</p>
      </div>
      <div class="cta-actions">
        ${button(ctx, { label: ctaLabel(ctx, label || f.button), href: ctaHref(ctx, service), size: 'lg', cta, service })}
        <p class="cta-alt">${f.or} <a href="mailto:${CONTACT.email}" data-cta="email">${CONTACT.email}</a></p>
      </div>
    </div>
  </section>`;
}

/** Tag pill (shipped / offered / method). */
export function tag(label, kind) {
  return html`<p class="tag tag-${kind}">${label}</p>`;
}

/** LanguageSwitcher: links to the same page in the other language. */
export function languageSwitcher(ctx, variant = 'header') {
  const c = ctx.c.common;
  return html`<div class="lang-switch lang-switch-${variant}" role="group" aria-label="${c.langLabel}">
      ${['en', 'fr'].map((l) => {
        const label = `${l.toUpperCase()}, ${c.langNames[l]}`;
        return l === ctx.lang
          ? html`<a href="${ctx.pathIn(l)}" lang="${l}" hreflang="${l}" aria-label="${label}" aria-current="true">${l.toUpperCase()}</a>`
          : html`<a href="${ctx.pathIn(l)}" lang="${l}" hreflang="${l}" aria-label="${label}" data-lang-link="${l}">${l.toUpperCase()}</a>`;
      })}
    </div>`;
}

/** GlobalHeader. */
export function globalHeader(ctx) {
  const c = ctx.c.common;
  const items = PAGES.map((p) => ({ p, label: c.nav[p], href: ctx.link(p), current: p === ctx.page }));
  const navLink = (it) => html`<li><a href="${it.href}"${it.current ? html` aria-current="page"` : ''}>${it.label}</a></li>`;
  return html`<header class="site-header">
    <div class="container header-inner">
      <a href="${ctx.link('home')}" class="brand" aria-label="${c.brandHome}">
        <img src="/assets/brand/teranga-mark.svg" alt="" class="brand-mark" width="36" height="36">
        <span class="brand-name">Teranga <span>Technologies</span></span>
      </a>
      <nav class="site-nav" aria-label="${c.navLabel}">
        <ul>${items.map(navLink)}</ul>
      </nav>
      <div class="header-actions">
        ${languageSwitcher(ctx, 'header')}
        ${button(ctx, { label: ctaLabel(ctx, c.cta), href: ctaHref(ctx), size: 'sm', cta: 'header' })}
        <button type="button" class="menu-toggle" id="menu-toggle" aria-controls="mobile-nav" aria-expanded="false" aria-label="${c.menuOpen}">
          <span class="menu-icon" aria-hidden="true"></span>
        </button>
      </div>
    </div>
    <div class="mobile-nav" id="mobile-nav" hidden>
      <nav aria-label="${c.mobileNavLabel}">
        <ul>${items.map(navLink)}</ul>
      </nav>
      <div class="mobile-nav-foot">
        ${languageSwitcher(ctx, 'mobile')}
        ${button(ctx, { label: ctaLabel(ctx, c.cta), href: ctaHref(ctx), cta: 'mobile-menu' })}
      </div>
    </div>
  </header>`;
}

/** GlobalFooter. */
export function globalFooter(ctx) {
  const c = ctx.c.common;
  const services = ctx.c.pages.services.items;
  return html`<footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <a href="${ctx.link('home')}" class="brand brand-light" aria-label="${c.brandHome}">
          <img src="/assets/brand/teranga-mark.svg" alt="" class="brand-mark" width="32" height="32">
          <span class="brand-name">Teranga <span>Technologies</span></span>
        </a>
        <p>${c.footer.tagline}</p>
      </div>
      <nav class="footer-col" aria-labelledby="ft-pages">
        <h2 id="ft-pages">${c.footer.pages}</h2>
        <ul>${PAGES.map((p) => html`<li><a href="${ctx.link(p)}">${c.nav[p]}</a></li>`)}</ul>
      </nav>
      <nav class="footer-col" aria-labelledby="ft-services">
        <h2 id="ft-services">${c.footer.services}</h2>
        <ul>${services.map((s) => html`<li><a href="${ctx.link('services', s.id)}">${s.name}</a></li>`)}</ul>
      </nav>
      <div class="footer-col">
        <h2>${c.footer.reach}</h2>
        ${contactList(ctx, 'footer')}
      </div>
    </div>
    <div class="container footer-bottom">
      <p>${c.footer.copy}</p>
      <p>${c.footer.made}</p>
      ${languageSwitcher(ctx, 'footer')}
    </div>
  </footer>`;
}

/** Direct contact channels (WhatsApp, email, phone, office). */
export function contactList(ctx, variant) {
  const c = ctx.c.common.contact;
  return html`<ul class="contact-list contact-list-${variant}">
      <li><span class="contact-label">${c.whatsapp}</span><a href="${CONTACT.whatsapp}" target="_blank" rel="noopener noreferrer" data-cta="whatsapp">${CONTACT.phoneDisplay}${newTab(ctx)}</a></li>
      <li><span class="contact-label">${c.email}</span><a href="mailto:${CONTACT.email}" data-cta="email">${CONTACT.email}</a></li>
      <li><span class="contact-label">${c.phone}</span><a href="${CONTACT.phoneHref}" data-cta="phone">${CONTACT.phoneDisplay}</a></li>
      <li><span class="contact-label">${c.office}</span><span>${c.address}</span></li>
    </ul>`;
}

/** ContactForm: same field ids and API contract as before (main.js and /api/contact depend on them). */
export function contactForm(ctx) {
  const f = ctx.c.pages.contact.form;
  const req = html`<span class="req" aria-hidden="true">*</span>`;
  return html`<form id="contact-form" class="contact-form" novalidate aria-labelledby="form-title">
      <h2 id="form-title">${f.title}</h2>
      <p class="form-required">${f.required} ${req}</p>
      <div class="form-row">
        <div class="field">
          <label for="f-name">${f.name} ${req}</label>
          <input type="text" id="f-name" name="name" autocomplete="name" required maxlength="120" aria-describedby="f-name-err">
          <p class="field-err" id="f-name-err"></p>
        </div>
        <div class="field">
          <label for="f-email">${f.email} ${req}</label>
          <input type="email" id="f-email" name="email" autocomplete="email" required maxlength="200" aria-describedby="f-email-err">
          <p class="field-err" id="f-email-err"></p>
        </div>
      </div>
      <div class="form-row">
        <div class="field">
          <label for="f-company">${f.company} <span class="opt">${f.optional}</span></label>
          <input type="text" id="f-company" name="company" autocomplete="organization" maxlength="160">
        </div>
        <div class="field">
          <label for="f-service">${f.service} ${req}</label>
          <select id="f-service" name="service" required aria-describedby="f-service-err">
            <option value="">${f.servicePlaceholder}</option>
            ${Object.entries(f.services).map(([v, l]) => html`<option value="${v}">${l}</option>`)}
          </select>
          <p class="field-err" id="f-service-err"></p>
        </div>
      </div>
      <div class="field">
        <label for="f-timeline">${f.timeline} <span class="opt">${f.optional}</span></label>
        <select id="f-timeline" name="timeline">
          <option value="">${f.timelinePlaceholder}</option>
          ${Object.entries(f.timelines).map(([v, l]) => html`<option value="${v}">${l}</option>`)}
        </select>
      </div>
      <div class="field">
        <label for="f-message">${f.message} ${req}</label>
        <textarea id="f-message" name="message" rows="5" required maxlength="5000" aria-describedby="f-message-hint f-message-err"></textarea>
        <p class="field-hint" id="f-message-hint">${f.messageHint}</p>
        <p class="field-err" id="f-message-err"></p>
      </div>
      <div class="hp-field" aria-hidden="true">
        <label for="f-website">Website</label>
        <input type="text" id="f-website" name="website" tabindex="-1" autocomplete="off">
      </div>
      <div id="f-feedback" class="form-feedback" role="status" aria-live="polite"></div>
      <button type="submit" class="btn btn-amber btn-lg btn-block" id="f-submit">
        <span class="spinner" aria-hidden="true"></span>
        <span class="btn-text">${f.submit}</span>
      </button>
      <p class="form-note">${rich(f.privacy)}</p>
    </form>`;
}
