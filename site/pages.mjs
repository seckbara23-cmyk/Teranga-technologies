// Page bodies. Each returns { title, description, ogTitle?, body } for layout().

import { html, rich } from './lib/html.mjs';
import { PRODUCTS } from './config.mjs';
import {
  homeHero, pageHero, sectionHeading, capabilityCard, featuredProject, proofStatement, processTimeline,
  ctaSection, browserFrame, demoWindow, tag, button, textLink, contactList, contactForm, ctaHref, newTab,
} from './components.mjs';

function home(ctx) {
  const p = ctx.c.pages.home;
  const body = html`
    ${homeHero(ctx)}

    <section class="section capabilities" aria-labelledby="cap-title">
      <div class="container">
        ${sectionHeading({ eyebrow: p.capabilities.eyebrow, title: p.capabilities.title, intro: p.capabilities.intro, id: 'cap-title' })}
        <ul class="capability-grid">
          ${p.capabilities.items.map((it, i) => capabilityCard(ctx, it, i))}
        </ul>
      </div>
    </section>

    <section class="section surface-paper" aria-labelledby="work-title">
      <div class="container">
        <div class="heading-row">
          ${sectionHeading({ eyebrow: p.work.eyebrow, title: p.work.title, intro: p.work.intro, id: 'work-title' })}
          ${textLink(p.work.all, ctx.link('work'))}
        </div>
        <div class="project-grid">
          ${p.work.projects.map((proj) => featuredProject(ctx, proj))}
        </div>
      </div>
    </section>

    <section class="section surface-ink why" id="why" aria-labelledby="why-title">
      <div class="container why-grid">
        <div class="why-intro">
          ${sectionHeading({ eyebrow: p.why.eyebrow, title: p.why.title, id: 'why-title', tone: 'dark' })}
          ${proofStatement(p.why.statement)}
          ${textLink(p.why.more, ctx.link('about'))}
        </div>
        <ul class="why-list">
          ${p.why.items.map((it) => html`<li data-reveal><h3>${it.title}</h3><p>${it.text}</p></li>`)}
        </ul>
      </div>
    </section>

    <section class="section" id="process" aria-labelledby="process-title">
      <div class="container">
        ${sectionHeading({ eyebrow: p.process.eyebrow, title: p.process.title, intro: p.process.intro, id: 'process-title' })}
        ${processTimeline(ctx, p.process)}
      </div>
    </section>

    ${ctaSection(ctx)}`;
  return { title: p.title, description: p.description, ogTitle: p.ogTitle, body };
}

function services(ctx) {
  const p = ctx.c.pages.services;
  const L = p.labels;
  const body = html`
    ${pageHero(ctx, p.hero)}

    <nav class="jump-nav" aria-label="${p.jump}">
      <div class="container">
        <ul>${p.items.map((s) => html`<li><a href="#${s.id}">${s.name}</a></li>`)}</ul>
      </div>
    </nav>

    ${p.items.map((s, i) => html`
    <section class="section service${i % 2 ? ' surface-paper' : ''}" id="${s.id}" aria-labelledby="svc-${s.id}-h">
      <div class="container">
        <div class="service-head" data-reveal>
          <span class="service-index" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
          <div>
            <p class="eyebrow">${s.name}</p>
            <h2 id="svc-${s.id}-h">${s.headline}</h2>
          </div>
        </div>
        <div class="service-body">
          <div class="service-main" data-reveal>
            <h3>${L.problem}</h3>
            <p>${s.problem}</p>
            <h3>${L.deliver}</h3>
            <ul class="check-list">${s.deliver.map((d) => html`<li>${d}</li>`)}</ul>
          </div>
          <div class="service-panel" data-reveal>
            <h3>${L.uses}</h3>
            <ul class="dot-list">${s.uses.map((u) => html`<li>${u}</li>`)}</ul>
            <h3>${L.outcome}</h3>
            <p>${s.outcome}</p>
            <div class="service-actions">
              ${button(ctx, { label: s.cta, href: ctaHref(ctx, s.service), variant: 'navy', cta: `svc-${s.id}`, service: s.service })}
              ${s.more ? textLink(s.more.label, ctx.link(s.more.link.page)) : ''}
            </div>
          </div>
        </div>
      </div>
    </section>`)}

    <section class="section section-tight">
      <div class="container">
        <p class="engagement-note">${p.note}</p>
      </div>
    </section>

    ${ctaSection(ctx)}`;
  return { title: p.title, description: p.description, body };
}

function aiEngineering(ctx) {
  const p = ctx.c.pages['ai-engineering'];
  const t = p.tags;
  const tagKind = { shipped: 'shipped', both: 'shipped', offered: 'offered', method: 'method' };
  const card = (it) => html`<li class="feature-card" data-reveal>
      ${tag(t[it.tag], tagKind[it.tag])}
      <h3>${it.title}</h3>
      <p>${it.text}</p>
    </li>`;
  const body = html`
    ${pageHero(ctx, p.hero)}

    <section class="section" id="capabilities" aria-labelledby="ai-cap-title">
      <div class="container">
        ${sectionHeading({ eyebrow: p.capabilities.eyebrow, title: p.capabilities.title, intro: p.capabilities.intro, id: 'ai-cap-title' })}
        <ul class="feature-grid">${p.capabilities.items.map(card)}</ul>
      </div>
    </section>

    <section class="section surface-ink" id="radiora-example" aria-labelledby="ai-example-title">
      <div class="container example-grid">
        <div class="example-copy" data-reveal>
          ${sectionHeading({ eyebrow: p.example.eyebrow, title: p.example.title, id: 'ai-example-title', tone: 'dark' })}
          <p class="example-text">${p.example.text}</p>
          <ul class="check-list on-dark">${p.example.points.map((pt) => html`<li>${pt}</li>`)}</ul>
          ${textLink(p.example.link, ctx.link('work', 'radiora'))}
        </div>
        <figure class="example-visual" aria-labelledby="ai-demo-caption">
          ${demoWindow(ctx)}
          <figcaption id="ai-demo-caption">${p.example.caption}</figcaption>
        </figure>
      </div>
    </section>

    <section class="section" id="safeguards" aria-labelledby="ai-safe-title">
      <div class="container">
        ${sectionHeading({ eyebrow: p.safeguards.eyebrow, title: p.safeguards.title, id: 'ai-safe-title' })}
        <ul class="feature-grid">${p.safeguards.items.map(card)}</ul>
      </div>
    </section>

    <section class="section surface-paper" aria-labelledby="ai-start-title">
      <div class="container">
        ${sectionHeading({ eyebrow: p.start.eyebrow, title: p.start.title, id: 'ai-start-title' })}
        <ol class="step-row">
          ${p.start.steps.map((s, i) => html`<li data-reveal><span class="step-num" aria-hidden="true">${i + 1}</span><h3>${s.title}</h3><p>${s.text}</p></li>`)}
        </ol>
      </div>
    </section>

    ${ctaSection(ctx, { title: p.cta.title, text: p.cta.text, button: p.cta.button, service: 'ai', cta: 'ai-final' })}`;
  return { title: p.title, description: p.description, body };
}

function work(ctx) {
  const p = ctx.c.pages.work;
  const L = p.labels;
  const body = html`
    ${pageHero(ctx, p.hero)}

    ${p.cases.map((cs, i) => html`
    <article class="section case-study${i % 2 ? ' surface-paper' : ''}" id="${cs.id}" aria-labelledby="case-${cs.id}-h">
      <div class="container">
        <header class="case-head" data-reveal>
          <p class="eyebrow">${cs.sector}</p>
          <h2 id="case-${cs.id}-h">${cs.name}</h2>
          <p class="case-summary">${cs.summary}</p>
        </header>
        <div class="case-grid">
          <div class="case-media" data-reveal>
            ${browserFrame(ctx, cs.key)}
            <div class="case-actions">
              ${button(ctx, { label: L.visit, href: PRODUCTS[cs.key].url, variant: 'outline', cta: `case-${cs.id}-visit`, external: true })}
              ${button(ctx, { label: L.discuss, href: ctaHref(ctx, cs.service), variant: 'navy', cta: `case-${cs.id}`, service: cs.service })}
            </div>
          </div>
          <div class="case-body">
            <div class="case-block" data-reveal><h3>${L.context}</h3><p>${cs.context}</p></div>
            <div class="case-block" data-reveal><h3>${L.problem}</h3><p>${cs.problem}</p></div>
            <div class="case-block" data-reveal><h3>${L.solution}</h3><ul class="check-list">${cs.solution.map((s) => html`<li>${s}</li>`)}</ul></div>
            <div class="case-block" data-reveal><h3>${cs.decisionsTitle}</h3><ul class="dot-list">${cs.decisions.map((s) => html`<li>${s}</li>`)}</ul></div>
            <div class="case-callout" data-reveal><h3>${cs.safeguardTitle}</h3><p>${cs.safeguard}</p></div>
            <div class="case-results" data-reveal><h3>${L.results}</h3><p>${cs.results}</p></div>
          </div>
        </div>
      </div>
    </article>`)}

    <section class="section" id="more" aria-labelledby="more-title">
      <div class="container">
        ${sectionHeading({ eyebrow: p.more.eyebrow, title: p.more.title, id: 'more-title' })}
        <ul class="more-grid">
          ${p.more.items.map((m) => html`<li class="more-card" data-reveal>
            ${browserFrame(ctx, m.key)}
            <h3>${m.name}</h3>
            <p>${m.text}</p>
            <a href="${PRODUCTS[m.key].url}" class="text-link" target="_blank" rel="noopener noreferrer" data-cta="more-${m.key}"><span>${m.linkLabel}</span>${newTab(ctx)}</a>
          </li>`)}
        </ul>
      </div>
    </section>

    ${ctaSection(ctx)}`;
  return { title: p.title, description: p.description, body };
}

function about(ctx) {
  const p = ctx.c.pages.about;
  const body = html`
    ${pageHero(ctx, p.hero)}

    <section class="section story" aria-labelledby="story-title">
      <div class="container story-grid">
        ${sectionHeading({ eyebrow: p.story.eyebrow, title: p.story.title, id: 'story-title' })}
        <div class="story-text" data-reveal>
          ${p.story.paragraphs.map((t, i) => (i === 0 ? proofStatement(t) : html`<p>${t}</p>`))}
        </div>
      </div>
    </section>

    <section class="section surface-paper" aria-labelledby="principles-title">
      <div class="container">
        ${sectionHeading({ eyebrow: p.principles.eyebrow, title: p.principles.title, id: 'principles-title' })}
        <ul class="principle-grid">
          ${p.principles.items.map((it, i) => html`<li data-reveal><span class="principle-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3>${it.title}</h3><p>${it.text}</p></li>`)}
        </ul>
      </div>
    </section>

    <section class="section" aria-labelledby="collab-title">
      <div class="container collab-grid">
        ${sectionHeading({ eyebrow: p.collaboration.eyebrow, title: p.collaboration.title, id: 'collab-title' })}
        <ul class="collab-list">
          ${p.collaboration.items.map((it) => html`<li data-reveal><h3>${it.title}</h3><p>${it.text}</p></li>`)}
        </ul>
      </div>
    </section>

    <section class="section surface-ink" aria-labelledby="where-title">
      <div class="container where-grid">
        <div>
          ${sectionHeading({ eyebrow: p.location.eyebrow, title: p.location.title, id: 'where-title', tone: 'dark' })}
          <p class="where-place">${p.location.place}</p>
          <p class="where-text">${p.location.timezone}</p>
          <p class="where-text">${p.location.remote}</p>
        </div>
        <div class="where-contact" data-reveal>${contactList(ctx, 'dark')}</div>
      </div>
    </section>

    ${ctaSection(ctx)}`;
  return { title: p.title, description: p.description, body };
}

function contact(ctx) {
  const p = ctx.c.pages.contact;
  const body = html`
    ${pageHero(ctx, p.hero)}

    <section class="section contact-section" id="form" aria-label="${p.form.title}">
      <div class="container contact-grid">
        <div class="contact-aside">
          <h2 class="aside-title">${p.next.title}</h2>
          <ol class="next-steps">${p.next.steps.map((s, i) => html`<li><span class="step-num" aria-hidden="true">${i + 1}</span><p>${s}</p></li>`)}</ol>
          <h2 class="aside-title">${p.direct}</h2>
          ${contactList(ctx, 'aside')}
        </div>
        <div class="form-card">${contactForm(ctx)}</div>
      </div>
    </section>

    <section class="section surface-paper" id="faq" aria-labelledby="faq-title">
      <div class="container faq-grid">
        ${sectionHeading({ eyebrow: p.faq.eyebrow, title: p.faq.title, id: 'faq-title' })}
        <div class="faq-list">
          ${p.faq.items.map((f) => html`<details><summary>${f.q}</summary><p>${f.a}</p></details>`)}
        </div>
      </div>
    </section>`;
  return { title: p.title, description: p.description, body };
}

/** Bilingual 404, served by Vercel for unknown paths. */
export function notFoundBody(ctxEn, ctxFr) {
  const block = (ctx) => {
    const n = ctx.c.pages.notFound;
    return html`<div class="notfound-block" lang="${ctx.lang}">
        <h2>${n.heading}</h2>
        <p>${n.text}</p>
        <ul class="notfound-links">
          ${['home', 'services', 'ai-engineering', 'work', 'about', 'contact'].map((pg) => html`<li><a href="${ctx.link(pg)}">${ctx.c.common.nav[pg]}</a></li>`)}
        </ul>
      </div>`;
  };
  const heading = [ctxEn, ctxFr].map((c) => c.c.pages.notFound.title.split('|')[0].trim()).join(' · ');
  return html`<section class="page-hero page-hero-compact" aria-labelledby="page-title">
      <div class="container">
        <p class="eyebrow">404</p>
        <h1 id="page-title">${heading}</h1>
      </div>
    </section>
    <section class="section">
      <div class="container notfound-grid">${block(ctxEn)}${block(ctxFr)}</div>
    </section>`;
}

export const PAGE_RENDERERS = { home, services, 'ai-engineering': aiEngineering, work, about, contact };

// Exposed for tests: content helpers that must stay in sync with rendering.
export { rich };
