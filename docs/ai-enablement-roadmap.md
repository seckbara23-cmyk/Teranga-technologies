# AI engineering enablement — 30/60/90-day roadmap

Internal working document. **Not deployed** (`docs/` is excluded in `.vercelignore`).
Prepared 2026-10-22. Curriculum and prices were checked on the sources listed at the end on that date; re-check before relying on them.

## 1. What the curriculum actually is (verified)

The brief asked for a plan "based on Claude Academy Developer and Architect learning paths". Verification shows two separate catalogues:

| Catalogue | Access | What it contains |
|---|---|---|
| **Claude Academy** — academy.claude.com (also the older catalogue at anthropic.skilljar.com, "Anthropic Academy") | Public, free; courses end with a quiz and a certificate of completion | Courses organised by product (Claude, Code, Platform…), including *Building with the Claude API* (≈9 h, 67 lessons), *Claude Platform 101*, *Claude Code 101*, *Claude Code in Action*, *Introduction to Model Context Protocol*, *MCP: Advanced Topics*, *Introduction to agent skills*, *Introduction to subagents*, *AI Fluency for builders*, *AI Capabilities and Limitations*. **No "Developer" or "Architect" path.** |
| **Anthropic Partner Academy** — anthropic-partners.skilljar.com | Requires validation at login; certifications are open only to staff of **Claude Partner Network** organisations | Learning paths named **Claude Developer** ("Build, evaluate, and ship agents on Claude") and **Claude Architect** ("Qualify a customer opportunity, design the Claude architecture, and explain your choices"), plus Associate, Forward Deployed Engineer and Administrator. Proctored certifications (Pearson VUE): Developer–Foundations $125, Architect–Foundations $125, Architect–Professional $175; 120 min; pass mark 720/1,000; valid 12 months. |

**Consequence for Teranga:** the Developer and Architect paths are only reachable if Teranga joins the Claude Partner Network. The plan below runs entirely on the free public courses and adds the partner paths and exams as an optional track. **Open decision for the owner: apply to the Claude Partner Network** (partner eligibility and process not verified here).

Course titles in the partner paths, for reference (verified):
- *Claude Developer:* AI Capabilities and Limitations; AI Fluency for Builders; Claude Platform & Model Foundations; Claude Platform 101; Claude Code 101; Claude Code in Action; Introduction to Model Context Protocol; Introduction to agent skills; Introduction to subagents.
- *Claude Architect:* the shared foundations above plus Product Foundations (model choice), Deployment Architecture (gateways, data residency) and Delivery Methodology (ROI, pilots, adoption).

Exam weightings are a useful guide to what matters in practice. Developer–Foundations: Applications and Integration 33%, Model Selection and Optimisation 17%, Agents and Workflows 15%, Prompt and Context Engineering 11%, Tools and MCP 11%, Security and Safety 8%. Architect–Foundations: Agentic Architecture & Orchestration 27%, Claude Code Configuration 20%, Prompt Engineering & Structured Output 20%, Tool Design & MCP 18%, Context Management & Reliability 15%.

Gaps to fill with our own practice (no course is dedicated to them): **observability** and **RAG** depth. Prompt-caching implementation is taught in *Building with the Claude API* but is listed as out of scope for the Architect–Foundations exam.

## 2. The plan

Assumes 2–4 engineers, about 4 hours of learning a week each, plus one internal build per phase. Each phase ends with something demonstrable.

### Days 1–30 — Foundations: tools, prompts, evaluation, cost

**Learn (public, free)**
- *Building with the Claude API*: prompt engineering, **tool use**, **prompt evaluation**, **prompt caching** and the rules of caching, extended thinking.
- *Claude Platform 101*, *AI Capabilities and Limitations*.

**Build**
- A shared repo: prompt templates under version control, a **golden test set** format (inputs, expected output, grading rule) and a small **eval harness** that runs a prompt version against the set and records pass rate, cost and latency.
- One tool-use prototype on synthetic bilingual documents (FR/EN): extract fields from an invoice-like PDF into a strict JSON schema.
- **Token accounting from day one:** log input, output, cache-write and cache-read tokens per request, and compute cost per request.

**Exit criteria**
- Every engineer has completed the tool-use, evaluation and caching modules.
- The prototype has an eval scorecard (field-level accuracy on ≥30 cases) and a cost-per-document figure.

### Days 31–60 — Production patterns: orchestration, observability, routing, human approval

**Learn**
- *Introduction to Model Context Protocol*, *MCP: Advanced Topics*, *Claude Code in Action*, *Introduction to subagents*, *Introduction to agent skills*; the "Agents and workflows" and "RAG and agentic search" modules of *Building with the Claude API*.

**Practise these as team standards**
- **Agentic orchestration:** prefer a fixed workflow (classify → extract → validate) over a free-running agent unless the task needs open-ended steps; cap tool calls and steps per run.
- **Observability:** one trace per request with prompt version, model, tokens (incl. cache), latency, tool calls, outcome and reviewer action; personal data redacted from logs.
- **Model routing:** decide by eval results, not intuition — try the smallest model that passes the golden set; escalate only failing cases to a larger model.
- **Token cost control:** cache stable system prompts and reference material; use the Batches API for anything not interactive; set `max_tokens`, per-tenant budgets and alerts.
- **Human-in-the-loop approvals:** a review queue with confidence thresholds, edit capture and an audit log — the pattern already shipped in Radiora (AI drafts, a qualified person validates and signs).

**Build**
- Solution A (below) as an end-to-end demo with review queue, traces and an eval report.

**Exit criteria**
- Demo runs on realistic data with a written scorecard: accuracy, reviewer edit rate, p95 latency, cost per item.
- A one-page runbook: deploy, monitor, roll back a prompt version.

### Days 61–90 — Security, privacy and sell-ready offers

**Learn / practise**
- **Security:** prompt-injection defences for tool-using systems (treat retrieved content and user files as data, never instructions), least-privilege tools, human confirmation for irreversible actions, secrets handling, tenant isolation tests.
- **Privacy:** data minimisation, retention limits, client data-processing terms, cross-border transfer questions. For Senegal, check obligations with the Commission de Protection des Données Personnelles (CDP); for EU clients, GDPR. **Get legal review before making any compliance claim.**
- Optional partner track (if Teranga joins the Claude Partner Network): Claude Developer path → Developer–Foundations exam; Claude Architect path → Architect–Foundations exam.

**Build**
- Solutions B and C as demos.
- For each of A, B, C: a one-page offer (problem, workflow, what a person approves, eval criteria, pilot scope). Pricing set by the owner.
- An internal AI security and privacy checklist applied to all three demos.

**Exit criteria**
- Three demonstrable pilots with scorecards, ready for discovery calls.
- (If partner) at least one engineer certified.

## 3. Three AI solutions Teranga can sell

All cost figures below are **assumptions for illustration**, using list prices published on platform.claude.com on 2026-10-22: per million tokens, Claude Haiku 5.5 $0.10 input / $0.50 output (prompts ≤100K tokens), Claude Sonnet 5.5 $2 / $10, Claude Opus 5.5 $4 / $20. Cache reads cost a fraction of the input price; the Batches API gives 50% off input and output. **Re-check prices before quoting a client, and add hosting, speech-to-text, storage and support costs.**

### A. Bilingual document intake and review
Invoices, forms, purchase orders or emails (FR/EN) → structured records in the client's system, with a review queue for anything uncertain.
- **Complexity:** Medium. Typical pilot 3–6 weeks [assumption]. Building blocks: OCR/PDF text, tool use with strict JSON schema, validation rules, review UI, export to the client's system.
- **Operating cost (assumption):** ~3,000 input + 500 output tokens per document → about $0.0006 per document on Haiku 5.5 or about $0.011 on Sonnet 5.5, before caching or batch discounts. The model bill is usually small next to review time and integration work.
- **Evaluation criteria:** field-level accuracy on a golden set of ≥100 real documents; share of documents accepted without edits; reviewer edit rate per field; wrong-field rate (silent errors); p95 processing time.

### B. Dictation to structured report (the Radiora pattern, for other sectors)
Voice notes from inspectors, field agents, clinicians or lawyers → a structured report in the organisation's template, reviewed and signed by the author.
- **Complexity:** Medium–High. Typical pilot 4–8 weeks [assumption]. Building blocks: speech-to-text (vendor to select — Claude's role here is structuring text, not transcription), section templates, correction by voice or text, sign-off and audit trail, PDF/Word export.
- **Operating cost (assumption):** speech-to-text priced per audio minute by the chosen vendor, plus ~1,500 input + 600 output tokens per report → about $0.009 on Sonnet 5.5. Cache the template and instructions across reports.
- **Evaluation criteria:** content placed in the correct section; critical-omission rate (anything said but missing from the report) — target zero on the test set; edit distance before sign-off; time from end of dictation to signed report; author satisfaction.

### C. Bilingual support copilot for WhatsApp and email
Incoming customer messages are classified, matched to the knowledge base and answered with a draft that an agent approves, edits or rejects.
- **Complexity:** Medium. Typical pilot 4–6 weeks [assumption]. Building blocks: channel integration (WhatsApp Business API or email), retrieval over FAQs and policies in FR/EN, routing (small model to classify, larger model to draft), agent review UI, analytics.
- **Operating cost (assumption):** classification on Haiku 5.5 is a fraction of a cent per message; drafting ~4,000 input (with retrieved context) + 300 output tokens → about $0.011 per draft on Sonnet 5.5, less with caching of the shared knowledge and instructions. WhatsApp Business messaging fees are separate.
- **Evaluation criteria:** answer correctness on a golden set of real questions; citation accuracy (every claim traceable to a source document); share of drafts sent with no or minor edits; hallucination rate; first-response time; escalation correctness for sensitive topics.

### How to choose which to lead with
Lead with **A** for SMEs (fastest to prove, easiest to measure), **B** where Teranga's Radiora experience is directly relevant (health, inspection, legal), and **C** for consumer-facing businesses whose customers already use WhatsApp.

## Sources (checked 2026-10-22)
- Claude Academy: https://academy.claude.com/ · https://academy.claude.com/all · https://academy.claude.com/products/platform
- Anthropic courses catalogue: https://anthropic.skilljar.com/ · *Building with the Claude API*: https://anthropic.skilljar.com/claude-with-the-anthropic-api · https://www.anthropic.com/learn
- Partner learning paths: https://anthropic-partners.skilljar.com/page/learning-paths · Developer path: https://anthropic-partners.skilljar.com/path/claude-developer · Architect path: https://anthropic-partners.skilljar.com/path/claude-architect
- Partner certifications: https://anthropic-partners.skilljar.com/page/partner-certifications · eligibility: https://anthropic-partners.skilljar.com/page/certification-eligibility · FAQ: https://anthropic-partners.skilljar.com/page/faq-certifications
- API pricing: https://platform.claude.com/docs/en/about-claude/pricing · models: https://platform.claude.com/docs/en/about-claude/models/overview · prompt caching: https://platform.claude.com/docs/en/build-with-claude/prompt-caching · batches: https://platform.claude.com/docs/en/build-with-claude/batch-processing · tool use: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
