import React from 'react';
import {
  PiWhatsappLogo,
  PiEnvelopeSimple,
  PiArrowUpRightBold,
  PiLinkedinLogo,
  PiGithubLogo,
  PiMapPin,
} from 'react-icons/pi';
import { TextReveal } from '../components/ui/TextReveal';
import { Reveal } from '../components/ui/Reveal';
import { PackageCard } from '../components/ui/PackageCard';
import { triggerHaptic } from '../utils/triggerHaptic';
import { usePageMeta } from '../hooks/usePageMeta';
import { HIRE_META } from '../data/routeMeta';
import {
  CONTACT,
  packages,
  featuredWork,
  stack,
  whatsappLink,
  mailLink,
} from '../data/packages';

const steps = [
  {
    n: '01',
    title: 'Send a short brief',
    text: 'What you need, who it is for and roughly when you want it. A few lines is enough.',
  },
  {
    n: '02',
    title: 'Get a scope and quote',
    text: 'I reply with what I would build, what it includes and what it costs.',
  },
  {
    n: '03',
    title: 'Agree and start',
    text: 'Once the scope and price are agreed, I get started.',
  },
];

const Hire = () => {
  usePageMeta(HIRE_META);

  return (
    <div className="relative z-10 w-full pt-28 pb-24 sm:pt-36">
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-12">
        {/* ---------- Intro ---------- */}
        <header className="max-w-3xl">
          <Reveal>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">
              <PiMapPin className="h-4 w-4 text-sky-400" aria-hidden="true" />
              Freelance full-stack developer, Delhi NCR
            </p>
          </Reveal>
          <TextReveal>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
              Websites, admin panels and AI features for businesses.
            </h1>
          </TextReveal>
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
              I'm Laksh. I build company websites your team can edit, apps that run on your process,
              and AI features that save time. Tell me what you need and I'll reply with a scope and quote.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={triggerHaptic}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-sky-900/30 transition-all hover:bg-sky-500 active:scale-95"
              >
                <PiWhatsappLogo className="h-5 w-5" aria-hidden="true" />
                Message me on WhatsApp
              </a>
              <a
                href={mailLink('Project brief')}
                onClick={triggerHaptic}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3.5 font-semibold text-white transition-colors hover:border-sky-500/60 hover:text-sky-300"
              >
                <PiEnvelopeSimple className="h-5 w-5" aria-hidden="true" />
                Email a brief
              </a>
            </div>
          </Reveal>
        </header>

        {/* ---------- Packages ---------- */}
        <section className="mt-24 sm:mt-32" aria-labelledby="packages-heading">
          <Reveal>
            <h2 id="packages-heading" className="text-3xl font-bold text-white md:text-4xl">
              What I can build for you
            </h2>
            <p className="mt-3 max-w-2xl text-slate-400">
              Starting prices in rupees. Every project is different, so the final price comes with
              the quote.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg, i) => (
              <Reveal key={pkg.id} delay={i * 0.1} className="h-full">
                <PackageCard
                  pkg={pkg}
                  external
                  href={whatsappLink(
                    `Hi Laksh, I'm interested in the ${pkg.name} (from ${pkg.price}). Here's what I need: `,
                  )}
                  onClick={triggerHaptic}
                />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- Recent work ---------- */}
        <section className="mt-24 sm:mt-32" aria-labelledby="work-heading">
          <Reveal>
            <h2 id="work-heading" className="text-3xl font-bold text-white md:text-4xl">
              Recent work
            </h2>
            <p className="mt-3 max-w-2xl text-slate-400">
              Three projects you can open and use right now.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {featuredWork.map((work, i) => (
              <Reveal key={work.name} delay={i * 0.1} className="h-full">
                <a
                  href={work.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={triggerHaptic}
                  className="group flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/10"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{work.name}</h3>
                      <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">{work.kind}</p>
                    </div>
                    <PiArrowUpRightBold
                      className="h-5 w-5 shrink-0 text-slate-500 transition-colors group-hover:text-sky-400"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-slate-400">{work.description}</p>
                  <span className="mt-5 text-sm font-medium text-sky-400">
                    {work.url.replace('https://', '')}
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- How it works ---------- */}
        <section className="mt-24 sm:mt-32" aria-labelledby="how-heading">
          <Reveal>
            <h2 id="how-heading" className="text-3xl font-bold text-white md:text-4xl">
              How it starts
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.1} className="h-full">
                <div className="h-full rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
                  <span className="font-mono text-sm text-sky-400">{step.n}</span>
                  <h3 className="mt-3 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- Stack ---------- */}
        <section className="mt-24 sm:mt-32" aria-labelledby="stack-heading">
          <Reveal>
            <h2 id="stack-heading" className="text-2xl font-bold text-white md:text-3xl">
              What I work with
            </h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {stack.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-slate-800 bg-slate-900/60 px-4 py-1.5 text-sm text-slate-300"
                >
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        {/* ---------- Closing call to action ---------- */}
        <section className="mt-24 sm:mt-32" aria-labelledby="cta-heading">
          <Reveal>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-8 text-center backdrop-blur-xl sm:p-12">
              <h2 id="cta-heading" className="text-3xl font-bold text-white md:text-4xl">
                Have a project in mind?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-400">
                Send me a short brief by WhatsApp or email. I'll reply with a scope and quote.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={triggerHaptic}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-sky-900/30 transition-all hover:bg-sky-500 active:scale-95"
                >
                  <PiWhatsappLogo className="h-5 w-5" aria-hidden="true" />
                  WhatsApp
                </a>
                <a
                  href={mailLink('Project brief')}
                  onClick={triggerHaptic}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3.5 font-semibold text-white transition-colors hover:border-sky-500/60 hover:text-sky-300"
                >
                  <PiEnvelopeSimple className="h-5 w-5" aria-hidden="true" />
                  {CONTACT.email}
                </a>
              </div>
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500">
                <a
                  href={CONTACT.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-white"
                >
                  <PiLinkedinLogo className="h-5 w-5" aria-hidden="true" />
                  LinkedIn
                </a>
                <a
                  href={CONTACT.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-white"
                >
                  <PiGithubLogo className="h-5 w-5" aria-hidden="true" />
                  GitHub
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );
};

export default Hire;
