/* ============================================================
   Teranga Technologies — Main Script
   - Bilingual content (EN/FR) with URL, saved and browser detection
   - Mobile navigation
   - Hero demo animation (Radiora reporting flow)
   - Discovery-call form → /api/contact
   - Conversion events (forwarded to analytics if one is installed)
   ============================================================ */

(function () {
  'use strict';

  // There is no scheduling integration yet: discovery-call buttons open the request form,
  // and the team replies to schedule. If a booking page (e.g. Calendly / Cal.com) is set up
  // later, put its URL here: the buttons will then say "Book…" and open it directly.
  var BOOKING_URL = '';

  var NB = ' '; // non-breaking space for French punctuation

  // ── Translations ───────────────────────────────────────────
  var i18n = {
    en: {
      'meta.title': 'Teranga Technologies — SaaS, AI integration and app development | Dakar, Senegal',
      'meta.desc':  'Teranga Technologies designs and builds SaaS platforms, AI integrations, and web and mobile apps for startups, growing SMEs and enterprise teams. Bilingual French/English delivery from Dakar, Senegal.',

      'a11y.skip':        'Skip to content',
      'a11y.nav':         'Main',
      'a11y.nav.mobile':  'Mobile',
      'a11y.lang':        'Language',
      'a11y.menu.open':   'Open menu',
      'a11y.menu.close':  'Close menu',
      'a11y.newtab':      ' (opens in a new tab)',
      'a11y.top':         'Teranga Technologies — back to top',

      'nav.services': 'Services',
      'nav.ai':       'AI engineering',
      'nav.work':     'Work',
      'nav.process':  'Process',
      'nav.faq':      'FAQ',

      'cta.call':       'Request a discovery call',
      'cta.call.short': 'Request a call',
      'cta.book':       'Book a discovery call',
      'cta.book.short': 'Book a call',
      'cta.work':       'See our work',

      'hero.kicker': 'Software engineering for startups, SMEs and enterprise teams',
      'hero.title':  'Intelligent software that accelerates growth and automates operations.',
      'hero.sub':    'We design and build SaaS platforms, AI integrations, and web and mobile apps that create measurable business value — delivered in French or English, from Dakar to clients worldwide.',
      'hero.proof':  'Recent work: <a href="#work-radiora">Radiora Medical</a>, AI-assisted radiology reporting, and <a href="#work-edusen">EduSen</a>, school management SaaS.',

      'demo.status.listening':   'Listening',
      'demo.status.structuring': 'Structuring',
      'demo.status.ready':       'Ready for review',
      'demo.dictation':  'Dictation',
      'demo.transcript': 'Abdominal CT without contrast for right upper quadrant pain. Liver normal in size. No biliary dilatation. Simple two-centimetre cyst in the right kidney. Conclusion: simple renal cyst, no other significant finding.',
      'demo.report': 'Structured report, draft',
      'demo.s1':  'Indication',
      'demo.s1v': 'Right upper quadrant pain.',
      'demo.s2':  'Technique',
      'demo.s2v': 'Abdominal CT without contrast.',
      'demo.s3':  'Results',
      'demo.s3v': 'Liver normal in size. No biliary dilatation. Simple 2 cm cyst, right kidney.',
      'demo.s4':  'Conclusion',
      'demo.s4v': 'Simple right renal cyst. No other significant finding.',
      'demo.sign': 'The AI drafts. Only the radiologist can validate and sign.',
      'demo.cap':  'Reporting flow in Radiora Medical, a product built by Teranga Technologies. Illustrative example, not patient data.',

      'proof.title': 'Why you can trust our delivery',
      'proof.1.h': 'A live healthcare AI product',
      'proof.1.p': 'Radiora Medical turns dictation into structured radiology reports, with the radiologist keeping final sign-off.',
      'proof.2.h': 'SaaS built for schools',
      'proof.2.p': 'EduSen covers student records, attendance, fees and report cards, designed for Senegalese private schools.',
      'proof.3.h': 'MVPs in 4–8 weeks',
      'proof.3.p': 'Typical timeline for a focused first version, confirmed once scope is agreed.',
      'proof.4.h': 'French and English',
      'proof.4.p': 'Discovery, delivery and documentation in either language, for francophone and anglophone teams.',

      'svc.title': 'Services built around business outcomes',
      'svc.intro': 'Every engagement starts with the result you need to see — revenue, hours saved, faster decisions — and works back to the software that delivers it.',
      'svc.after': 'After launch, we can maintain, monitor and improve what we built, so your product keeps pace with your business.',
      'svc.uses':  'Typical uses',

      'svc.saas.name': 'SaaS development',
      'svc.saas.h':    'Launch a SaaS product you can sell, scale and maintain.',
      'svc.saas.p':    'From first version to paying customers: multi-tenant architecture, authentication, subscriptions and admin tools designed so you can validate quickly and grow without a rewrite.',
      'svc.saas.u1':   'An MVP for a funded startup',
      'svc.saas.u2':   'Turning an internal tool into a product',
      'svc.saas.u3':   'Multi-site platforms for clinics, schools or agencies',
      'svc.saas.cta':  'Discuss your SaaS project',

      'svc.ai.name': 'AI integration',
      'svc.ai.h':    'Put AI to work inside your real workflows.',
      'svc.ai.p':    'We connect language models to your data and tools to automate repetitive work and support decisions — with quality testing, cost controls and human approval wherever the stakes are high.',
      'svc.ai.u1':   'Turning dictation and documents into structured records',
      'svc.ai.u2':   'Drafting replies and reports for your team to review',
      'svc.ai.u3':   'Searching internal knowledge in French and English',
      'svc.ai.cta':  'Explore an AI use case',

      'svc.web.name': 'Web applications',
      'svc.web.h':    'Replace spreadsheets and manual steps with one reliable system.',
      'svc.web.p':    'Custom portals, dashboards and back-office tools that give your team real-time visibility, connect to the systems you already use and remove hours of manual work.',
      'svc.web.u1':   'Operations dashboards and reporting',
      'svc.web.u2':   'Client, partner and staff portals',
      'svc.web.u3':   'Connecting payments and messaging, such as Wave, Orange Money or WhatsApp',
      'svc.web.cta':  'Plan your web application',

      'svc.mob.name': 'Mobile applications',
      'svc.mob.h':    'Put your service in your customers’ pocket.',
      'svc.mob.p':    'iOS and Android apps for customers and field teams — sign-up, payments, notifications and day-to-day processes — running on the same backend as your web platform.',
      'svc.mob.u1':   'Customer apps for bookings, orders and payments',
      'svc.mob.u2':   'Field apps for data collection and reporting',
      'svc.mob.u3':   'A companion app for an existing SaaS',
      'svc.mob.cta':  'Scope your mobile app',

      'svc.des.name': 'Web design',
      'svc.des.h':    'A website that earns trust and turns visits into conversations.',
      'svc.des.p':    'Clear positioning, fast pages and accessible design that make your company credible to international buyers and easy to contact.',
      'svc.des.u1':   'Company and product websites',
      'svc.des.u2':   'Landing pages for launches and campaigns',
      'svc.des.u3':   'Bilingual French/English sites',
      'svc.des.cta':  'Improve your website',

      'ai.title': 'AI engineering that holds up in production',
      'ai.intro': 'We treat AI as a component to design, test and monitor — not a demo. Where it saves time or improves decisions, we build it in. Where a simpler solution works better, we say so.',
      'ai.1.h': 'Start from a workflow and a number',
      'ai.1.p': 'We pick one process and the metric it should move — time per task, error rate, response time — before choosing a model.',
      'ai.2.h': 'Test quality before anyone relies on it',
      'ai.2.p': 'We build test sets from real cases and check accuracy, tone and failure modes before launch, then keep checking after it.',
      'ai.3.h': 'Keep people in charge of decisions that matter',
      'ai.3.p': 'In Radiora Medical, the AI drafts and structures reports. It never diagnoses, and only the radiologist can validate and sign.',
      'ai.4.h': 'Keep running costs predictable',
      'ai.4.p': 'Right-sized models for each task, caching and usage limits, so the cost per request is known before you scale.',
      'ai.5.h': 'Protect your data',
      'ai.5.p': 'Access control, isolation between organisations and audit trails, so every record and every action can be traced.',
      'ai.tag.method':  'How we work',
      'ai.tag.radiora': 'Shipped in Radiora Medical',
      'ai.tag.both':    'Shipped in Radiora and EduSen',
      'ai.cta.p':   'Have a process that eats hours every week?',
      'ai.cta.btn': 'Explore an AI use case',

      'work.title': 'Selected work',
      'work.intro': 'Two products we designed and built, described by what they actually do today.',
      'case.built':       'What it does',
      'case.oversight':   'Human oversight',
      'case.foundations': 'Foundations',
      'case.results':     'Results',
      'case.results.pending': 'Measured results are being compiled. We’ll share current figures on a discovery call.',

      'case.r.sector': 'Healthcare AI',
      'case.r.alt':    'Radiora Medical home page: AI-assisted radiology reports for clinics',
      'case.r.lead':   'AI-assisted radiology reporting for clinics and imaging centres in Senegal and West Africa.',
      'case.r.f1': 'Dictate from a computer, a phone (scan a QR code, no app to install) or an audio file',
      'case.r.f2': 'AI structures free dictation into Indication, Technique, Results and Conclusion as you speak',
      'case.r.f3': 'Spoken corrections, free editing, then export to PDF or Word',
      'case.r.f4': 'Data isolated per establishment, with a full audit trail',
      'case.r.o':  'The AI never diagnoses and never signs. The radiologist reviews, validates and signs every report.',
      'case.r.visit': 'Visit Radiora Medical',
      'case.r.cta':   'Discuss a similar AI product',

      'case.e.sector': 'Education SaaS',
      'case.e.alt':    'EduSen home page: modern school management for Senegalese schools',
      'case.e.lead':   'School management SaaS designed for private schools in Senegal.',
      'case.e.f1': 'Student records with admission numbers, searchable in seconds',
      'case.e.f2': 'Daily digital attendance by class, with notifications to families',
      'case.e.f3': 'Tuition tracking with digital receipts',
      'case.e.f4': 'Grade entry, automatic averages and term report cards',
      'case.e.o':  'Strict data isolation between schools, logged access to records, a real-time admin dashboard and a French interface aligned with Senegalese school conventions.',
      'case.e.visit': 'Visit EduSen',
      'case.e.cta':   'Discuss a similar SaaS',

      'more.title':    'Also built by Teranga',
      'more.xp':       'Customer-experience learning platform with courses, quizzes, certificates and corporate training.',
      'more.sunu':     'Driving-licence administration: driving schools, exam sessions, appointments and oversight.',
      'more.clinic.h': 'Clinic Management System',
      'more.clinic':   'Patient records, appointments, consultations, billing and documents in one system.',

      'proc.title': 'How an engagement works',
      'proc.intro': 'Four steps, with a clear decision point before any build starts.',
      'proc.1.h': 'Discovery call',
      'proc.1.p': 'We clarify the outcome you’re after, your users, your constraints and what success looks like in numbers.',
      'proc.2.h': 'Scope and estimate',
      'proc.2.p': 'You receive a written scope with milestones, a delivery plan and a cost estimate. A focused MVP is typically scoped for 4–8 weeks.',
      'proc.3.h': 'Build in short iterations',
      'proc.3.p': 'Working software demonstrated regularly, so you see real progress and can adjust priorities as you learn.',
      'proc.4.h': 'Launch and improve',
      'proc.4.p': 'Deployment, monitoring and handover, then ongoing maintenance and improvements if you need them.',

      'why.title': 'Why work with Teranga',
      'why.p1': '“Teranga” is the Wolof word for hospitality, a value at the heart of Senegalese culture. For us it means treating your project with the care, candour and follow-through you would expect from your own team.',
      'why.p2': 'We are an engineering partner based in Dakar, working with clients across Africa and internationally to the same standards a global buyer expects.',
      'why.1.h': 'Bilingual by default',
      'why.1.p': 'Workshops, specifications and support in French or English, so every stakeholder stays aligned.',
      'why.2.h': 'Engineering you can hand over',
      'why.2.p': 'Version-controlled code, documented architecture and a clean handover, so you are never locked in.',
      'why.3.h': 'AI with judgement',
      'why.3.p': 'We recommend AI where it pays off, design human review into high-stakes steps, and say so when it isn’t needed.',
      'why.4.h': 'Speed with a plan',
      'why.4.p': 'Focused MVPs are typically scoped for 4–8 weeks, with milestones you can check along the way.',
      'why.5.h': 'Clear communication',
      'why.5.p': 'Regular demos and honest timelines. You always know where the project stands and what comes next.',
      'why.6.h': 'Working hours that match yours',
      'why.6.p': 'Dakar runs on UTC+0 all year: same hours as London in winter, close to Paris, and overlapping New York mornings.',

      'faq.title': 'Questions clients ask before starting',
      'faq.intro': 'Can’t find your answer? Ask us directly on a discovery call.',
      'faq.1.q': 'How much does a project cost?',
      'faq.1.a': 'It depends on scope, integrations and the level of polish you need at launch. After the discovery call, we send a written estimate tied to clear milestones. For larger products we often recommend a phased plan, so you invest in the first release before committing to the full roadmap.',
      'faq.2.q': 'How long does an MVP take?',
      'faq.2.a': 'A focused first version is typically scoped for 4–8 weeks. We confirm the timeline once the scope is agreed, and we tell you early if anything puts it at risk.',
      'faq.3.q': 'Do you work with clients outside Senegal?',
      'faq.3.a': 'Yes. We work remotely with clients in Senegal and internationally, in French or English. Dakar is on UTC+0 all year, which makes collaboration with Europe straightforward and leaves a good daily overlap with North America.',
      'faq.4.q': 'How do you use AI responsibly?',
      'faq.4.a': 'We start from a specific workflow, test output quality on real cases before launch, keep people in charge of high-stakes decisions and control who can access what data. In Radiora Medical, for example, the AI structures reports but only a radiologist can validate and sign them.',
      'faq.5.q': 'Can you work on our existing product or with our team?',
      'faq.5.a': 'Yes. We can extend an existing codebase, integrate with your current systems, or add AI features to a product already in use. We start by reviewing what exists so recommendations are grounded in your actual code and constraints.',
      'faq.6.q': 'Who owns the code?',
      'faq.6.a': 'Ownership is set out in the contract. Our standard approach is that you own the custom code and deliverables we build for you once the project is paid, with documentation so any team can take it over.',
      'faq.7.q': 'What happens after launch?',
      'faq.7.a': 'We can handle maintenance, monitoring, updates and new features on an ongoing basis, or hand everything over to your team with documentation and a walkthrough.',

      'ct.title': 'Tell us what you want to build',
      'ct.lead':  'Share a few details and we’ll reply within 24 hours to schedule a discovery call. No commitment, and no sales script.',
      'ct.d.whatsapp': 'WhatsApp',
      'ct.d.email':    'Email',
      'ct.d.phone':    'Phone',
      'ct.d.office':   'Office',
      'ct.d.address':  'Ngor Almadies, Dakar, Senegal',

      'f.title':    'Request a discovery call',
      'f.name':     'Full name',
      'f.email':    'Work email',
      'f.company':  'Company',
      'f.optional': '(optional)',
      'f.service':  'What do you need?',
      'f.service.ph':      'Choose a service…',
      'f.service.support': 'Maintenance and support',
      'f.service.other':   'Not sure yet',
      'f.timeline':         'When would you like to start?',
      'f.timeline.ph':      'Select a timeframe…',
      'f.timeline.asap':    'As soon as possible',
      'f.timeline.1to3':    'Within 1–3 months',
      'f.timeline.3to6':    'Within 3–6 months',
      'f.timeline.explore': 'Just exploring',
      'f.message':      'What are you trying to achieve?',
      'f.message.hint': 'A few sentences is enough: the problem, who it’s for, and any deadline.',
      'f.submit':   'Request a discovery call',
      'f.note':     'We use your details only to reply to this request.',
      'f.success':  'Request sent. We’ll reply within 24 hours to schedule your discovery call.',
      'f.error':    'We couldn’t send your request, but your message is not lost. Send it to <a href="mailto:seckbara23@gmail.com" data-fallback="email">seckbara23@gmail.com</a> or on <a href="https://wa.me/221707157070" target="_blank" rel="noopener noreferrer" data-fallback="whatsapp">WhatsApp</a>: both open with your message already filled in.',
      'v.name':    'Enter your name.',
      'v.email':   'Enter a valid email address, like name@company.com.',
      'v.service': 'Choose the service closest to your need.',
      'v.message': 'Tell us in a few words what you want to achieve (at least 10 characters).',

      'ft.tagline':  'Intelligent software for growing businesses, built in Dakar for clients worldwide.',
      'ft.services': 'Services',
      'ft.company':  'Company',
      'ft.why':      'Why Teranga',
      'ft.contact':  'Contact',
      'ft.reach':    'Reach us',
      'ft.copy':     '© 2026 Teranga Technologies. All rights reserved.',
      'ft.made':     'Designed and engineered in Dakar, Senegal.'
    },

    fr: {
      'meta.title': 'Teranga Technologies — Développement SaaS, intégration d’IA et applications | Dakar, Sénégal',
      'meta.desc':  'Teranga Technologies conçoit et développe des plateformes SaaS, des intégrations d’IA et des applications web et mobiles pour startups, PME en croissance et grands groupes. Accompagnement bilingue français/anglais depuis Dakar.',

      'a11y.skip':        'Aller au contenu',
      'a11y.nav':         'Principale',
      'a11y.nav.mobile':  'Mobile',
      'a11y.lang':        'Langue',
      'a11y.menu.open':   'Ouvrir le menu',
      'a11y.menu.close':  'Fermer le menu',
      'a11y.newtab':      ' (s’ouvre dans un nouvel onglet)',
      'a11y.top':         'Teranga Technologies — retour en haut',

      'nav.services': 'Services',
      'nav.ai':       'Ingénierie IA',
      'nav.work':     'Réalisations',
      'nav.process':  'Méthode',
      'nav.faq':      'FAQ',

      'cta.call':       'Demander un appel découverte',
      'cta.call.short': 'Demander un appel',
      'cta.book':       'Réserver un appel découverte',
      'cta.book.short': 'Réserver un appel',
      'cta.work':       'Voir nos réalisations',

      'hero.kicker': 'Ingénierie logicielle pour startups, PME et grands groupes',
      'hero.title':  'Des logiciels intelligents qui accélèrent votre croissance et automatisent vos opérations.',
      'hero.sub':    'Nous concevons et développons des plateformes SaaS, des intégrations d’IA et des applications web et mobiles qui créent une valeur mesurable pour votre activité — en français ou en anglais, depuis Dakar, pour des clients du monde entier.',
      'hero.proof':  'Réalisations récentes' + NB + ': <a href="#work-radiora">Radiora Medical</a>, compte rendu radiologique assisté par IA, et <a href="#work-edusen">EduSen</a>, SaaS de gestion scolaire.',

      'demo.status.listening':   'Écoute en cours',
      'demo.status.structuring': 'Structuration',
      'demo.status.ready':       'Prêt pour relecture',
      'demo.dictation':  'Dictée',
      'demo.transcript': 'Scanner abdominal sans injection pour douleur de l’hypocondre droit. Foie de taille normale. Pas de dilatation des voies biliaires. Kyste simple de deux centimètres au rein droit. Conclusion' + NB + ': kyste rénal simple, pas d’autre anomalie significative.',
      'demo.report': 'Compte rendu structuré, brouillon',
      'demo.s1':  'Indication',
      'demo.s1v': 'Douleur de l’hypocondre droit.',
      'demo.s2':  'Technique',
      'demo.s2v': 'Scanner abdominal sans injection.',
      'demo.s3':  'Résultats',
      'demo.s3v': 'Foie de taille normale. Pas de dilatation des voies biliaires. Kyste simple de 2' + NB + 'cm du rein droit.',
      'demo.s4':  'Conclusion',
      'demo.s4v': 'Kyste rénal droit simple. Pas d’autre anomalie significative.',
      'demo.sign': 'L’IA rédige. Seul le radiologue peut valider et signer.',
      'demo.cap':  'Flux de compte rendu dans Radiora Medical, un produit développé par Teranga Technologies. Exemple illustratif, sans données patient.',

      'proof.title': 'Pourquoi nous faire confiance',
      'proof.1.h': 'Une IA santé en ligne',
      'proof.1.p': 'Radiora Medical transforme la dictée en comptes rendus radiologiques structurés, le radiologue gardant la signature finale.',
      'proof.2.h': 'Un SaaS conçu pour les écoles',
      'proof.2.p': 'EduSen couvre dossiers élèves, présences, frais de scolarité et bulletins, pensé pour les écoles privées sénégalaises.',
      'proof.3.h': 'Un MVP en 4' + NB + 'à' + NB + '8' + NB + 'semaines',
      'proof.3.p': 'Délai type pour une première version ciblée, confirmé une fois le périmètre validé.',
      'proof.4.h': 'Français et anglais',
      'proof.4.p': 'Cadrage, livraison et documentation dans l’une ou l’autre langue, pour des équipes francophones comme anglophones.',

      'svc.title': 'Des services pensés pour vos résultats',
      'svc.intro': 'Chaque mission part du résultat que vous voulez constater — chiffre d’affaires, heures gagnées, décisions plus rapides — pour remonter jusqu’au logiciel qui le produit.',
      'svc.after': 'Après le lancement, nous assurons la maintenance, le suivi et les évolutions de ce que nous avons construit, pour que votre produit avance au rythme de votre activité.',
      'svc.uses':  'Cas d’usage types',

      'svc.saas.name': 'Développement SaaS',
      'svc.saas.h':    'Lancez un produit SaaS que vous pourrez vendre, faire grandir et maintenir.',
      'svc.saas.p':    'De la première version aux premiers clients payants' + NB + ': architecture multi-tenant, authentification, abonnements et outils d’administration, conçus pour valider vite et grandir sans tout réécrire.',
      'svc.saas.u1':   'Un MVP pour une startup financée',
      'svc.saas.u2':   'Transformer un outil interne en produit',
      'svc.saas.u3':   'Des plateformes multi-sites pour cliniques, écoles ou agences',
      'svc.saas.cta':  'Parler de votre projet SaaS',

      'svc.ai.name': 'Intégration d’IA',
      'svc.ai.h':    'Mettez l’IA au travail dans vos processus réels.',
      'svc.ai.p':    'Nous connectons les modèles de langage à vos données et à vos outils pour automatiser les tâches répétitives et éclairer les décisions — avec tests de qualité, maîtrise des coûts et validation humaine dès que l’enjeu l’exige.',
      'svc.ai.u1':   'Transformer dictées et documents en données structurées',
      'svc.ai.u2':   'Préparer réponses et rapports relus par vos équipes',
      'svc.ai.u3':   'Interroger vos connaissances internes en français et en anglais',
      'svc.ai.cta':  'Étudier un cas d’usage IA',

      'svc.web.name': 'Applications web',
      'svc.web.h':    'Remplacez tableurs et tâches manuelles par un seul système fiable.',
      'svc.web.p':    'Portails, tableaux de bord et outils de gestion sur mesure qui donnent à vos équipes une visibilité en temps réel, se connectent à vos outils existants et suppriment des heures de saisie.',
      'svc.web.u1':   'Tableaux de bord et reporting opérationnels',
      'svc.web.u2':   'Portails clients, partenaires et collaborateurs',
      'svc.web.u3':   'Connexion aux paiements et à la messagerie, comme Wave, Orange Money ou WhatsApp',
      'svc.web.cta':  'Planifier votre application web',

      'svc.mob.name': 'Applications mobiles',
      'svc.mob.h':    'Votre service, dans la poche de vos clients.',
      'svc.mob.p':    'Applications iOS et Android pour vos clients et vos équipes terrain — inscription, paiements, notifications et processus du quotidien — reliées au même backend que votre plateforme web.',
      'svc.mob.u1':   'Applications clients pour réservations, commandes et paiements',
      'svc.mob.u2':   'Applications terrain pour la collecte et le reporting',
      'svc.mob.u3':   'Une application compagnon pour un SaaS existant',
      'svc.mob.cta':  'Cadrer votre application mobile',

      'svc.des.name': 'Design web',
      'svc.des.h':    'Un site qui inspire confiance et transforme les visites en rendez-vous.',
      'svc.des.p':    'Un positionnement clair, des pages rapides et un design accessible qui crédibilisent votre entreprise auprès des acheteurs internationaux et facilitent la prise de contact.',
      'svc.des.u1':   'Sites d’entreprise et de produit',
      'svc.des.u2':   'Pages de lancement et de campagne',
      'svc.des.u3':   'Sites bilingues français/anglais',
      'svc.des.cta':  'Améliorer votre site',

      'ai.title': 'Une ingénierie IA qui tient la route en production',
      'ai.intro': 'Pour nous, l’IA est un composant à concevoir, tester et surveiller — pas une démo. Là où elle fait gagner du temps ou améliore les décisions, nous l’intégrons. Là où une solution plus simple suffit, nous le disons.',
      'ai.1.h': 'Partir d’un processus et d’un chiffre',
      'ai.1.p': 'Nous choisissons un processus et l’indicateur qu’il doit faire bouger — temps par tâche, taux d’erreur, délai de réponse — avant de choisir un modèle.',
      'ai.2.h': 'Tester la qualité avant que quiconque s’y fie',
      'ai.2.p': 'Nous constituons des jeux de test à partir de cas réels et vérifions exactitude, ton et cas d’échec avant le lancement, puis nous continuons à les vérifier ensuite.',
      'ai.3.h': 'Garder l’humain aux commandes des décisions importantes',
      'ai.3.p': 'Dans Radiora Medical, l’IA rédige et structure les comptes rendus. Elle ne pose jamais de diagnostic, et seul le radiologue peut valider et signer.',
      'ai.4.h': 'Des coûts d’exploitation prévisibles',
      'ai.4.p': 'Des modèles dimensionnés pour chaque tâche, de la mise en cache et des plafonds d’usage' + NB + ': le coût par requête est connu avant de passer à l’échelle.',
      'ai.5.h': 'Protéger vos données',
      'ai.5.p': 'Contrôle des accès, isolation entre organisations et pistes d’audit' + NB + ': chaque donnée et chaque action restent traçables.',
      'ai.tag.method':  'Notre méthode',
      'ai.tag.radiora': 'En production dans Radiora Medical',
      'ai.tag.both':    'En production dans Radiora et EduSen',
      'ai.cta.p':   'Un processus vous coûte des heures chaque semaine' + NB + '?',
      'ai.cta.btn': 'Étudier un cas d’usage IA',

      'work.title': 'Nos réalisations',
      'work.intro': 'Deux produits que nous avons conçus et développés, décrits par ce qu’ils font réellement aujourd’hui.',
      'case.built':       'Ce qu’il fait',
      'case.oversight':   'Contrôle humain',
      'case.foundations': 'Fondations',
      'case.results':     'Résultats',
      'case.results.pending': 'Les résultats mesurés sont en cours de consolidation. Nous partageons les chiffres à jour lors d’un appel découverte.',

      'case.r.sector': 'IA santé',
      'case.r.alt':    'Page d’accueil de Radiora Medical' + NB + ': comptes rendus radiologiques assistés par IA pour les cliniques',
      'case.r.lead':   'Compte rendu radiologique assisté par IA pour les cliniques et centres d’imagerie au Sénégal et en Afrique de l’Ouest.',
      'case.r.f1': 'Dictée depuis un ordinateur, un téléphone (scan d’un QR code, sans application à installer) ou un fichier audio',
      'case.r.f2': 'L’IA structure la dictée libre en Indication, Technique, Résultats et Conclusion, au fil de la parole',
      'case.r.f3': 'Corrections dictées, édition libre, puis export en PDF ou Word',
      'case.r.f4': 'Données isolées par établissement, avec une piste d’audit complète',
      'case.r.o':  'L’IA ne pose jamais de diagnostic et ne signe jamais. Le radiologue relit, valide et signe chaque compte rendu.',
      'case.r.visit': 'Découvrir Radiora Medical',
      'case.r.cta':   'Parler d’un produit IA similaire',

      'case.e.sector': 'SaaS éducation',
      'case.e.alt':    'Page d’accueil d’EduSen' + NB + ': gestion scolaire moderne pour les établissements sénégalais',
      'case.e.lead':   'SaaS de gestion scolaire conçu pour les écoles privées du Sénégal.',
      'case.e.f1': 'Dossiers élèves avec numéro d’admission, retrouvés en quelques secondes',
      'case.e.f2': 'Appel numérique quotidien par classe, avec notification des familles',
      'case.e.f3': 'Suivi des frais de scolarité avec reçus numériques',
      'case.e.f4': 'Saisie des notes, moyennes automatiques et bulletins trimestriels',
      'case.e.o':  'Isolation stricte des données entre écoles, accès aux dossiers journalisés, tableau de bord administratif en temps réel et interface en français adaptée aux usages scolaires sénégalais.',
      'case.e.visit': 'Découvrir EduSen',
      'case.e.cta':   'Parler d’un SaaS similaire',

      'more.title':    'Également développés par Teranga',
      'more.xp':       'Plateforme de formation à l’expérience client' + NB + ': cours, quiz, certificats et formations en entreprise.',
      'more.sunu':     'Administration du permis de conduire' + NB + ': auto-écoles, sessions d’examen, rendez-vous et supervision.',
      'more.clinic.h': 'Système de gestion de clinique',
      'more.clinic':   'Dossiers patients, rendez-vous, consultations, facturation et documents dans un seul système.',

      'proc.title': 'Comment se déroule une mission',
      'proc.intro': 'Quatre étapes, avec un point de décision clair avant tout développement.',
      'proc.1.h': 'Appel découverte',
      'proc.1.p': 'Nous clarifions le résultat visé, vos utilisateurs, vos contraintes et ce que le succès représente en chiffres.',
      'proc.2.h': 'Cadrage et estimation',
      'proc.2.p': 'Vous recevez un périmètre écrit avec jalons, un plan de livraison et une estimation de coût. Un MVP ciblé se cadre généralement sur 4' + NB + 'à' + NB + '8' + NB + 'semaines.',
      'proc.3.h': 'Développement par itérations courtes',
      'proc.3.p': 'Un logiciel fonctionnel présenté régulièrement' + NB + ': vous voyez les progrès réels et ajustez les priorités au fil de l’eau.',
      'proc.4.h': 'Lancement et amélioration',
      'proc.4.p': 'Mise en production, supervision et passation, puis maintenance et évolutions si vous le souhaitez.',

      'why.title': 'Pourquoi travailler avec Teranga',
      'why.p1': '«' + NB + 'Teranga' + NB + '» signifie hospitalité en wolof, une valeur au cœur de la culture sénégalaise. Pour nous, c’est traiter votre projet avec le soin, la franchise et la constance que vous attendriez de votre propre équipe.',
      'why.p2': 'Nous sommes un partenaire d’ingénierie basé à Dakar, au service de clients en Afrique et à l’international, avec le niveau d’exigence qu’attend un acheteur international.',
      'why.1.h': 'Bilingues par défaut',
      'why.1.p': 'Ateliers, spécifications et support en français ou en anglais, pour que toutes les parties prenantes restent alignées.',
      'why.2.h': 'Un code que vous pouvez reprendre',
      'why.2.p': 'Code versionné, architecture documentée et passation propre' + NB + ': vous n’êtes jamais captif.',
      'why.3.h': 'Une IA employée à bon escient',
      'why.3.p': 'Nous recommandons l’IA là où elle est rentable, intégrons une relecture humaine aux étapes sensibles, et le disons quand elle n’est pas nécessaire.',
      'why.4.h': 'La vitesse, avec un plan',
      'why.4.p': 'Un MVP ciblé se cadre généralement sur 4' + NB + 'à' + NB + '8' + NB + 'semaines, avec des jalons vérifiables tout au long du projet.',
      'why.5.h': 'Une communication claire',
      'why.5.p': 'Démos régulières et délais honnêtes. Vous savez toujours où en est le projet et ce qui suit.',
      'why.6.h': 'Des horaires compatibles avec les vôtres',
      'why.6.p': 'Dakar vit à l’heure UTC+0 toute l’année' + NB + ': les mêmes horaires que Londres en hiver, proches de Paris, et une plage commune avec les matinées de New York.',

      'faq.title': 'Les questions posées avant de démarrer',
      'faq.intro': 'Vous ne trouvez pas votre réponse' + NB + '? Posez-nous la question lors d’un appel découverte.',
      'faq.1.q': 'Combien coûte un projet' + NB + '?',
      'faq.1.a': 'Cela dépend du périmètre, des intégrations et du niveau de finition attendu au lancement. Après l’appel découverte, nous envoyons une estimation écrite liée à des jalons clairs. Pour les produits plus ambitieux, nous recommandons souvent un plan par phases' + NB + ': vous investissez dans une première version avant de vous engager sur toute la feuille de route.',
      'faq.2.q': 'Combien de temps faut-il pour un MVP' + NB + '?',
      'faq.2.a': 'Une première version ciblée se cadre généralement sur 4' + NB + 'à' + NB + '8' + NB + 'semaines. Nous confirmons le délai une fois le périmètre validé, et nous vous alertons tôt si quelque chose le menace.',
      'faq.3.q': 'Travaillez-vous avec des clients hors du Sénégal' + NB + '?',
      'faq.3.a': 'Oui. Nous travaillons à distance avec des clients au Sénégal et à l’international, en français ou en anglais. Dakar est à UTC+0 toute l’année, ce qui simplifie la collaboration avec l’Europe et laisse un bon créneau commun avec l’Amérique du Nord.',
      'faq.4.q': 'Comment utilisez-vous l’IA de façon responsable' + NB + '?',
      'faq.4.a': 'Nous partons d’un processus précis, testons la qualité des résultats sur des cas réels avant le lancement, gardons l’humain aux commandes des décisions sensibles et contrôlons qui accède à quelles données. Dans Radiora Medical, par exemple, l’IA structure les comptes rendus mais seul un radiologue peut les valider et les signer.',
      'faq.5.q': 'Pouvez-vous intervenir sur notre produit existant ou avec notre équipe' + NB + '?',
      'faq.5.a': 'Oui. Nous pouvons faire évoluer une base de code existante, l’intégrer à vos systèmes actuels ou ajouter des fonctionnalités d’IA à un produit déjà en service. Nous commençons par examiner l’existant, pour que nos recommandations s’appuient sur votre code et vos contraintes réels.',
      'faq.6.q': 'À qui appartient le code' + NB + '?',
      'faq.6.a': 'La propriété est définie dans le contrat. Notre approche standard' + NB + ': le code sur mesure et les livrables que nous réalisons vous appartiennent une fois le projet réglé, avec une documentation permettant à n’importe quelle équipe de le reprendre.',
      'faq.7.q': 'Que se passe-t-il après le lancement' + NB + '?',
      'faq.7.a': 'Nous pouvons assurer la maintenance, la supervision, les mises à jour et les nouvelles fonctionnalités dans la durée, ou tout transmettre à votre équipe avec documentation et présentation guidée.',

      'ct.title': 'Parlez-nous de ce que vous voulez construire',
      'ct.lead':  'Donnez-nous quelques détails' + NB + ': nous répondons sous 24' + NB + 'heures pour planifier un appel découverte. Sans engagement, et sans discours commercial.',
      'ct.d.whatsapp': 'WhatsApp',
      'ct.d.email':    'E-mail',
      'ct.d.phone':    'Téléphone',
      'ct.d.office':   'Bureau',
      'ct.d.address':  'Ngor Almadies, Dakar, Sénégal',

      'f.title':    'Demander un appel découverte',
      'f.name':     'Nom complet',
      'f.email':    'E-mail professionnel',
      'f.company':  'Entreprise',
      'f.optional': '(facultatif)',
      'f.service':  'De quoi avez-vous besoin' + NB + '?',
      'f.service.ph':      'Choisissez un service…',
      'f.service.support': 'Maintenance et support',
      'f.service.other':   'Je ne sais pas encore',
      'f.timeline':         'Quand souhaitez-vous démarrer' + NB + '?',
      'f.timeline.ph':      'Choisissez un délai…',
      'f.timeline.asap':    'Dès que possible',
      'f.timeline.1to3':    'D’ici 1 à 3' + NB + 'mois',
      'f.timeline.3to6':    'D’ici 3 à 6' + NB + 'mois',
      'f.timeline.explore': 'Je me renseigne',
      'f.message':      'Quel résultat cherchez-vous à obtenir' + NB + '?',
      'f.message.hint': 'Quelques phrases suffisent' + NB + ': le problème, pour qui, et l’échéance éventuelle.',
      'f.submit':   'Demander un appel découverte',
      'f.note':     'Vos informations servent uniquement à répondre à cette demande.',
      'f.success':  'Demande envoyée. Nous vous répondons sous 24' + NB + 'heures pour planifier votre appel découverte.',
      'f.error':    'Votre demande n’a pas pu être envoyée, mais votre message n’est pas perdu. Envoyez-le à <a href="mailto:seckbara23@gmail.com" data-fallback="email">seckbara23@gmail.com</a> ou sur <a href="https://wa.me/221707157070" target="_blank" rel="noopener noreferrer" data-fallback="whatsapp">WhatsApp</a>' + NB + ': les deux s’ouvrent avec votre message déjà rempli.',
      'v.name':    'Indiquez votre nom.',
      'v.email':   'Indiquez une adresse e-mail valide, par exemple nom@entreprise.com.',
      'v.service': 'Choisissez le service le plus proche de votre besoin.',
      'v.message': 'Décrivez en quelques mots ce que vous voulez obtenir (10' + NB + 'caractères minimum).',

      'ft.tagline':  'Des logiciels intelligents pour les entreprises en croissance, conçus à Dakar pour des clients du monde entier.',
      'ft.services': 'Services',
      'ft.company':  'Entreprise',
      'ft.why':      'Pourquoi Teranga',
      'ft.contact':  'Contact',
      'ft.reach':    'Nous joindre',
      'ft.copy':     '© 2026 Teranga Technologies. Tous droits réservés.',
      'ft.made':     'Conçu et développé à Dakar, au Sénégal.'
    }
  };

  // ── Storage helpers (storage can be blocked) ───────────────
  function store(key, val) {
    try {
      if (val === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, val);
    } catch (e) { /* ignore */ }
    return null;
  }

  // ── Lead source (campaign tags and referring site only) ─────
  // Kept for the visit so a lead can be attributed even if the form is sent later.
  function leadSource() {
    var src = {};
    try {
      var params = new URLSearchParams(window.location.search);
      ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) {
        if (params.get(k)) src[k] = params.get(k).slice(0, 100);
      });
      var ref = document.referrer ? new URL(document.referrer).hostname : '';
      if (ref && ref !== window.location.hostname) src.referrer = ref;
    } catch (e) { /* ignore */ }
    try {
      if (Object.keys(src).length) window.sessionStorage.setItem('tt-src', JSON.stringify(src));
      else src = JSON.parse(window.sessionStorage.getItem('tt-src') || '{}');
    } catch (e) { /* ignore */ }
    return src;
  }

  var source = leadSource();

  // ── Language ───────────────────────────────────────────────
  function initialLang() {
    var param = null;
    try { param = new URLSearchParams(window.location.search).get('lang'); } catch (e) { /* ignore */ }
    if (param === 'fr' || param === 'en') return param;
    var saved = store('tt-lang');
    if (saved === 'fr' || saved === 'en') return saved;
    var prefs = navigator.languages || [navigator.language || 'en'];
    for (var i = 0; i < prefs.length; i++) {
      var p = String(prefs[i]).toLowerCase();
      if (p.indexOf('fr') === 0) return 'fr';
      if (p.indexOf('en') === 0) return 'en';
    }
    return 'en';
  }

  var lang = initialLang();

  function t(key) {
    var dict = i18n[lang] || i18n.en;
    return dict[key] !== undefined ? dict[key] : (i18n.en[key] !== undefined ? i18n.en[key] : key);
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var parts = pair.split(':');
        if (parts.length === 2) el.setAttribute(parts[0].trim(), t(parts[1].trim()));
      });
    });

    document.documentElement.lang = lang;
    document.title = t('meta.title');
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', t('meta.desc'));

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang') === lang));
    });

    syncMenuLabel();
    demo.onLanguageChange();
  }

  function setLang(next) {
    if (next === lang) return;
    lang = next;
    store('tt-lang', next);
    applyTranslations();
    track('language_switch', { lang: next });
  }

  // ── Analytics bridge (no-op unless an analytics script exists) ─
  function track(name, props) {
    props = props || {};
    try {
      if (typeof window.va === 'function') window.va('event', { name: name, data: props });
      if (typeof window.plausible === 'function') window.plausible(name, { props: props });
      if (Array.isArray(window.dataLayer)) window.dataLayer.push(Object.assign({ event: name }, props));
    } catch (e) { /* ignore */ }
  }

  // ── Mobile menu ────────────────────────────────────────────
  var menuToggle = document.getElementById('menu-toggle');
  var mobileNav  = document.getElementById('mobile-nav');

  function menuOpen() { return menuToggle && menuToggle.getAttribute('aria-expanded') === 'true'; }

  function syncMenuLabel() {
    if (!menuToggle) return;
    menuToggle.setAttribute('aria-label', t(menuOpen() ? 'a11y.menu.close' : 'a11y.menu.open'));
  }

  function setMenu(open, returnFocus) {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    mobileNav.hidden = !open;
    syncMenuLabel();
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
    window.matchMedia('(min-width: 1081px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  // ── Hero demo ──────────────────────────────────────────────
  var demo = (function () {
    var root = document.querySelector('[data-demo]');
    var timers = [];
    var state = 'idle'; // idle | playing | done

    function q(sel) { return root ? root.querySelector(sel) : null; }

    function setStatus(s) {
      var pill = q('.demo-status');
      var label = q('.demo-status-text');
      if (!pill || !label) return;
      pill.setAttribute('data-state', s);
      label.setAttribute('data-i18n', 'demo.status.' + s);
      label.textContent = t('demo.status.' + s);
    }

    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

    function finish() {
      timers.forEach(clearTimeout);
      timers = [];
      if (!root) return;
      root.classList.remove('demo-armed');
      setStatus('ready');
      state = 'done';
    }

    function play() {
      if (!root || state !== 'idle') return;
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { finish(); return; }

      state = 'playing';
      var transcript = q('.demo-transcript');
      var words = transcript.textContent.split(/(\s+)/);
      transcript.innerHTML = words.map(function (w) {
        return /^\s+$/.test(w) ? w : '<span class="w">' + w.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span>';
      }).join('');
      root.classList.add('demo-armed');
      setStatus('listening');

      var spans = transcript.querySelectorAll('.w');
      var step = 55;
      spans.forEach(function (s, i) { later(function () { s.classList.add('is-in'); }, 250 + i * step); });

      var t0 = 250 + spans.length * step + 300;
      later(function () { setStatus('structuring'); }, t0);
      root.querySelectorAll('.demo-row').forEach(function (row, i) {
        later(function () { row.classList.add('is-in'); }, t0 + 500 + i * 420);
      });
      later(function () {
        var s = q('.demo-signoff');
        if (s) s.classList.add('is-in');
      }, t0 + 500 + 4 * 420 + 200);
      later(finish, t0 + 500 + 4 * 420 + 900);
    }

    function onLanguageChange() {
      // Translation replaced the demo text: never leave it half-revealed.
      if (state === 'playing') finish();
      else if (state === 'done') setStatus('ready');
    }

    function start() {
      if (!root) return;
      if (!('IntersectionObserver' in window)) { play(); return; }
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); play(); }
      }, { threshold: 0.35 });
      io.observe(root);
    }

    return { start: start, onLanguageChange: onLanguageChange };
  })();

  // ── CTA wiring ─────────────────────────────────────────────
  function initCtas() {
    var serviceSelect = document.getElementById('f-service');

    document.querySelectorAll('[data-cta]').forEach(function (el) {
      el.addEventListener('click', function () {
        track('cta_click', { location: el.getAttribute('data-cta'), service: el.getAttribute('data-service') || '' });
      });
    });

    // Optional external booking page: only then do the buttons promise booking.
    if (BOOKING_URL) {
      document.querySelectorAll('a[href="#contact"][data-cta]').forEach(function (a) {
        a.setAttribute('href', BOOKING_URL);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      });
      document.querySelectorAll('[data-i18n="cta.call"]').forEach(function (el) { el.setAttribute('data-i18n', 'cta.book'); });
      document.querySelectorAll('[data-i18n="cta.call.short"]').forEach(function (el) { el.setAttribute('data-i18n', 'cta.book.short'); });
    }

    // Service-specific CTAs pre-select the service in the form
    document.querySelectorAll('[data-service]').forEach(function (el) {
      el.addEventListener('click', function () {
        if (BOOKING_URL || !serviceSelect) return;
        serviceSelect.value = el.getAttribute('data-service');
        serviceSelect.removeAttribute('aria-invalid');
        var err = document.getElementById('f-service-err');
        if (err) err.textContent = '';
      });
    });

    // After jumping to the form, put focus on the first field without a second scroll
    document.querySelectorAll('a[href="#contact"]').forEach(function (a) {
      a.addEventListener('click', function () {
        if (BOOKING_URL) return;
        setTimeout(function () {
          var first = document.getElementById('f-name');
          if (first) first.focus({ preventScroll: true });
        }, 600);
      });
    });
  }

  // ── Discovery form ─────────────────────────────────────────
  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var fields = {
      name:    form.querySelector('#f-name'),
      email:   form.querySelector('#f-email'),
      company: form.querySelector('#f-company'),
      service: form.querySelector('#f-service'),
      timeline:form.querySelector('#f-timeline'),
      message: form.querySelector('#f-message'),
      website: form.querySelector('#f-website')
    };
    var submit   = document.getElementById('f-submit');
    var feedback = document.getElementById('f-feedback');
    var started  = false;
    var sending  = false;

    function setError(name, key) {
      var el = fields[name];
      var err = document.getElementById('f-' + name + '-err');
      if (key) {
        el.setAttribute('aria-invalid', 'true');
        if (err) err.textContent = t(key);
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

      setError('name',    name.length >= 2 ? null : 'v.name');      if (name.length < 2) problems.push('name');
      setError('email',   isEmail(email) ? null : 'v.email');      if (!isEmail(email)) problems.push('email');
      setError('service', fields.service.value ? null : 'v.service'); if (!fields.service.value) problems.push('service');
      setError('message', msg.length >= 10 ? null : 'v.message');   if (msg.length < 10) problems.push('message');
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
          encodeURIComponent(t('f.title') + ' — ' + optionText(fields.service)) +
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
          show('success', t('f.success'));
          track('lead_submitted', { service: fields.service.value });
          form.reset();
          started = false;
        })
        .catch(function (err) {
          show('error', t('f.error'));
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
  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { setLang(btn.getAttribute('data-lang')); });
  });

  initMenu();
  initCtas();
  initForm();
  applyTranslations();
  demo.start();

  // expose for tests/debugging
  window.TT = { i18n: i18n, setLang: setLang, lang: function () { return lang; } };
})();
