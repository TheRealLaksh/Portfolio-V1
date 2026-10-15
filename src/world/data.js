// Content for the "valley" portfolio. Everything here comes from Laksh's own records
// (vault notes, LinkedIn extract, GitHub). No invented numbers: a stat appears only if it is real.
// Items marked (confirm) in comments still need Laksh's OK before this goes to main.

export const ME = {
  name: 'Laksh Pradhwani',
  first: 'Laksh',
  email: 'work@lakshpradhwani.com',
  whatsapp: '918433364186',
  github: 'https://github.com/TheRealLaksh',
  linkedin: 'https://www.linkedin.com/in/laksh-pradhwani',
  instagram: 'https://www.instagram.com/laksh.pradhwani',
  resume: 'https://profiley.lakshpradhwani.com/laksh',
  // A real booking link does not exist yet (open item in HANDOFF). Until then the call button opens WhatsApp.
  book: null,
};

export const waLink = (m = "Hi Laksh, I found your website and I'd like to talk about a project.") =>
  `https://wa.me/${ME.whatsapp}?text=${encodeURIComponent(m)}`;

// Places in the valley. `c` is the pin colour. `sheet` is what opens when a place is clicked.
export const PLACES = {
  shiftsdeal: {
    c: '#E8505B', side: 'left', tag: 'Now · Aug 2026', t: 'ShiftsDeal', r: 'Tech Head',
    h: 'The whole platform, one person.',
    story: [
      'ShiftsDeal is an early-stage venue-booking marketplace in Delhi. I joined on <b>1 August 2026</b> as a social media intern and video editor, moved into growth and cold calls, and ended up as the <b>entire tech function</b>.',
      'I built the website from scratch and took it to production, wired <b>Razorpay</b> payments, and ship new features most days. The database outgrew the free tier within weeks and moved to a paid plan.',
    ],
    nums: [['1 Aug', 'joined, 2026'], ['Solo', 'full-stack build'], ['Daily', 'feature shipping']],
    links: [['Visit ShiftsDeal', 'https://www.shiftsdeal.com']],
    journey: 8,
  },
  mu: {
    c: '#8E7CFF', side: 'right', tag: 'Term 1 · 2026', t: "Masters' Union", r: 'UG, Data Science & AI',
    h: 'Learning business next to code.',
    story: [
      'I got into the <b>UG programme in Data Science &amp; AI</b> at Masters\' Union in January 2026 and earned a <b>50% scholarship</b> after the proctored exam in June.',
      'I picked it because I learn best from real, practical work, and because I want to understand business as well as computer science.',
    ],
    nums: [['50%', 'scholarship'], ['2026–30', 'class'], ['Term 1', 'right now']],
    links: [],
    journey: 7,
  },
  bestow: {
    c: '#1FA6A0', side: 'left', tag: 'Freelance · 2026', t: 'Bestow', r: 'Freelance developer',
    h: 'Client websites with a panel they can run.',
    story: [
      'Through the agency <b>Bestow</b> I build full client websites with a content panel, so the client\'s own team can edit pages without calling me.',
      'Each project goes from design directions to a handed-over zip and a live launch. The clients belong to the agency, so I only name them with permission.',
    ],
    nums: [['Site + CMS', 'per project'], ['Design first', 'several directions'], ['Handover', 'zip + live']],
    links: [['See services', '/hire']],
    journey: 8,
  },
  interns: {
    c: '#F2A93B', side: 'left', tag: '2025', t: 'Internships', r: 'Four teams, one year',
    h: 'Where I learned to ship.',
    story: [
      '<b>Unified Mentor</b> (Oct – Dec 2025): full-stack developer, four production apps.',
      '<b>IIT Madras</b> (Aug – Oct 2025): eight-week AI and algorithmic problem-solving programme.',
      '<b>MoreYeahs</b> (Aug – Sep 2025): Django REST backend for a gig platform. <b>Hotel Kavana</b> (Jun 2025): IT infrastructure, on site.',
    ],
    nums: [['4', 'apps shipped at Unified Mentor'], ['8 wk', 'IIT Madras programme'], ['3', 'remote roles']],
    links: [['Read the timeline', '#journey']],
    journey: 5,
  },
  range: {
    c: '#E88A1F', side: 'right', tag: '2019 – 2024', t: 'The range', r: 'National-level shooter',
    h: 'Focus first. Then everything else.',
    story: [
      'I shoot 10 m air pistol and reached the nationals in the U-17 category: <b>state rank 34, all-India rank 54</b>.',
      'Shooting taught me calm under pressure and how to repeat one small motion perfectly. I bring the same habit to a codebase.',
    ],
    nums: [['AIR 54', 'U-17 nationals'], ['State 34', 'rank'], ['10 m', 'air pistol']],
    links: [],
    journey: 2,
  },
  me: {
    c: '#FFC93C', side: 'left', tag: 'About me', t: "Hey, I'm Laksh", r: '18 · Developer · Shooter · Student',
    h: 'I turn complicated problems into things people can use.',
    story: [],
    fun: [
      ['School', '#E8505B', [
        ['Chinmaya International Residential School', 'Coimbatore, 2019 to 2024. House Captain, MUNs, Round Square.'],
        ['Class X: 87.8%', '94% in Maths, my strongest subject.'],
        ['Sunbeam School, Varanasi', 'PCM and Computer Science, 2024 to 2026.'],
      ]],
      ['Work', '#1FA6A0', [
        ['Tech Head at ShiftsDeal', 'The whole platform, from nothing to production.'],
        ['Four internships in 2025', 'Django, full-stack apps, IIT Madras and a hotel network.'],
        ['Freelance with Bestow', 'Client sites with admin panels.'],
      ]],
      ['Off the clock', '#8E7CFF', [
        ['Tabla', 'I keep tabla notes and play when I need a reset.'],
        ['Model UN', 'CHEMUN, IIMUN, TISB and the G20 MUN press corps.'],
        ['Badminton and shooting', 'Precision, repeated.'],
      ]],
    ],
    nums: [['18', 'years old'], ['50+', 'GitHub repos, public and private']],
    links: [['Resume', 'https://profiley.lakshpradhwani.com/laksh'], ['GitHub', 'https://github.com/TheRealLaksh']],
    journey: 8,
  },
};

// The nine stops on the journey map, 2019 to now.
export const JOURNEY = [
  { y: '2019', t: 'Coimbatore', r: 'Chinmaya International Residential School', icon: 'cap',
    p: 'Five years in a residential school: House Captain, a Round Square committee seat and Model UNs from CHEMUN to the G20 press corps.' },
  // Year of the nationals is inferred from the vault timeline (confirm).
  { y: '2023', t: 'On the range', r: 'Nationals, 10 m air pistol', icon: 'target',
    p: 'Years of early mornings on the range ended at the U-17 nationals: state rank 34 and all-India rank 54.' },
  { y: '2024', t: 'Back to Varanasi', r: 'Sunbeam School, Lahartara', icon: 'home',
    p: 'Class X at 87.8% with 94% in Maths. Then PCM and Computer Science, and the first real lines of code.' },
  { y: 'Jun 2025', t: 'Hotel Kavana', r: 'IT infrastructure intern', icon: 'bed',
    p: 'Twenty days on site: hotel management systems, POS integrations, networks and a little workflow automation.' },
  { y: 'Jul 2025', t: 'First portfolio', r: 'GitHub opens, Web Wizards 2nd place', icon: 'code',
    p: 'Opened my GitHub, shipped Portfolio V1, and took second place at Web Wizards with a site about Varanasi.' },
  { y: 'Aug 2025', t: 'Internship season', r: 'MoreYeahs, IIT Madras, Unified Mentor', icon: 'gear',
    p: 'A Django gig platform, an eight-week AI programme with IIT Madras, then four production apps at Unified Mentor.' },
  { y: 'Dec 2025', t: 'Building in public', r: 'Profiley, Vaultara, Mercatora', icon: 'bulb',
    p: 'A resume builder, a privacy-first document vault and a mall management system, plus the first version of this site.' },
  { y: 'Jan 2026', t: "Masters' Union", r: 'Admitted, then a 50% scholarship', icon: 'book',
    p: 'Got into the UG Data Science and AI programme, and the scholarship went from 25% to 50% after the June exam.' },
  { y: 'Aug 2026', t: 'ShiftsDeal and Bestow', r: 'Tech Head, plus freelance', icon: 'rocket',
    p: 'Joined ShiftsDeal as an intern and became Tech Head within weeks. Started client websites with Bestow the same month.' },
];

// Selected work: real, public, linkable. (confirm) which others he wants featured.
export const WORK = [
  { id: 'shiftsdeal', n: 'ShiftsDeal', k: 'Venue-booking marketplace', c: '#E8505B', d: 'Built end to end as the only developer: listings, bookings, Razorpay payments and an ops dashboard.',
    tags: ['React', 'Supabase', 'Razorpay'], link: 'https://www.shiftsdeal.com', note: 'My day job' },
  { id: 'profiley', n: 'Profiley', k: 'Resume builder', c: '#1FA6A0', d: 'Live-preview resume editor with ten-plus themes and one-click PDF export. This site\'s resume page is rendered by it.',
    tags: ['React 19', 'Vite', 'Firebase'], link: 'https://profiley.lakshpradhwani.com', note: 'Free to use' },
  { id: 'helios', n: 'Helios', k: 'Web music player', c: '#8E7CFF', d: 'Adaptive cover colour, five ambiences, a waveform seekbar, three visualisers, a queue and a 3-band equaliser. No frameworks.',
    tags: ['JavaScript', 'Web Audio'], link: 'https://music.lakshpradhwani.com', note: 'No frameworks' },
  { id: 'calibridge', n: 'CaliBridge', k: 'Offline-first calendar', c: '#F2A93B', d: 'Installable calendar in strict TypeScript with real time zones, repeating events, reminders and .ics import and export.',
    tags: ['TypeScript', 'PWA'], link: 'https://calibridge.lakshpradhwani.com', note: '43 end-to-end tests' },
  { id: 'vaultara', n: 'Vaultara', k: 'Gov-tech document vault', c: '#E88A1F', d: 'Privacy-first storage for citizen documents, built on Firebase with encrypted storage and secure sharing.',
    tags: ['Firebase', 'Security'], link: 'https://github.com/TheRealLaksh/Vaultara-GovDoc', note: 'Open source' },
  { id: 'mercatora', n: 'Mercatora', k: 'Mall management system', c: '#E8505B', d: 'An admin dashboard for managing shops and mall operations, built with vanilla JavaScript, Vite and Firebase.',
    tags: ['JavaScript', 'Vite', 'Firebase'], link: 'https://github.com/TheRealLaksh/mercatora', note: 'Open source' },
];

// Websites for other people. Only public or clearly his own; client work waits for permission.
export const SITES = [
  { n: 'Arun Medicals', k: 'Local pharmacy site', c: '#1FA6A0', link: 'https://arun-medicals.vercel.app', img: null },
  { n: 'About Varanasi', k: 'Web Wizards, 2nd place', c: '#E88A1F', link: 'https://github.com/TheRealLaksh/about-varanasi', img: null },
  { n: 'Artistry', k: 'Artist portfolio', c: '#8E7CFF', link: 'https://github.com/TheRealLaksh/Artist-Portfolio', img: null },
  { n: 'Kalavrndam', k: 'Arts organisation site', c: '#E8505B', link: 'https://github.com/TheRealLaksh/Kalavrndam', img: null },
];

// Tools, with what Laksh actually does with each. (confirm) the list.
export const STACK = [
  { n: 'React', c: '#1FA6A0', cat: 'Frontend', p: 'This site, Profiley and most client builds. Hooks, routing, state.' },
  { n: 'Next.js', c: '#13233A', cat: 'Frontend', p: 'Client sites and the Futran build. Server components and SEO.' },
  { n: 'TypeScript', c: '#3B82F6', cat: 'Language', p: 'Strict mode on anything that has to last, like CaliBridge.' },
  { n: 'JavaScript', c: '#F2A93B', cat: 'Language', p: 'Helios and Mercatora are plain vanilla, no frameworks.' },
  { n: 'Python', c: '#4F9E4A', cat: 'Language', p: 'Automation, data work and the scripts that run my own vault.' },
  { n: 'Django', c: '#2E7D5B', cat: 'Backend', p: 'Token-auth REST APIs, roles and CRUD for the GigX platform.' },
  { n: 'Node.js', c: '#68A063', cat: 'Backend', p: 'APIs and the AI chat backend behind this portfolio.' },
  { n: 'Supabase', c: '#3ECF8E', cat: 'Data', p: 'Auth and Postgres for ShiftsDeal.' },
  { n: 'Firebase', c: '#F5A623', cat: 'Data', p: 'Profiley and Vaultara run on it.' },
  { n: 'MySQL', c: '#2F7FD8', cat: 'Data', p: 'The database behind every Bestow client site.' },
  { n: 'Razorpay', c: '#3395FF', cat: 'Payments', p: 'Checkout and payment flows for ShiftsDeal.' },
  { n: 'Tailwind', c: '#38BDF8', cat: 'Styling', p: 'Fast, consistent UI. Used here only where it helps.' },
  { n: 'Framer Motion', c: '#E8505B', cat: 'Motion', p: 'Interface motion, kept calm and purposeful.' },
  { n: 'Playwright', c: '#2EAD33', cat: 'Testing', p: 'End-to-end tests. CaliBridge has 43.' },
  { n: 'Vercel', c: '#13233A', cat: 'Deploy', p: 'Hosting, previews and zero-downtime deploys.' },
  { n: 'Git + GitHub', c: '#E8505B', cat: 'Workflow', p: 'Small commits, branches and previews for every change.' },
  { n: 'Claude Code', c: '#D97757', cat: 'AI', p: 'My daily pair programmer, with rules in a CLAUDE.md per project.' },
];

// "How I work" case study. Facts only, no invented metrics.
export const PROCESS = {
  title: 'Taking ShiftsDeal from nothing to live',
  steps: [
    { t: 'Listen first', p: 'I spent the first days on cold calls, hearing what venue owners actually asked before I wrote a line of code.' },
    { t: 'Smallest working slice', p: 'Listings, then bookings, then payments. Each slice shipped before the next one started.' },
    { t: 'Make money flow', p: 'Razorpay went in early, because a booking product that cannot take payment is a brochure.' },
    { t: 'Watch it break', p: 'Real users found what tests missed. When the database outgrew the free tier I upgraded the same week.' },
    { t: 'Ship again', p: 'Small releases most days, so every fix reaches users quickly and nothing piles up.' },
  ],
};

export const OFF_CLOCK = {
  list1: ['Tabla and music', 'Model UN and debate', 'Shooting and badminton'],
  list2: ['Building with Claude Code every day', 'Asking "how does that work?" about everything'],
};

export const NOTE_STICKIES = [
  { at: 0.25, sc: '#FFE98A', r: -6, pos: { right: '0', top: '0' }, text: 'Masters\' Union, class of 2030.', small: 'UG Data Science & AI' },
  { at: 0.5, sc: '#FFD1C4', r: 5, pos: { right: '2%', top: '34%' }, text: 'Shipped four production apps in 2025.', small: 'Before college even started' },
  { at: 0.75, sc: '#CFE7FF', r: -3, pos: { right: '0', bottom: '0' }, text: 'Now Tech Head at a Delhi startup.', small: 'ShiftsDeal' },
];

export const SEED_NOTES = [];
