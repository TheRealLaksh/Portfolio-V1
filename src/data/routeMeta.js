// Page metadata per route. Used twice:
//  - at build time, vite.config.js writes dist/hire/index.html from index.html with these values,
//    so crawlers and link previews (LinkedIn, WhatsApp, X) that never run JavaScript see them;
//  - at run time, usePageMeta() applies them when a visitor navigates inside the app.
// Plain JavaScript with no imports so Node can load it from vite.config.js.

export const SITE = 'https://lakshpradhwani.com';

export const HOME_META = {
  title: 'Laksh Pradhwani | Full-Stack Web Developer in Varanasi',
  description:
    'Laksh Pradhwani is a full-stack web developer and aspiring AI/ML engineer in Varanasi, India. See projects, experience and services, or get in touch.',
  ogDescription:
    'Full-stack web developer and aspiring AI/ML engineer in Varanasi, India. Projects, experience and contact details.',
  path: '/',
  imageAlt: 'Laksh Pradhwani, full-stack web developer: portfolio home page',
};

export const HIRE_META = {
  title: 'Hire Laksh Pradhwani | Websites, admin panels and AI features',
  description:
    'Freelance full-stack developer in Delhi NCR. Business websites with a CMS from Rs 30,000, AI features and automation from Rs 55,000, custom web apps from Rs 75,000.',
  ogDescription:
    'Business websites with a CMS from Rs 30,000, AI features and automation from Rs 55,000, custom web apps from Rs 75,000. Send a short brief and get a scope and quote.',
  path: '/hire',
  imageAlt: 'Laksh Pradhwani, freelance full-stack developer: websites, admin panels and AI features',
};

export const hireNoscript = `<main style="font-family: system-ui, sans-serif; max-width: 40rem; margin: 3rem auto; padding: 0 1rem; line-height: 1.6; color: #e2e8f0; background: #050505;">
      <h1>Hire Laksh Pradhwani</h1>
      <p>Freelance full-stack developer in Delhi NCR. I build company websites your team can edit, apps that run on your process, and AI features that save time.</p>
      <ul>
        <li>Business Website + CMS, from Rs 30,000</li>
        <li>AI Features + Automation, from Rs 55,000</li>
        <li>Custom Web App, from Rs 75,000</li>
      </ul>
      <p>Prices are starting prices. Send a short brief and I will reply with a scope and quote. This page needs JavaScript for the full version. You can also reach me here:</p>
      <ul>
        <li><a href="https://wa.me/918433364186" style="color: #38bdf8;">WhatsApp</a></li>
        <li><a href="mailto:work@lakshpradhwani.com?subject=Project%20brief" style="color: #38bdf8;">work@lakshpradhwani.com</a></li>
        <li><a href="https://www.linkedin.com/in/laksh-pradhwani" style="color: #38bdf8;">LinkedIn</a></li>
        <li><a href="https://github.com/TheRealLaksh" style="color: #38bdf8;">GitHub</a></li>
      </ul>
    </main>`;

export const hireJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE}/hire#webpage`,
      url: `${SITE}/hire`,
      name: HIRE_META.title,
      description: HIRE_META.description,
      inLanguage: 'en',
      isPartOf: { '@id': `${SITE}/#website` },
      about: { '@id': `${SITE}/#person` },
      breadcrumb: { '@id': `${SITE}/hire#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${SITE}/hire#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Hire', item: `${SITE}/hire` },
      ],
    },
  ],
};
