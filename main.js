/* ============================================================
   Teranga Technologies — Main Script
   ============================================================ */

// ── Translations ─────────────────────────────────────────────
const i18n = {
  en: {
    'nav.home':      'Home',
    'nav.services':  'Services',
    'nav.portfolio': 'Portfolio',
    'nav.about':     'About',
    'nav.contact':   'Contact',
    'nav.cta':       'Get a Quote',

    'hero.badge':  'Based in Dakar · Serving Clients Globally',
    'hero.h1a':    'We Build Digital Products That',
    'hero.h1b':    'Grow Your Business',
    'hero.sub':    'From websites and mobile apps to full SaaS platforms — Teranga Technologies delivers fast, quality-built solutions for startups and SMEs.',
    'hero.cta1':   'Get a Free Quote',
    'hero.cta2':   'See Our Work',

    'svc.label': 'What We Do',
    'svc.h2':    'Services That Move Businesses Forward',
    'svc.sub':   'End-to-end digital solutions tailored to startups, SMEs, and growing companies.',
    'svc.web.h': 'Website Development',
    'svc.web.p': 'Fast, polished, SEO-ready business websites that make a strong first impression and generate leads.',
    'svc.app.h': 'Web Application Development',
    'svc.app.p': 'Custom dashboards, portals, and tools built with modern frameworks to solve real business problems.',
    'svc.mob.h': 'Mobile App Development',
    'svc.mob.p': 'Native and cross-platform iOS and Android apps that deliver smooth, engaging user experiences.',
    'svc.sas.h': 'SaaS Product Development',
    'svc.sas.p': 'Full-stack SaaS platforms with auth, billing, and everything needed to go to market quickly.',
    'svc.sup.h': 'Maintenance & Support',
    'svc.sup.p': 'Ongoing technical support, updates, and monitoring to keep your product running at peak performance.',

    'why.label':    'Why Teranga',
    'why.h2':       'Why Clients Choose Us',
    'why.sub':      'Technical excellence meets startup practicality — fast delivery, clear communication, and real results.',
    'why.spd.h':    'Fast Turnaround',
    'why.spd.p':    'Most projects launch in 4–8 weeks without cutting corners on quality.',
    'why.cus.h':    'Custom-Built Solutions',
    'why.cus.p':    'No templates. Every product is designed and built for your specific business goals.',
    'why.com.h':    'Clear Communication',
    'why.com.p':    'Regular updates, honest timelines, zero jargon. You always know where your project stands.',
    'why.str.h':    'Startup-Friendly',
    'why.str.p':    'Flexible pricing and phased delivery make quality development accessible at every stage.',
    'why.loc.h':    'Local & Remote',
    'why.loc.p':    'Based in Dakar, we work with clients across Senegal and internationally with zero friction.',
    'why.mod.h':    'Modern Technology',
    'why.mod.p':    'Scalable, maintainable stacks. No legacy tech, no lock-in — just solid foundations.',

    'pf.label': 'Our Portfolio',
    'pf.h2':    'Products We\'re Building',
    'pf.sub':   'Real digital products built for real problems — across education, health, and business operations.',
    'pf.view':    'View Platform',
    'pf.demo':    'Request Demo',
    'pf.discuss': 'Discuss a Project',
    'p1.tag':    'CX / EdTech',
    'p1.h':      'XP Client Academy',
    'p1.p':      'A customer experience learning platform for professionals and companies, with online courses, quizzes, certificates, and corporate training programs.',
    'p1.status': 'MVP · Pilot ready',
    'p2.tag':    'EdTech · SaaS',
    'p2.h':      'EduSen',
    'p2.p':      'A complete school management platform for private schools: students, teachers, parents, attendance, grades, exams, finance, admissions, and portals.',
    'p2.status': 'Commercial-ready v1',
    'p3.tag':    'GovTech',
    'p3.h':      'SunuPermis',
    'p3.p':      'A digital platform for driving license administration, driving schools, exam sessions, student appointments, and government oversight.',
    'p3.status': 'Advanced prototype',
    'p4.tag':    'HealthTech · AI',
    'p4.h':      'Radiora Medical',
    'p4.p':      'An AI-assisted radiology reporting platform for clinics and imaging centers, with structured reports, patient explanations, translation, and workflow management.',
    'p4.status': 'Advanced development',
    'p5.tag':    'HealthTech',
    'p5.h':      'Clinic Management System',
    'p5.p':      'A clinic operations platform for patient records, appointments, consultations, billing, documents, and end-to-end healthcare workflows.',
    'p5.status': 'Planned product',
    'p6.tag':    'Custom SaaS',
    'p6.h':      'Enterprise Operations Solutions',
    'p6.p':      'Tailored internal SaaS platforms for companies that need to digitize daily operations, workflows, documents, tasks, reporting, and customer visibility.',
    'p6.status': 'Custom solutions',

    'proc.label': 'How We Work',
    'proc.h2':    'From Idea to Launch in 4 Steps',
    'proc.sub':   'A clear, proven process designed to deliver quality quickly and keep you in control.',
    'proc.1.h':   'Discovery',
    'proc.1.p':   'We learn your goals, users, and constraints to define exactly what to build.',
    'proc.2.h':   'Design & Plan',
    'proc.2.p':   'Wireframes, stack selection, and scope alignment — before writing a line of code.',
    'proc.3.h':   'Build',
    'proc.3.p':   'Iterative development with regular demos so you see real progress, not just promises.',
    'proc.4.h':   'Launch & Support',
    'proc.4.p':   'We handle go-live, deployment, and provide ongoing support to keep things running.',

    'abt.label': 'Our Story',
    'abt.h2':    'Built on Hospitality, Driven by Quality',
    'abt.p1':    '"Teranga" is the Wolof word for hospitality — a core value in Senegalese culture. We chose this name because the best client relationships are built on warmth, trust, and genuine care.',
    'abt.p2':    'Founded in Dakar, Teranga Technologies partners with startups, SMEs, and growing businesses across Africa and beyond. We build products that truly help — clean code, thoughtful design, reliable delivery.',
    'abt.p3':    'Working with us means you have a committed partner who understands your goals, speaks your language, and ships on time.',
    'abt.v1': 'Dakar, Senegal',
    'abt.v2': 'Startup-Focused',
    'abt.v3': 'Bilingual FR/EN',
    'abt.v4': 'Fast Delivery',
    'abt.v5': 'Clean Code',

    'cta.h2':   'Ready to Build Something Great?',
    'cta.p':    "Tell us about your project. We'll respond within 24 hours with ideas, pricing, and a clear path forward.",
    'cta.btn1': 'Start a Project',
    'cta.btn2': 'WhatsApp Us',

    'ct.label':    'Get in Touch',
    'ct.h2':       "Let's Talk About Your Project",
    'ct.sub':      'No obligation. Just a quick conversation to see how we can help.',
    'ct.info.h':   "We'd love to hear from you",
    'ct.info.p':   'Whether you have a full brief or just an idea, reach out — we figure it out together.',
    'ct.note':     'We typically respond within 24 hours. No sales pitch — just honest advice.',
    'ct.f.name':   'Full Name',
    'ct.f.email':  'Email Address',
    'ct.f.svc':    'Service You Need',
    'ct.f.subj':   'Subject',
    'ct.f.msg':    'Tell Us About Your Project',
    'ct.f.send':   'Send Message',
    'ct.select':   'Select a service…',
    'ct.opt.web':  'Website Development',
    'ct.opt.app':  'Web Application',
    'ct.opt.mob':  'Mobile App',
    'ct.opt.sas':  'SaaS Product',
    'ct.opt.sup':  'Maintenance & Support',
    'ct.opt.oth':  'Other',
    'ct.ph.name':  'Your full name',
    'ct.ph.email': 'your@email.com',
    'ct.ph.phone': '+221 70 000 0000 or +1 234 567 8900',
    'ct.ph.subj':  'Brief project title',
    'ct.ph.msg':   'Describe your project, timeline, and any specific requirements…',
    'ct.f.phone':  'Phone Number',
    'ct.f.opt':    ' (optional)',
    'ct.success':  "✓ Message sent! We'll be in touch within 24 hours.",
    'ct.error':    'Something went wrong. Please email us at seckbara23@gmail.com',

    'val.name':  'Please enter your name.',
    'val.email': 'Please enter a valid email address.',
    'val.phone': 'Please enter a valid phone number.',
    'val.svc':   'Please select a service.',
    'val.subj':  'Please enter a subject.',
    'val.msg':   'Please enter your message.',

    'ft.tagline':   'Helping startups and SMEs build great digital products — from Dakar to the world.',
    'ft.links':     'Quick Links',
    'ft.services':  'Services',
    'ft.contact':   'Contact',
    'ft.copy':      '© 2026 Teranga Technologies. All rights reserved.',
    'ft.made':      'Made with ♥ in Dakar, Senegal',

    'svc.quote.btn': 'Request This Service',

    'quote.step':        'Step',
    'quote.of':          'of',
    'quote.back':        '← Back',
    'quote.next':        'Next →',
    'quote.submit':      'Submit Project Request',
    'quote.select.hint': 'Select all that apply',

    'q.step.1': 'Select Services Needed',
    'q.step.2': 'Business Information',
    'q.step.3': 'Project Details',
    'q.step.4': 'Features Needed',
    'q.step.5': 'Timeline & Budget',
    'q.step.6': 'Review & Submit',

    'q.svc.website':    'Website',
    'q.svc.webapp':     'Web Application',
    'q.svc.mobile':     'Mobile App',
    'q.svc.booking':    'Online Booking System',
    'q.svc.ecommerce':  'E-commerce Platform',
    'q.svc.payment':    'Payment Integration',
    'q.svc.crm':        'CRM / Customer Management',
    'q.svc.automation': 'Automation',
    'q.svc.dashboard':  'Dashboard / Reporting',
    'q.svc.api':        'API Integration',
    'q.svc.modernize':  'System Modernization',
    'q.svc.other':      'Other',

    'q.biz.name':     'Business Name',
    'q.biz.contact':  'Contact Person',
    'q.biz.email':    'Email Address',
    'q.biz.phone':    'Phone Number',
    'q.biz.industry': 'Industry / Activity',
    'q.biz.website':  'Website or Social Media',

    'q.proj.desc':    'Project Description',
    'q.proj.desc.ph': 'I want customers to book appointments online and receive WhatsApp confirmations automatically.',
    'q.proj.goal':    'Main Goal',

    'q.goal.sales':      'Increase sales',
    'q.goal.cx':         'Improve customer service',
    'q.goal.manual':     'Reduce manual work',
    'q.goal.payments':   'Accept online payments',
    'q.goal.customers':  'Manage customers better',
    'q.goal.visibility': 'Improve visibility',
    'q.goal.analytics':  'Track business performance',
    'q.goal.other':      'Other',

    'q.feat.customer':  'Customer accounts',
    'q.feat.employee':  'Employee accounts',
    'q.feat.admin':     'Admin dashboard',
    'q.feat.multiuser': 'Multi-user access',
    'q.feat.whatsapp':  'WhatsApp notifications',
    'q.feat.sms':       'SMS notifications',
    'q.feat.email':     'Email notifications',
    'q.feat.wave':      'Wave integration',
    'q.feat.orange':    'Orange Money integration',
    'q.feat.card':      'Card payments',
    'q.feat.booking':   'Appointment scheduling',
    'q.feat.files':     'File / document upload',
    'q.feat.inventory': 'Inventory management',
    'q.feat.reporting': 'Reporting & analytics',
    'q.feat.export':    'Data export Excel/PDF',

    'q.time.label':   'When do you need this?',
    'q.time.asap':    'ASAP',
    'q.time.1to3':    'Within 1–3 months',
    'q.time.3to6':    'Within 3–6 months',
    'q.time.explore': 'Just exploring ideas',

    'q.budget.label':   'What is your budget range?',
    'q.budget.lt500':   'Less than 500,000 FCFA',
    'q.budget.500to2m': '500,000 – 2M FCFA',
    'q.budget.2to5m':   '2M – 5M FCFA',
    'q.budget.gt5m':    'More than 5M FCFA',
    'q.budget.discuss': 'Prefer to discuss first',

    'q.review.services': 'Services',
    'q.review.timeline': 'Timeline',
    'q.review.budget':   'Budget',
    'q.review.contact':  'Contact',
    'q.review.notes':    'Any additional details?',
    'q.review.notes.ph': 'Anything else we should know...',

    'q.success.title': 'Request Submitted!',
    'q.success.msg':   'Thank you for your request. Our team will contact you shortly.',

    'q.val.service':  'Please select at least one service.',
    'q.val.bizname':  'Business name is required.',
    'q.val.contact':  'Contact person name is required.',
    'q.val.email':    'A valid email address is required.',
    'q.val.phone':    'Please enter a valid phone number.',
    'q.val.industry': 'Please enter your industry or activity.',
    'q.val.desc':     'Please describe your project.',
    'q.val.goal':     'Please select at least one goal.',
    'q.val.timeline': 'Please select a timeline.',
    'q.val.budget':   'Please select a budget range.',
  },

  fr: {
    'nav.home':      'Accueil',
    'nav.services':  'Services',
    'nav.portfolio': 'Portfolio',
    'nav.about':     'À propos',
    'nav.contact':   'Contact',
    'nav.cta':       'Obtenir un devis',

    'hero.badge':  'Basé à Dakar · Clients dans le monde entier',
    'hero.h1a':    'Nous Créons des Produits Numériques Qui',
    'hero.h1b':    'Font Croître Votre Entreprise',
    'hero.sub':    "Des sites web aux applications mobiles et plateformes SaaS — Teranga Technologies livre des solutions rapides et de qualité pour les startups et PME.",
    'hero.cta1':   'Obtenir un devis gratuit',
    'hero.cta2':   'Voir nos réalisations',

    'svc.label': 'Ce que nous faisons',
    'svc.h2':    'Des Services Qui Propulsent les Entreprises',
    'svc.sub':   'Solutions numériques sur mesure pour startups, PME et entreprises en croissance.',
    'svc.web.h': 'Création de Sites Web',
    'svc.web.p': 'Sites web professionnels, rapides et optimisés SEO qui génèrent des leads et laissent une forte impression.',
    'svc.app.h': 'Applications Web',
    'svc.app.p': "Tableaux de bord, portails et outils sur mesure construits avec des frameworks modernes pour résoudre de vrais problèmes.",
    'svc.mob.h': 'Applications Mobiles',
    'svc.mob.p': "Apps iOS et Android natives ou multiplateformes offrant des expériences utilisateurs fluides et engageantes.",
    'svc.sas.h': 'Développement SaaS',
    'svc.sas.p': "Plateformes SaaS complètes avec authentification, facturation et tout ce qu'il faut pour aller vite sur le marché.",
    'svc.sup.h': 'Maintenance & Support',
    'svc.sup.p': 'Support technique continu, mises à jour et supervision des performances pour garder votre produit au top.',

    'why.label':    'Pourquoi Teranga',
    'why.h2':       'Pourquoi Nos Clients Nous Choisissent',
    'why.sub':      'Excellence technique et approche startup — livraison rapide, communication honnête, résultats concrets.',
    'why.spd.h':    'Livraison Rapide',
    'why.spd.p':    "La plupart des projets sont livrés en 4 à 8 semaines sans compromis sur la qualité.",
    'why.cus.h':    'Solutions Sur Mesure',
    'why.cus.p':    "Pas de templates. Chaque produit est conçu et développé selon vos objectifs spécifiques.",
    'why.com.h':    'Communication Claire',
    'why.com.p':    "Mises à jour régulières, délais honnêtes, zéro jargon. Vous savez toujours où en est votre projet.",
    'why.str.h':    'Adapté aux Startups',
    'why.str.p':    'Tarification flexible et livraisons par phases pour un développement de qualité à chaque étape.',
    'why.loc.h':    'Local & International',
    'why.loc.p':    "Basés à Dakar, nous travaillons avec des clients au Sénégal et à l'international sans friction.",
    'why.mod.h':    'Technologies Modernes',
    'why.mod.p':    "Stacks évolutives et maintenables. Pas de technologie obsolète, pas de dépendance forcée.",

    'pf.label': 'Notre Portfolio',
    'pf.h2':    'Les Produits Que Nous Construisons',
    'pf.sub':   'De vrais produits numériques pour de vrais problèmes — dans l\'éducation, la santé et les opérations d\'entreprise.',
    'pf.view':    'Voir la plateforme',
    'pf.demo':    'Demander une démo',
    'pf.discuss': 'Discuter d\'un projet',
    'p1.tag':    'CX / EdTech',
    'p1.h':      'XP Client Academy',
    'p1.p':      'Une plateforme d\'apprentissage de l\'expérience client pour les professionnels et les entreprises, avec cours en ligne, quiz, certificats et formations corporate.',
    'p1.status': 'MVP · Pilote prêt',
    'p2.tag':    'EdTech · SaaS',
    'p2.h':      'EduSen',
    'p2.p':      'Une plateforme complète de gestion scolaire pour les écoles privées : élèves, enseignants, parents, présences, notes, examens, finances, admissions et portails.',
    'p2.status': 'Version commerciale v1',
    'p3.tag':    'GovTech',
    'p3.h':      'SunuPermis',
    'p3.p':      'Une plateforme numérique pour l\'administration du permis de conduire, les auto-écoles, les sessions d\'examen, les rendez-vous étudiants et la supervision gouvernementale.',
    'p3.status': 'Prototype avancé',
    'p4.tag':    'HealthTech · IA',
    'p4.h':      'Radiora Medical',
    'p4.p':      'Une plateforme de compte-rendu radiologique assistée par IA pour les cliniques et centres d\'imagerie, avec rapports structurés, explications patients, traduction et gestion des workflows.',
    'p4.status': 'Développement avancé',
    'p5.tag':    'HealthTech',
    'p5.h':      'Système de Gestion de Clinique',
    'p5.p':      'Une plateforme de gestion clinique pour les dossiers patients, les rendez-vous, les consultations, la facturation, les documents et les flux de soins.',
    'p5.status': 'Produit planifié',
    'p6.tag':    'SaaS sur mesure',
    'p6.h':      'Solutions Opérationnelles Entreprise',
    'p6.p':      'Des plateformes SaaS internes sur mesure pour les entreprises qui souhaitent digitaliser leurs opérations, workflows, documents, tâches, rapports et visibilité client.',
    'p6.status': 'Solutions personnalisées',

    'proc.label': 'Notre méthode',
    'proc.h2':    "De l'Idée au Lancement en 4 Étapes",
    'proc.sub':   'Un processus clair et éprouvé pour livrer rapidement et vous garder aux commandes.',
    'proc.1.h':   'Découverte',
    'proc.1.p':   "Nous apprenons vos objectifs, utilisateurs et contraintes pour définir exactement ce qu'il faut construire.",
    'proc.2.h':   'Design & Planification',
    'proc.2.p':   "Maquettes, choix de la stack et validation du périmètre avant d'écrire la première ligne de code.",
    'proc.3.h':   'Développement',
    'proc.3.p':   'Développement itératif avec démos régulières pour que vous voyiez de vrais progrès.',
    'proc.4.h':   'Lancement & Support',
    'proc.4.p':   'Nous gérons la mise en ligne, le déploiement et assurons le support continu.',

    'abt.label': 'Notre histoire',
    'abt.h2':    "Fondés sur l'Hospitalité, Guidés par la Qualité",
    'abt.p1':    '« Teranga » est le mot wolof pour l\'hospitalité — une valeur profondément ancrée dans la culture sénégalaise. Nous avons choisi ce nom car les meilleures relations client se construisent sur la chaleur, la confiance et l\'attention.',
    'abt.p2':    'Fondée à Dakar, Teranga Technologies travaille avec des startups, PME et entreprises en croissance en Afrique et au-delà. Nous construisons des produits vraiment utiles — code propre, design réfléchi, livraison fiable.',
    'abt.p3':    'Travailler avec nous, c\'est avoir un partenaire engagé qui comprend vos objectifs, parle votre langue et livre dans les délais.',
    'abt.v1': 'Dakar, Sénégal',
    'abt.v2': 'Focus Startups',
    'abt.v3': 'Bilingue FR/EN',
    'abt.v4': 'Livraison Rapide',
    'abt.v5': 'Code Propre',

    'cta.h2':   'Prêt à Construire Quelque Chose de Grand ?',
    'cta.p':    "Parlez-nous de votre projet. Nous répondons dans les 24h avec des idées, des tarifs et une feuille de route.",
    'cta.btn1': 'Démarrer un projet',
    'cta.btn2': 'WhatsApp',

    'ct.label':    'Contactez-nous',
    'ct.h2':       'Parlons de Votre Projet',
    'ct.sub':      'Sans engagement. Juste une conversation rapide pour voir comment nous pouvons vous aider.',
    'ct.info.h':   'Nous sommes à votre écoute',
    'ct.info.p':   "Que vous ayez un brief complet ou juste une idée, contactez-nous — on construit ensemble.",
    'ct.note':     'Nous répondons généralement sous 24 heures. Pas de discours commercial — juste des conseils honnêtes.',
    'ct.f.name':   'Nom complet',
    'ct.f.email':  'Adresse email',
    'ct.f.svc':    'Service souhaité',
    'ct.f.subj':   'Sujet',
    'ct.f.msg':    'Décrivez votre projet',
    'ct.f.send':   'Envoyer le message',
    'ct.select':   'Choisir un service…',
    'ct.opt.web':  'Création de site web',
    'ct.opt.app':  'Application web',
    'ct.opt.mob':  'Application mobile',
    'ct.opt.sas':  'Produit SaaS',
    'ct.opt.sup':  'Maintenance & Support',
    'ct.opt.oth':  'Autre',
    'ct.ph.name':  'Votre nom complet',
    'ct.ph.email': 'votre@email.com',
    'ct.ph.phone': '+221 70 000 0000 ou +33 6 12 34 56 78',
    'ct.ph.subj':  'Titre bref du projet',
    'ct.ph.msg':   'Décrivez votre projet, délais et besoins spécifiques…',
    'ct.f.phone':  'Numéro de téléphone',
    'ct.f.opt':    ' (optionnel)',
    'ct.success':  '✓ Message envoyé ! Nous vous contacterons dans les 24 heures.',
    'ct.error':    'Une erreur s\'est produite. Contactez-nous à seckbara23@gmail.com',

    'val.name':  'Veuillez entrer votre nom.',
    'val.email': 'Veuillez entrer une adresse email valide.',
    'val.phone': 'Veuillez entrer un numéro de téléphone valide.',
    'val.svc':   'Veuillez sélectionner un service.',
    'val.subj':  'Veuillez entrer un sujet.',
    'val.msg':   'Veuillez entrer votre message.',

    'ft.tagline':  'Aidons les startups et PME à créer de super produits numériques — de Dakar vers le monde.',
    'ft.links':    'Liens rapides',
    'ft.services': 'Services',
    'ft.contact':  'Contact',
    'ft.copy':     '© 2026 Teranga Technologies. Tous droits réservés.',
    'ft.made':     'Fait avec ♥ à Dakar, Sénégal',

    'svc.quote.btn': 'Demander ce service',

    'quote.step':        'Étape',
    'quote.of':          'sur',
    'quote.back':        '← Retour',
    'quote.next':        'Suivant →',
    'quote.submit':      'Envoyer la demande',
    'quote.select.hint': 'Sélectionnez tout ce qui s\'applique',

    'q.step.1': 'Services Souhaités',
    'q.step.2': 'Informations Entreprise',
    'q.step.3': 'Détails du Projet',
    'q.step.4': 'Fonctionnalités',
    'q.step.5': 'Délai & Budget',
    'q.step.6': 'Révision & Envoi',

    'q.svc.website':    'Site Web',
    'q.svc.webapp':     'Application Web',
    'q.svc.mobile':     'Application Mobile',
    'q.svc.booking':    'Réservation en Ligne',
    'q.svc.ecommerce':  'Plateforme E-commerce',
    'q.svc.payment':    'Intégration de Paiement',
    'q.svc.crm':        'CRM / Gestion Clients',
    'q.svc.automation': 'Automatisation',
    'q.svc.dashboard':  'Tableau de Bord / Rapports',
    'q.svc.api':        'Intégration API',
    'q.svc.modernize':  'Modernisation Système',
    'q.svc.other':      'Autre',

    'q.biz.name':     'Nom de l\'entreprise',
    'q.biz.contact':  'Personne de contact',
    'q.biz.email':    'Adresse email',
    'q.biz.phone':    'Numéro de téléphone',
    'q.biz.industry': 'Secteur d\'activité',
    'q.biz.website':  'Site web ou réseaux sociaux',

    'q.proj.desc':    'Description du projet',
    'q.proj.desc.ph': 'Je veux que les clients puissent réserver des rendez-vous en ligne et recevoir des confirmations WhatsApp automatiquement.',
    'q.proj.goal':    'Objectif principal',

    'q.goal.sales':      'Augmenter les ventes',
    'q.goal.cx':         'Améliorer le service client',
    'q.goal.manual':     'Réduire le travail manuel',
    'q.goal.payments':   'Accepter les paiements en ligne',
    'q.goal.customers':  'Mieux gérer les clients',
    'q.goal.visibility': 'Améliorer la visibilité',
    'q.goal.analytics':  'Suivre les performances',
    'q.goal.other':      'Autre',

    'q.feat.customer':  'Comptes clients',
    'q.feat.employee':  'Comptes employés',
    'q.feat.admin':     'Tableau de bord admin',
    'q.feat.multiuser': 'Accès multi-utilisateurs',
    'q.feat.whatsapp':  'Notifications WhatsApp',
    'q.feat.sms':       'Notifications SMS',
    'q.feat.email':     'Notifications email',
    'q.feat.wave':      'Intégration Wave',
    'q.feat.orange':    'Intégration Orange Money',
    'q.feat.card':      'Paiements par carte',
    'q.feat.booking':   'Prise de rendez-vous',
    'q.feat.files':     'Upload fichiers / documents',
    'q.feat.inventory': 'Gestion des stocks',
    'q.feat.reporting': 'Rapports & analytiques',
    'q.feat.export':    'Export données Excel/PDF',

    'q.time.label':   'Quand en avez-vous besoin ?',
    'q.time.asap':    'Dès que possible',
    'q.time.1to3':    'Sous 1–3 mois',
    'q.time.3to6':    'Sous 3–6 mois',
    'q.time.explore': 'Je cherche juste des idées',

    'q.budget.label':   'Quelle est votre fourchette de budget ?',
    'q.budget.lt500':   'Moins de 500 000 FCFA',
    'q.budget.500to2m': '500 000 – 2M FCFA',
    'q.budget.2to5m':   '2M – 5M FCFA',
    'q.budget.gt5m':    'Plus de 5M FCFA',
    'q.budget.discuss': 'Préfère en discuter d\'abord',

    'q.review.services': 'Services',
    'q.review.timeline': 'Délai',
    'q.review.budget':   'Budget',
    'q.review.contact':  'Contact',
    'q.review.notes':    'Des précisions à ajouter ?',
    'q.review.notes.ph': 'Tout ce que nous devrions savoir...',

    'q.success.title': 'Demande envoyée !',
    'q.success.msg':   'Merci pour votre demande. Notre équipe vous contactera très bientôt.',

    'q.val.service':  'Veuillez sélectionner au moins un service.',
    'q.val.bizname':  'Le nom de l\'entreprise est requis.',
    'q.val.contact':  'Le nom du contact est requis.',
    'q.val.email':    'Une adresse email valide est requise.',
    'q.val.phone':    'Veuillez entrer un numéro de téléphone valide.',
    'q.val.industry': 'Veuillez entrer votre secteur d\'activité.',
    'q.val.desc':     'Veuillez décrire votre projet.',
    'q.val.goal':     'Veuillez sélectionner au moins un objectif.',
    'q.val.timeline': 'Veuillez sélectionner un délai.',
    'q.val.budget':   'Veuillez sélectionner une fourchette de budget.',
  }
};

// ── State ────────────────────────────────────────────────────
let lang = localStorage.getItem('tt-lang') || 'en';

// ── i18n helpers ─────────────────────────────────────────────
function t(key) { return i18n[lang][key] || i18n.en[key] || key; }

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.innerHTML = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  document.documentElement.lang = lang;
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function setLang(l) {
  lang = l;
  localStorage.setItem('tt-lang', l);
  applyTranslations();
}

// ── Scroll-shadow header ─────────────────────────────────────
function initScrollHeader() {
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ── Mobile menu ───────────────────────────────────────────────
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const nav    = document.getElementById('mobile-nav');
  if (!toggle || !nav) return;

  function close() {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '☰';
  }

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '✕' : '☰';
  });

  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      close();
      toggle.focus();
    }
  });
}

// ── Contact form ─────────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const f = {
    name:    form.querySelector('#f-name'),
    email:   form.querySelector('#f-email'),
    service: form.querySelector('#f-service'),
    subject: form.querySelector('#f-subject'),
    phone:   form.querySelector('#f-phone'),
    message: form.querySelector('#f-message'),
  };

  const submitBtn = document.getElementById('f-submit');
  const feedback  = document.getElementById('f-feedback');

  function fieldErr(name, msg) {
    const el = f[name];
    el.classList.add('has-error');
    const errEl = el.closest('.form-group').querySelector('.form-err');
    if (errEl) { errEl.textContent = msg; errEl.classList.add('visible'); }
  }

  function clearErr(name) {
    const el = f[name];
    el.classList.remove('has-error');
    const errEl = el.closest('.form-group').querySelector('.form-err');
    if (errEl) errEl.classList.remove('visible');
  }

  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function isPhone(v) { return /^\+?[\d\s\-().]{7,20}$/.test(v); }

  function validate() {
    let ok = true;
    Object.keys(f).forEach(k => clearErr(k));

    if (!f.name.value.trim())                       { fieldErr('name',    t('val.name'));  ok = false; }
    if (!isEmail(f.email.value.trim()))             { fieldErr('email',   t('val.email')); ok = false; }
    if (!f.service.value)                           { fieldErr('service', t('val.svc'));   ok = false; }
    if (!f.subject.value.trim())                    { fieldErr('subject', t('val.subj'));  ok = false; }
    const phoneVal = f.phone.value.trim();
    if (phoneVal && !isPhone(phoneVal))             { fieldErr('phone',   t('val.phone')); ok = false; }
    if (!f.message.value.trim())                    { fieldErr('message', t('val.msg'));   ok = false; }

    return ok;
  }

  Object.keys(f).forEach(k => {
    f[k].addEventListener('input',  () => clearErr(k));
    f[k].addEventListener('change', () => clearErr(k));
  });

  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.classList.toggle('loading', on);
  }

  function showFeedback(type, msg) {
    feedback.className = `form-feedback ${type} visible`;
    feedback.textContent = msg;
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    feedback.className = 'form-feedback';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    f.name.value.trim(),
          email:   f.email.value.trim(),
          service: f.service.value,
          subject: f.subject.value.trim(),
          phone:   f.phone.value.trim(),
          message: f.message.value.trim(),
          website: document.getElementById('f-website')?.value || '',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Server error');
      }

      showFeedback('success', t('ct.success'));
      form.reset();
    } catch (err) {
      showFeedback('error', t('ct.error'));
      console.error('Contact form error:', err);
    } finally {
      setLoading(false);
    }
  });
}

// ── Quote Modal ───────────────────────────────────────────────
function initQuoteModal() {
  const TOTAL = 6;
  let step = 1;

  const SERVICES = [
    { id: 'website',    icon: '🌐', key: 'q.svc.website'    },
    { id: 'webapp',     icon: '💻', key: 'q.svc.webapp'     },
    { id: 'mobile',     icon: '📱', key: 'q.svc.mobile'     },
    { id: 'booking',    icon: '📅', key: 'q.svc.booking'    },
    { id: 'ecommerce',  icon: '🛒', key: 'q.svc.ecommerce'  },
    { id: 'payment',    icon: '💳', key: 'q.svc.payment'    },
    { id: 'crm',        icon: '👥', key: 'q.svc.crm'        },
    { id: 'automation', icon: '⚙️', key: 'q.svc.automation' },
    { id: 'dashboard',  icon: '📊', key: 'q.svc.dashboard'  },
    { id: 'api',        icon: '🔌', key: 'q.svc.api'        },
    { id: 'modernize',  icon: '🔄', key: 'q.svc.modernize'  },
    { id: 'other',      icon: '✨', key: 'q.svc.other'      },
  ];
  const GOALS    = ['q.goal.sales','q.goal.cx','q.goal.manual','q.goal.payments','q.goal.customers','q.goal.visibility','q.goal.analytics','q.goal.other'];
  const FEATURES = ['q.feat.customer','q.feat.employee','q.feat.admin','q.feat.multiuser','q.feat.whatsapp','q.feat.sms','q.feat.email','q.feat.wave','q.feat.orange','q.feat.card','q.feat.booking','q.feat.files','q.feat.inventory','q.feat.reporting','q.feat.export'];
  const TIMELINES = ['q.time.asap','q.time.1to3','q.time.3to6','q.time.explore'];
  const BUDGETS   = ['q.budget.lt500','q.budget.500to2m','q.budget.2to5m','q.budget.gt5m','q.budget.discuss'];

  let data = makeData();
  function makeData() {
    return { services: [], biz: { name:'', contact:'', email:'', phone:'', industry:'', website:'' }, proj: { description:'', goals:[] }, features: [], timeline:'', budget:'', notes:'', honeypot:'' };
  }

  const overlay    = document.getElementById('qm-overlay');
  const dialog     = document.getElementById('qm-dialog');
  const bodyEl     = document.getElementById('qm-body');
  const backBtn    = document.getElementById('qm-back');
  const nextBtn    = document.getElementById('qm-next');
  const submitBtn  = document.getElementById('qm-submit');
  const closeBtn   = document.getElementById('qm-close');
  const fillEl     = document.getElementById('qm-progress-fill');
  const stepLbl    = document.getElementById('qm-step-label');
  const titleEl    = document.getElementById('qm-title');
  const errorEl    = document.getElementById('qm-error');
  const footerEl   = document.getElementById('qm-footer');
  if (!overlay || !dialog) return;

  function open(preselect) {
    data = makeData();
    if (preselect) data.services = [preselect];
    step = 1;
    footerEl.style.display = '';
    render();
    overlay.classList.add('qm-active');
    dialog.classList.add('qm-active');
    document.body.classList.add('qm-open');
    setTimeout(() => closeBtn.focus(), 60);
  }

  function close() {
    overlay.classList.remove('qm-active');
    dialog.classList.remove('qm-active');
    document.body.classList.remove('qm-open');
  }

  function err(msg) { errorEl.textContent = msg; errorEl.classList.add('qm-err-on'); }
  function clrErr() { errorEl.textContent = ''; errorEl.classList.remove('qm-err-on'); }

  function render() {
    fillEl.style.width = (step / TOTAL * 100) + '%';
    stepLbl.textContent = `${t('quote.step')} ${step} ${t('quote.of')} ${TOTAL}`;
    titleEl.textContent = t(`q.step.${step}`);
    backBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
    backBtn.textContent  = t('quote.back');
    nextBtn.textContent  = t('quote.next');
    submitBtn.textContent = t('quote.submit');
    nextBtn.style.display   = step < TOTAL ? '' : 'none';
    submitBtn.style.display = step === TOTAL ? '' : 'none';
    clrErr();
    [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6][step - 1]();
    bodyEl.scrollTop = 0;
  }

  function esc(v) { return String(v||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

  function renderStep1() {
    bodyEl.innerHTML = `<p class="qm-hint">${t('quote.select.hint')}</p>
      <div class="qm-svc-grid">${SERVICES.map(s => `
        <button type="button" class="qm-svc-card${data.services.includes(s.id)?' qm-selected':''}" data-svc="${s.id}">
          <span class="qm-svc-icon">${s.icon}</span>
          <span class="qm-svc-lbl">${t(s.key)}</span>
        </button>`).join('')}
      </div>`;
    bodyEl.querySelectorAll('.qm-svc-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.svc;
        if (data.services.includes(id)) { data.services = data.services.filter(s => s !== id); card.classList.remove('qm-selected'); }
        else { data.services.push(id); card.classList.add('qm-selected'); }
      });
    });
  }

  function field(id, label, type, val, ph, required, ac) {
    return `<div class="qm-fld">
      <label for="${id}">${label}${required ? '<span class="req">*</span>' : '<span class="opt"> (optional)</span>'}</label>
      <input type="${type}" id="${id}" class="qm-input" value="${esc(val)}" placeholder="${esc(ph)}"
             ${required?'required':''} ${ac?`autocomplete="${ac}"`:''}></div>`;
  }

  function renderStep2() {
    bodyEl.innerHTML = `<div class="qm-fld-grid">
      ${field('qb-name',     t('q.biz.name'),     'text',  data.biz.name,     '', true,  'organization')}
      ${field('qb-contact',  t('q.biz.contact'),  'text',  data.biz.contact,  '', true,  'name')}
      ${field('qb-email',    t('q.biz.email'),    'email', data.biz.email,    '', true,  'email')}
      ${field('qb-phone',    t('q.biz.phone'),    'tel',   data.biz.phone,    '+221 70 000 0000', true, 'tel')}
      ${field('qb-industry', t('q.biz.industry'), 'text',  data.biz.industry, '', true)}
      ${field('qb-website',  t('q.biz.website'),  'url',   data.biz.website,  'https://', false, 'url')}
    </div>`;
    [['qb-name','name'],['qb-contact','contact'],['qb-email','email'],['qb-phone','phone'],['qb-industry','industry'],['qb-website','website']].forEach(([id,key]) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => { data.biz[key] = el.value; });
    });
  }

  function checkGrid(items, selected, cssClass) {
    return `<div class="qm-chk-grid${cssClass?' '+cssClass:''}">${items.map(key => `
      <label class="qm-chk${selected.includes(key)?' qm-selected':''}">
        <input type="checkbox" value="${key}"${selected.includes(key)?' checked':''}><span>${t(key)}</span>
      </label>`).join('')}</div>`;
  }

  function bindChecks(selector, arr) {
    bodyEl.querySelectorAll(selector).forEach(cb => {
      cb.addEventListener('change', () => {
        cb.closest('.qm-chk').classList.toggle('qm-selected', cb.checked);
        if (cb.checked) arr.push(cb.value); else arr.splice(arr.indexOf(cb.value), 1);
      });
    });
  }

  function renderStep3() {
    bodyEl.innerHTML = `
      <div class="qm-fld">
        <label for="qp-desc">${t('q.proj.desc')}<span class="req">*</span></label>
        <textarea id="qp-desc" class="qm-input qm-ta" placeholder="${esc(t('q.proj.desc.ph'))}">${esc(data.proj.description)}</textarea>
      </div>
      <div class="qm-fld" style="margin-top:20px">
        <label>${t('q.proj.goal')}<span class="req">*</span></label>
        ${checkGrid(GOALS, data.proj.goals)}
      </div>`;
    document.getElementById('qp-desc').addEventListener('input', e => { data.proj.description = e.target.value; });
    bindChecks('.qm-chk input', data.proj.goals);
  }

  function renderStep4() {
    bodyEl.innerHTML = `<p class="qm-hint">${t('quote.select.hint')}</p>${checkGrid(FEATURES, data.features, 'qm-chk-grid--wide')}`;
    bindChecks('.qm-chk input', data.features);
  }

  function pillGroup(label, items, cur, group) {
    return `<div class="qm-fld"><label>${label}<span class="req">*</span></label>
      <div class="qm-pills">${items.map(k => `
        <button type="button" class="qm-pill${cur===k?' qm-selected':''}" data-group="${group}" data-val="${k}">${t(k)}</button>`).join('')}
      </div></div>`;
  }

  function renderStep5() {
    bodyEl.innerHTML = pillGroup(t('q.time.label'), TIMELINES, data.timeline, 'timeline') + '<div style="margin-top:24px">' + pillGroup(t('q.budget.label'), BUDGETS, data.budget, 'budget') + '</div>';
    bodyEl.querySelectorAll('.qm-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const g = btn.dataset.group;
        bodyEl.querySelectorAll(`.qm-pill[data-group="${g}"]`).forEach(b => b.classList.remove('qm-selected'));
        btn.classList.add('qm-selected');
        data[g] = btn.dataset.val;
      });
    });
  }

  function renderStep6() {
    const svcLabels = data.services.map(id => { const s = SERVICES.find(x => x.id === id); return s ? t(s.key) : id; }).join(', ') || '—';
    bodyEl.innerHTML = `
      <div class="qm-review">
        ${[
          [t('q.review.services'), svcLabels],
          [t('q.biz.name'),        esc(data.biz.name)    || '—'],
          [t('q.biz.email'),       esc(data.biz.email)   || '—'],
          [t('q.biz.phone'),       esc(data.biz.phone)   || '—'],
          [t('q.review.timeline'), data.timeline ? t(data.timeline) : '—'],
          [t('q.review.budget'),   data.budget   ? t(data.budget)   : '—'],
        ].map(([lbl,val]) => `<div class="qm-rv-row"><span class="qm-rv-lbl">${lbl}</span><span class="qm-rv-val">${val}</span></div>`).join('')}
      </div>
      <div class="hp-field" aria-hidden="true"><input type="text" id="qm-hp" tabindex="-1" autocomplete="off"></div>
      <div class="qm-fld" style="margin-top:20px">
        <label for="qm-notes">${t('q.review.notes')}</label>
        <textarea id="qm-notes" class="qm-input qm-ta" placeholder="${esc(t('q.review.notes.ph'))}">${esc(data.notes)}</textarea>
      </div>`;
    document.getElementById('qm-notes').addEventListener('input', e => { data.notes = e.target.value; });
    const hp = document.getElementById('qm-hp');
    if (hp) hp.addEventListener('input', e => { data.honeypot = e.target.value; });
  }

  function validate() {
    clrErr();
    if (step === 1 && !data.services.length)                          { err(t('q.val.service'));  return false; }
    if (step === 2) {
      if (!data.biz.name.trim())                                      { err(t('q.val.bizname'));  return false; }
      if (!data.biz.contact.trim())                                   { err(t('q.val.contact'));  return false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.biz.email.trim())) { err(t('q.val.email'));    return false; }
      if (data.biz.phone.trim() && !/^\+?[\d\s\-().]{7,20}$/.test(data.biz.phone.trim())) { err(t('q.val.phone')); return false; }
      if (!data.biz.industry.trim())                                  { err(t('q.val.industry')); return false; }
    }
    if (step === 3) {
      if (!data.proj.description.trim()) { err(t('q.val.desc')); return false; }
      if (!data.proj.goals.length)       { err(t('q.val.goal')); return false; }
    }
    if (step === 5) {
      if (!data.timeline) { err(t('q.val.timeline')); return false; }
      if (!data.budget)   { err(t('q.val.budget'));   return false; }
    }
    return true;
  }

  function submit() {
    if (data.honeypot) return;
    submitBtn.disabled = true;
    const payload = {
      timestamp: new Date().toISOString(),
      services:  [...data.services],
      business:  { ...data.biz },
      project:   { description: data.proj.description, goals: [...data.proj.goals] },
      features:  [...data.features],
      timeline:  data.timeline,
      budget:    data.budget,
      notes:     data.notes,
    };
    console.log('[Teranga Quote Submission]', payload);
    // TODO: await fetch('/api/quote', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    footerEl.style.display = 'none';
    fillEl.style.width = '100%';
    stepLbl.textContent = '';
    titleEl.textContent = '';
    bodyEl.innerHTML = `
      <div class="qm-success">
        <div class="qm-success-icon">✓</div>
        <h3>${t('q.success.title')}</h3>
        <p>${t('q.success.msg')}</p>
      </div>`;
  }

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && dialog.classList.contains('qm-active')) close(); });
  backBtn.addEventListener('click', () => { if (step > 1) { step--; render(); } });
  nextBtn.addEventListener('click', () => { if (validate()) { step++; render(); } });
  submitBtn.addEventListener('click', submit);

  window.openQuoteModal = open;
}

// ── Bootstrap ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

  applyTranslations();
  initScrollHeader();
  initMobileMenu();
  initContactForm();
  initQuoteModal();

  document.querySelectorAll('[data-open-quote]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const preselect = el.dataset.openQuote || null;
      if (window.openQuoteModal) window.openQuoteModal(preselect || undefined);
    });
  });
});
