// Single source of truth for the three packages.
// Keep in step with LinkedIn (Services page) and the Google Business Profile products.
// Prices are starting prices in rupees; the final quote comes after a short brief.

export const CONTACT = {
  email: 'work@lakshpradhwani.com',
  whatsappNumber: '918433364186',
  linkedin: 'https://www.linkedin.com/in/laksh-pradhwani',
  github: 'https://github.com/TheRealLaksh',
};

export const whatsappLink = (message = "Hi Laksh, I found your website and I'd like to talk about a project.") =>
  `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;

export const mailLink = (subject = 'Project enquiry') =>
  `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}`;

export const packages = [
  {
    id: 'website',
    name: 'Business Website + CMS',
    price: '₹30,000',
    bestFor: 'Manufacturers, clinics, agencies and growing companies',
    description:
      'A fast, mobile-friendly company website with an admin panel your own team uses to edit pages and content.',
    features: [
      'Custom multi-page design',
      'Admin panel (CMS) to edit your content',
      'Contact and enquiry forms with a WhatsApp button',
      'Search-ready basics: titles, descriptions, sitemap',
      'Fast on phones, built with React or Next.js',
    ],
    gradient: 'from-sky-500 via-blue-500 to-sky-500',
    glowColor: 'rgba(14, 165, 233, 0.18)',
    cta: 'Ask about a website',
  },
  {
    id: 'ai',
    name: 'AI Features + Automation',
    price: '₹55,000',
    bestFor: 'Teams that want to save time or add something smart to a product',
    description:
      'Practical AI added to a site or app you already have, or built into a new one.',
    features: [
      'Chat assistant that answers from your own content',
      'Workflow automation for forms, emails and sheets',
      'Computer vision features such as image and gesture input',
      'Built into your existing site or app',
      'Clear notes on the running cost of any AI service used',
    ],
    gradient: 'from-purple-500 via-pink-500 to-purple-500',
    glowColor: 'rgba(168, 85, 247, 0.18)',
    cta: 'Ask about AI features',
  },
  {
    id: 'app',
    name: 'Custom Web App',
    price: '₹75,000',
    bestFor: 'Startups, shops and operations teams with a process to digitise',
    description:
      'A web application built around how your business actually works: logins, dashboards, payments and data.',
    features: [
      'Login with roles, such as admin and staff',
      'Dashboard with reports and data export',
      'Payments with Razorpay',
      'Booking, inventory or order flows built to your process',
      'Database designed for your data (MySQL or PostgreSQL)',
    ],
    gradient: 'from-amber-500 via-orange-500 to-amber-500',
    glowColor: 'rgba(245, 158, 11, 0.18)',
    cta: 'Ask about a web app',
  },
];

export const featuredWork = [
  {
    name: 'Profiley',
    kind: 'Resume builder',
    url: 'https://profiley.lakshpradhwani.com',
    description:
      'A free resume builder with live preview, theme switching and one-click PDF export. React with a Firebase backend.',
  },
  {
    name: 'Helios',
    kind: 'Web music player',
    url: 'https://music.lakshpradhwani.com',
    description:
      'Adaptive cover colour, five ambiences, a waveform seekbar, three visualisers, a queue and a 3-band equaliser. No frameworks.',
  },
  {
    name: 'Calibridge',
    kind: 'Offline-first calendar app',
    url: 'https://calibridge.lakshpradhwani.com',
    description:
      'Installable calendar PWA in strict TypeScript with real time zones, repeating events, reminders and .ics import and export. 43 end-to-end tests.',
  },
];

export const stack = [
  'React',
  'Next.js',
  'TypeScript',
  'Node.js',
  'Django',
  'MySQL',
  'PostgreSQL',
  'MongoDB',
  'Firebase',
  'Razorpay',
  'Playwright',
];
