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
    h: 'From a basic starter to a live platform.',
    story: [
      'ShiftsDeal is an early-stage venue-booking marketplace in Delhi. I joined on <b>1 August 2026</b> as an intern: editing video, running social media and making cold calls to venue owners. Then the website needed an owner, and I became <b>Tech Head</b>.',
      'The site began as a basic first version. I took it over and built it out into the live platform: <b>bookings with Razorpay payments</b>, a <b>venue-owner dashboard and admin panel</b>, <b>AI-assisted search and checks</b>, and an <b>email campaign system</b>, with automation and tests behind it. New features ship most days.',
      'Right now I am building the <b>ShiftsDeal app</b>.',
    ],
    nums: [['1 Aug', 'joined, 2026'], ['Daily', 'feature shipping'], ['App', 'in progress']],
    links: [['Visit ShiftsDeal', 'https://www.shiftsdeal.com']],
    journey: 8,
  },
  mu: {
    c: '#8E7CFF', side: 'right', tag: 'Term 1 · 2026', t: "Masters' Union", r: 'UG, Data Science & AI',
    h: 'Learning business next to code.',
    story: [
      'I am pursuing the <b>UG programme in Data Science &amp; AI</b> at Masters\' Union, <b>class of 2030</b>. I got in in January 2026.',
      'I picked it because I learn best from real, practical work, and because I want to understand business as well as computer science.',
    ],
    nums: [['UG', 'Data Science & AI'], ['2030', 'class of'], ['Term 1', 'right now']],
    links: [],
    journey: 7,
  },
  bestow: {
    c: '#1FA6A0', side: 'left', tag: 'Intern + freelance · 2026', t: 'Bestow', r: 'Intern and freelance developer',
    h: 'Client websites with a panel they can run.',
    // Agency facts are from bestow.in (founded 2009; Vadodara, Ahmedabad, Rajkot, Gurgaon). Directories say 2008: confirm if it matters.
    story: [
      '<b>Bestow</b> is a creative and marketing agency, founded in 2009 and based in Gujarat (Vadodara and Ahmedabad) with offices in Rajkot and Gurgaon. It does branding, SEO, web design and apps.',
      'I joined in August 2026 as an intern and now build their clients\' websites as a freelance developer: a full site plus a content panel, so the client\'s own team can edit pages without calling me.',
      'Each project goes from design directions to a handed-over zip and a live launch. The clients belong to the agency, so I do not name them.',
    ],
    nums: [['2009', 'agency founded'], ['Site + CMS', 'per project'], ['Zip + live', 'handover']],
    links: [['See services', '/hire']],
    journey: 8,
  },
  interns: {
    c: '#F2A93B', side: 'left', tag: '2025 – now', t: 'Internships', r: 'Six teams since 2025',
    h: 'Where I learned to ship.',
    story: [
      '<b>Now:</b> <b>ShiftsDeal</b> (Aug 2026 – now), started as an intern on video, social media and cold calls and is now Tech Head. <b>Bestow</b> (Aug 2026 – now), intern and freelance developer on client websites.',
      '<b>Unified Mentor</b> (Oct – Dec 2025): full-stack developer, four production apps. <b>IIT Madras</b> (Aug – Oct 2025): eight-week AI and algorithmic problem-solving programme.',
      '<b>MoreYeahs</b> (Aug – Sep 2025): Django REST backend for a gig platform. <b>Hotel Kavana</b> (Jun 2025): IT infrastructure, on site.',
    ],
    nums: [['2', 'current roles'], ['4', 'apps shipped at Unified Mentor'], ['8 wk', 'IIT Madras programme']],
    links: [['Read the timeline', '#journey']],
    journey: 5,
  },
  range: {
    c: '#E88A1F', side: 'right', tag: 'Past · 2024 – 25', t: 'The range', r: 'Past: national-level shooter',
    h: 'Focus first. Then everything else.',
    story: [
      'In the 2024 – 25 season I shot 10 m air pistol at the U-17 nationals: <b>state rank 34, all-India rank 54</b>. I have left shooting for now.',
      'It taught me calm under pressure and how to repeat one small motion perfectly.',
    ],
    nums: [['AIR 54', 'U-17 nationals'], ['State 34', 'rank'], ['2024–25', 'season']],
    links: [],
    journey: 2,
  },
  me: {
    c: '#FFC93C', side: 'left', tag: 'About me', t: "Hey, I'm Laksh", r: '18 · Developer · Student',
    h: 'I turn complicated problems into things people can use.',
    story: [],
    fun: [
      ['School', '#E8505B', [
        ['Chinmaya International Residential School', 'Coimbatore, 2019 to 2024. House Captain, MUNs, Round Square.'],
        ['Class X: 87.8%', '94% in Maths, my strongest subject.'],
        ['Sunbeam School, Varanasi', 'PCM and Computer Science, 2024 to 2026.'],
      ]],
      ['Work', '#1FA6A0', [
        ['Tech Head at ShiftsDeal', 'I own the platform and am building the app.'],
        ['Intern and freelance at Bestow', 'Client sites with admin panels.'],
        ['Four internships in 2025', 'Django, full-stack apps, IIT Madras and a hotel network.'],
      ]],
      ['Off the clock', '#8E7CFF', [
        ['Model UN', 'CHEMUN, IIMUN, TISB and the G20 MUN press corps.'],
        ['Badminton', 'District level, and I still play.'],
        ['Reading about business', 'Part of why I chose Masters\' Union.'],
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
  { y: '2024', t: 'Back to Varanasi', r: 'Sunbeam School, Lahartara', icon: 'home',
    p: 'Class X at 87.8% with 94% in Maths. Then PCM and Computer Science, and the first real lines of code.' },
  // The ranks are from the 2024-25 season (Laksh, 16 Oct 2026). The range sheet points at this stop (PLACES.range.journey = 2).
  { y: '2024 – 25', t: 'On the range', r: 'Nationals, 10 m air pistol', icon: 'target',
    p: 'Early mornings on the range led to the U-17 nationals: state rank 34 and all-India rank 54. I have left shooting for now.' },
  { y: 'Jun 2025', t: 'Hotel Kavana', r: 'IT infrastructure intern', icon: 'bed',
    p: 'Twenty days on site: hotel management systems, POS integrations, networks and a little workflow automation.' },
  { y: 'Jul 2025', t: 'First portfolio', r: 'GitHub opens, Web Wizards 2nd place', icon: 'code',
    p: 'Opened my GitHub, shipped Portfolio V1, and took second place at Web Wizards with a site about Varanasi.' },
  { y: 'Aug 2025', t: 'Internship season', r: 'MoreYeahs, IIT Madras, Unified Mentor', icon: 'gear',
    p: 'A Django gig platform, an eight-week AI programme with IIT Madras, then four production apps at Unified Mentor.' },
  { y: 'Dec 2025', t: 'Building in public', r: 'Profiley, Vaultara, Mercatora', icon: 'bulb',
    p: 'A resume builder, a privacy-first document vault and a mall management system, plus the first version of this site.' },
  { y: 'Jan 2026', t: "Masters' Union", r: 'UG, Data Science & AI', icon: 'book',
    p: 'Got into the UG Data Science and AI programme at Masters\' Union, class of 2030.' },
  { y: 'Aug 2026', t: 'ShiftsDeal and Bestow', r: 'Tech Head, plus freelance', icon: 'rocket',
    p: 'Joined ShiftsDeal as an intern (video, social media, cold calls), then became Tech Head. Started client websites with Bestow the same month.' },
];

// Selected work: real, public, linkable. (confirm) which others he wants featured.
export const WORK = [
  { id: 'shiftsdeal', n: 'ShiftsDeal', k: 'Venue-booking marketplace', c: '#E8505B', d: 'Took a basic first version and built it into the live platform: bookings, Razorpay payments, owner dashboard, admin panel and AI search. The app is next.',
    tags: ['Next.js', 'Razorpay', 'AI search'], link: 'https://www.shiftsdeal.com', note: 'App in progress' },
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
  title: 'Taking ShiftsDeal from a basic start to live',
  steps: [
    { t: 'Listen first', p: 'I spent the first days on cold calls, hearing what venue owners actually asked before I changed a line of code.' },
    { t: 'Smallest working slice', p: 'Start from what already works, then improve one slice at a time: listings, bookings, then payments. Each slice shipped before the next one started.' },
    { t: 'Make money flow', p: 'Razorpay went in early, because a booking product that cannot take payment is a brochure.' },
    { t: 'Watch it break', p: 'Real users found what tests missed. I fixed it the same week and added a test so it stays fixed.' },
    { t: 'Ship again', p: 'Small releases most days, so every fix reaches users quickly and nothing piles up.' },
  ],
};

export const OFF_CLOCK = {
  list1: ['Reading about business', 'Model UN and debate', 'Badminton, and shooting in the past'],
  list2: ['Building with Claude Code every day', 'Asking "how does that work?" about everything'],
};

export const NOTE_STICKIES = [
  { at: 0.25, sc: '#FFE98A', r: -6, pos: { right: '0', top: '0' }, text: 'Masters\' Union, class of 2030.', small: 'UG Data Science & AI' },
  { at: 0.5, sc: '#FFD1C4', r: 5, pos: { right: '2%', top: '34%' }, text: 'Shipped four production apps in 2025.', small: 'Before college even started' },
  { at: 0.75, sc: '#CFE7FF', r: -3, pos: { right: '0', bottom: '0' }, text: 'Now Tech Head at a Delhi startup.', small: 'ShiftsDeal' },
];

export const SEED_NOTES = [];
