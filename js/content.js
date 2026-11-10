/* ==========================================================================
   YOUR DETAILS — this is the only file you need to edit for content.
   Everything on the site (nav, hero, doors, story, ability card, contact
   form, footer, skill pages) is generated from the object below.
   ========================================================================== */

window.SITE = {
  // ---- Identity ----------------------------------------------------------
  name: 'Tonny Bett',
  firstName: 'Tonny',
  tagline: 'Full-Stack Software Developer',
  email: 'tonnybett44@gmail.com',
  phone: '+254 797 330 653',       // shown in the footer; set to '' to hide
  location: 'Kenya',
  timezone: 'Africa/Nairobi',
  siteTitle: 'Tonny Bett — Full-Stack Software Developer',
  heroButton: 'Hire me',

  availability: {
    status: 'Open to roles & freelance',
    region: 'Based in Kenya · Remote-friendly',
  },

  // Words that flip on the notepad after "I am a".
  roles: ['Full-Stack Developer', 'React Developer', 'API Engineer', 'Automation Builder', 'Founder'],

  // Cut-out portrait (transparent PNG works best). Drop yours in /assets and
  // change the path, e.g. 'assets/portrait.png'.
  portrait: 'assets/portrait.png',
  // Dark-mode version: same photo with the gray background dimmed so it doesn't glow on the dark page.
  portraitDark: 'assets/portrait-dark.png',
  // Colour photo with a wider soft fade of its background, revealed in a spotlight under the cursor ('' to turn off).
  portraitReveal: 'assets/portrait-reveal.png',
  portraitAlt: 'Portrait of Tonny Bett',

  // ---- Section headings ----------------------------------------------------
  headings: {
    doorsKicker: 'My work, one door per discipline',
    doors: 'Magic happens behind the doors',
    storyKicker: 'My story',
    story: "Let's go back in time.",
  },

  // ---- Doors / skills ----------------------------------------------------
  // One entry = one door on the wall and one page at #/<slug>.
  //   color    — the door's paint colour
  //   plate    — text on the brass nameplate
  //   subtitle — small mono line under the title beside the door
  //   points   — the checklist beside the door (and on the skill page)
  //   projects — the stacked cards on the skill page. `image` = screenshot
  //              shown inside the monitor (e.g. 'assets/bot-battlr.jpg').
  skills: [
    {
      slug: 'frontend',
      title: 'Frontend Developer',
      nav: 'Frontend',
      plate: 'Frontend Developer',
      color: '#22304a',
      subtitle: 'React interfaces that feel fast',
      blurb: 'Responsive React applications.',
      lead: 'Responsive, component-driven React applications with clean state management and smooth API integration.',
      points: ['Reusable React components', 'State management & props flow', 'API integration', 'Responsive, interactive UI', 'Deployment on Vercel & Netlify'],
      tools: ['React.js', 'TypeScript', 'JavaScript (ES6+)', 'Tailwind CSS', 'Vite', 'Supabase', 'HTML5', 'CSS3', 'Vercel', 'Netlify'],
      projects: [
        {
          kind: 'Full-stack marketplace · Live', title: 'Clotz Hub', subtitle: 'Kenya’s verified fashion marketplace',
          desc: 'A multi-store marketplace where shoppers browse verified clothing shops for men, women and kids, fill one cart and check out with M-Pesa or cash, with delivery or pickup.',
          bullets: [
            'Store owners get their own storefront: logo, banner, location and opening hours',
            'Seller dashboard for products (photos, sizes, colours, stock) and orders from new to delivered',
            'Payments go straight to each seller’s own M-Pesa till or paybill',
            'Sign-in, cart and data on Supabase (PostgreSQL, auth, storage)',
            'Typed end to end in TypeScript, with forms validated by React Hook Form and Zod',
          ],
          tags: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS', 'TanStack Query', 'M-Pesa'],
          link: 'https://clotzhub.vercel.app/', code: 'https://github.com/Bett-001/clothez-connect', image: 'assets/work/clotzhub.jpg',
        },
        {
          kind: 'React web app', title: 'Bot Battlr', subtitle: 'Battle-bot collection manager',
          desc: 'Users build their own army by enlisting, releasing or permanently removing bots from a live collection.',
          bullets: ['Reusable components for dynamic rendering', 'Data fetched from a JSON server', 'State and props for adding and removing bots'],
          tags: ['React', 'State management', 'JSON Server'],
          link: 'https://bot-battlr-project-red.vercel.app/', image: 'assets/work/botbattlr.jpg',
        },
        {
          kind: 'React web app', title: 'Job Finder App', subtitle: 'Job-matching platform',
          desc: 'Connects job seekers with employers through profiles, job postings and application management.',
          bullets: ['User and company dashboards', 'Job search and filtering', 'Application and posting state management'],
          tags: ['React', 'Dashboards', 'Search & filters'],
          link: 'https://capable-kulfi-724249.netlify.app/', image: 'assets/work/jobfinder.jpg',
        },
      ],
    },
    {
      slug: 'backend',
      title: 'Backend Developer',
      nav: 'Backend & APIs',
      plate: 'Backend Developer',
      color: '#4a3540',
      subtitle: 'Flask APIs and solid data models',
      blurb: 'RESTful APIs with Flask.',
      lead: 'RESTful APIs and relational databases built with Python and Flask, designed to be modular, tested and easy to extend.',
      points: ['RESTful API design with Flask', 'Relational data models', 'Full CRUD operations', 'Endpoint testing with Postman', 'Modular, clean architecture'],
      tools: ['Python', 'Flask', 'SQLite', 'PostgreSQL', 'Postman', 'Git & GitHub'],
      projects: [
        {
          kind: 'REST API', title: 'Superheroes API', subtitle: 'Flask backend application',
          desc: 'An API for managing superheroes and their powers: view heroes, assign powers and update power descriptions.',
          bullets: ['RESTful endpoints in Flask', 'Relational models and entity relationships', 'Full CRUD, tested with Postman'],
          tags: ['Flask', 'SQL', 'CRUD'],
          link: '', image: '',
        },
        {
          kind: 'Platform backend', title: 'MQTradePro API', subtitle: 'Subscription platform services',
          desc: 'Backend services and REST APIs powering a subscription-based trading platform.',
          bullets: ['Python/Flask services and REST APIs', 'Schemas for users, subscriptions and signal history', 'Testing, debugging and deployment'],
          tags: ['Python', 'Flask', 'SQL schema design'],
          link: 'https://mqtradepro.com/', image: 'assets/work/mqtradepro.jpg',
        },
      ],
    },
    {
      slug: 'ai-automation',
      title: 'Automation Engineer',
      nav: 'AI & Automation',
      plate: 'Automation Engineer',
      color: '#7a8670',
      subtitle: 'Chatbots and business workflows',
      blurb: 'AI chatbots and business automation.',
      lead: 'AI-powered tools that help businesses answer customers instantly and automate their workflows across WhatsApp, Facebook and Instagram.',
      points: ['AI-assisted development & prompt engineering', 'WhatsApp, Facebook & Instagram messaging', 'Meta Business integrations', 'AI chatbots for instant support', 'Lead capture workflows', 'Production deployment & upkeep'],
      tools: ['AI coding assistants (Claude, ChatGPT)', 'Meta Business', 'WhatsApp automation', 'AI chatbots', 'JavaScript', 'Python'],
      projects: [
        {
          kind: 'AI & automation platform', title: 'Imara Logic', subtitle: 'Business automation for SMEs',
          desc: 'Lets businesses manage customer conversations across WhatsApp, Facebook and Instagram while automating workflows and cutting response times.',
          bullets: ['Responsive frontend interfaces', 'Meta Business and WhatsApp integrations', 'AI chatbots and lead-capture automation'],
          tags: ['AI chatbots', 'WhatsApp API', 'Automation'],
          link: 'https://www.imaralogic.co.ke/', image: 'assets/work/imara.jpg',
        },
      ],
    },
    {
      slug: 'trading-tech',
      title: 'Founder & Engineer',
      nav: 'Trading Tech',
      plate: 'Founder & Engineer',
      color: '#a4552c',
      subtitle: 'Building MQTradePro end to end',
      blurb: 'Trading technology platforms.',
      lead: 'Founder and lead engineer of MQTradePro, a subscription trading platform combining signals, strategies, analytics and trader education.',
      points: ['Product strategy & architecture', 'Real-time trading signals', 'Pine Script & NinjaTrader strategies', 'MetaTrader 5 integration', 'Trade journaling & analytics'],
      tools: ['React.js', 'Python', 'Flask', 'SQL', 'MetaTrader 5', 'TradingView Pine Script', 'NinjaTrader'],
      projects: [
        {
          kind: 'Founder · Lead engineer', title: 'MQTradePro', subtitle: 'Trading technology platform',
          desc: 'A subscription platform for traders: real-time signals, TradingView and NinjaTrader strategies, MetaTrader 5 integration, analytics and education.',
          bullets: ['Led technical development, product strategy and architecture', 'React dashboards backed by Flask APIs', 'MT5 integration, automated trade journaling and bot workflows'],
          tags: ['Founder', 'React', 'Flask', 'MT5'],
          link: 'https://mqtradepro.com/', image: 'assets/work/mqtradepro.jpg',
        },
      ],
    },
  ],

  // ---- My story (timeline) -----------------------------------------------
  // Newest first. `year` is the big number shown while that entry is active —
  // add your real years and dates here (leave '' to show the chapter number).
  story: [
    // year/period: TODO Tonny: add the real years (e.g. year: '2025', period: '2025 – Present').
    {
      year: '', period: '',
      title: 'Founder & Lead Software Engineer', org: 'MQTradePro', type: 'Founder · Trading technology',
      summary: 'I founded MQTradePro and built it end to end: a subscription platform that gives traders live market signals, risk tools and strategies.',
      bullets: [
        'Built the subscription platform: accounts, pricing tiers and paid access to signals and tools.',
        'Live trading signals across Forex, gold, indices and crypto, with a public track-record page.',
        'Designed “Risk Guardian”, which sizes every signal to the subscriber’s own account, plus breach alerts for prop-firm challenges.',
        'Sell invite-only TradingView Pine Script strategies and indicators, per script.',
        'Own the architecture, product strategy, frontend, APIs, deployments and support.',
      ],
      tags: ['React', 'Python', 'Flask', 'SQL', 'MetaTrader 5', 'Pine Script'],
      link: { label: 'mqtradepro.com', href: 'https://mqtradepro.com/' },
    },
    {
      year: '', period: '',
      title: 'Full-Stack Developer', org: 'Imara Logic', type: 'AI business automation · Nairobi',
      summary: 'Imara Logic gives businesses one shared WhatsApp inbox, with AI answering the repetitive questions so teams can focus on real work.',
      bullets: [
        'Built frontends and AI chatbots that answer customers instantly.',
        'Integrated WhatsApp, Facebook and Instagram messaging through Meta Business (Imara is a Meta Tech Provider on the WhatsApp Business API).',
        'Built lead-capture workflows that turn chats into sales.',
        'Shipped to production and kept the platform running, used by teams including Fly748 and TradePilot.',
      ],
      tags: ['JavaScript', 'Python', 'WhatsApp Business API', 'Meta Business', 'AI chatbots'],
      link: { label: 'imaralogic.co.ke', href: 'https://www.imaralogic.co.ke/' },
    },
    {
      year: '', period: '',
      title: 'Software Engineering Programme', org: 'Moringa School, Kenya', type: 'Intensive full-stack training',
      summary: 'A project-based programme covering the full stack, from Python and SQL to React and REST APIs.',
      bullets: [
        'Python: object-oriented programming, data structures, testing with pytest, and SQL with the SQLAlchemy ORM and Alembic migrations.',
        'Backend: REST APIs with Flask, Flask-RESTful and Marshmallow, plus authentication, sessions and authorisation.',
        'Frontend: React apps including Bot Battlr and Job Finder, deployed on Vercel and Netlify.',
        'Team capstone: SkillSwap Hub, a peer-to-peer learning platform (React + Python API) with live Google Meet sessions, built in a team of five.',
        'Hotel Management System: a Python command-line app for rooms, guests and bookings.',
      ],
      tags: ['Python', 'Flask', 'SQLAlchemy', 'React', 'SQL', 'Git'],
    },
    {
      year: '', period: '',
      title: 'BSc Software Development', org: 'KCA University, Nairobi', type: 'Degree · Currently studying',
      summary: 'Studying for a degree in software development while building real products.',
      bullets: [
        'Coursework in programming, systems analysis and software engineering.',
        'Current unit: Web Technologies and Internet Applications (HTML, CSS, Git/GitHub and web publishing).',
      ],
      tags: ['Software engineering', 'Web technologies'],
    },
  ],

  // ---- "My ability card" pop-up -------------------------------------------
  ability: {
    title: 'My ability card',
    subtitle: 'Full-Stack Software Developer · Kenya',
    stats: [
      { label: 'Projects shipped', value: '5' },
      { label: 'Live products', value: '4' },
      { label: 'Platform founded', value: '1' },
    ],
    strengths: ['AI-assisted development', 'Problem solving', 'Team collaboration', 'Communication', 'Adaptability', 'Time management'],
    tools: ['Python', 'JavaScript', 'React.js', 'AI tools (Claude, ChatGPT)', 'Flask', 'PostgreSQL', 'SQLite', 'Git & GitHub', 'Postman', 'Vercel', 'Netlify'],

    // The 3D holo card (js/card.js). Stats are YOUR OWN 0–100 self-ratings:
    // TODO Tonny: change these numbers to whatever feels honest to you.
    card: {
      role: 'Full-Stack Software Developer',
      photo: 'assets/card-photo.jpg',
      stats: [
        { label: 'Frontend', value: 88 },
        { label: 'Backend & APIs', value: 85 },
        { label: 'AI & Automation', value: 82 },
        { label: 'Trading Tech', value: 90 },
      ],
      based: 'Kenya',
      works: 'Remotely',
      replies: '< 24 hours',
    },
  },

  // Last pill in the opening intro (after your name and the four skills).
  introLast: 'Open to work',

  // ---- Contact form ------------------------------------------------------
  replyWindow: 'one business day',
  contactOptions: [
    'A website or web app',
    'A backend or API',
    'An AI chatbot or automation',
    'A trading tool or bot',
    'A full-time or contract role',
    'Just a question',
  ],

  // ---- Closing call to action ---------------------------------------------
  cta: {
    title: 'Got a project?',
    title2: "Let's build it together.",
    text: 'Web apps, APIs, automation and trading tools. Tell me what you need and I reply within one business day.',
  },

  // ---- Footer links (leave [] to hide) -------------------------------------
  socials: [
    { label: 'GitHub', href: 'https://github.com/Bett-001' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/tonny-bett-b8a52740b/' },
  ],

  // ---- Privacy & credits page ----------------------------------------------
  legalUpdated: '8 November 2026',
  // Everything this site uses that someone else made. Keep this list accurate:
  // the fonts' licence (SIL OFL) asks for credit.
  credits: [
    { name: 'Onest', by: '© 2021 The Onest Project Authors', use: 'The site’s typeface', licence: 'SIL Open Font License 1.1' },
    { name: 'JetBrains Mono', by: '© 2020 The JetBrains Mono Project Authors', use: 'Small monospace labels', licence: 'SIL Open Font License 1.1' },
    { name: 'EB Garamond', by: '© 2017 The EB Garamond Project Authors', use: 'Captions on the ability card', licence: 'SIL Open Font License 1.1' },
    { name: 'Google Fonts', by: 'Google LLC', use: 'Serves the fonts above', licence: 'Google Fonts terms of service' },
    { name: 'Design inspiration', by: 'therishithakor.com by Rishi Thakor', use: 'Layout and interaction ideas: the doors, pull cord and flip-card roles', licence: 'Ideas only. All code here was written from scratch, and all text and photos are mine' },
  ],
};
