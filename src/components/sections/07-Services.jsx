import React from 'react';
import { Link } from 'react-router-dom';
import { PiArrowRightBold } from 'react-icons/pi';
import { TextReveal } from '../ui/TextReveal';
import { Reveal } from '../ui/Reveal';
import { Parallax } from '../ui/Parallax';
import { PackageCard } from '../ui/PackageCard';
import { triggerHaptic } from '../../utils/triggerHaptic';
import { packages } from '../../data/packages';

const Services = () => {
  // Smooth scroll to the contact section instead of a hard jump.
  const handleScrollToContact = (e) => {
    e.preventDefault();
    triggerHaptic();
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="my-16 sm:my-32 relative z-10 w-full scroll-mt-20">
      {/* Background Number */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Parallax
          speed={-0.2}
          className="absolute top-[5%] right-4 text-slate-800/50 text-6xl font-bold font-mono opacity-20"
        >
          07
        </Parallax>
      </div>

      <div className="w-full px-6 md:px-12 max-w-[1400px] mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <TextReveal className="flex justify-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Services & Pricing</h2>
          </TextReveal>
          <Reveal delay={0.2}>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Websites, admin panels and AI features for businesses. These are starting prices;
              send a short brief and I'll reply with a scope and quote.
            </p>
          </Reveal>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <Reveal key={pkg.id} delay={index * 0.1} className="h-full">
              <PackageCard pkg={pkg} href="#contact" onClick={handleScrollToContact} label="Discuss this" />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.4}>
          <div className="mt-12 flex flex-col items-center gap-4 text-center">
            <Link
              to="/hire"
              onClick={triggerHaptic}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-sky-500/60 hover:text-sky-300"
            >
              See details and hire me
              <PiArrowRightBold className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Services;
