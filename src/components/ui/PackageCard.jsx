import React from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { PiCheckBold } from 'react-icons/pi';
import { cn } from '../../utils/cn';
import { GradientButton } from './GradientButton';

// Card with a soft spotlight that follows the pointer.
const SpotlightCard = ({ children, className = '', spotlightColor }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(650px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 80%)`;

  const handleMouseMove = ({ currentTarget, clientX, clientY }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return (
    <div
      className={cn('group relative overflow-hidden border border-slate-800 bg-slate-900/50', className)}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{ background }}
      />
      <div className="relative flex h-full flex-col">{children}</div>
    </div>
  );
};

// One package: name, starting price, who it is for, what is in it, one action.
export const PackageCard = ({ pkg, href, onClick, external = false, label }) => (
  <SpotlightCard
    spotlightColor={pkg.glowColor}
    className="flex h-full flex-col rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl sm:p-8"
  >
    <div className="relative z-10 mb-6">
      <h3 className="mb-2 text-2xl font-bold text-white">{pkg.name}</h3>
      <p className="min-h-[2.5rem] text-sm text-slate-400">{pkg.bestFor}</p>
    </div>

    <div className="relative z-10 mb-6 border-b border-slate-800 pb-6">
      <div className="flex items-baseline gap-2">
        <span className="text-xs uppercase tracking-wider text-slate-500">from</span>
        <span className="text-3xl font-bold text-white">{pkg.price}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">{pkg.description}</p>
    </div>

    <ul className="relative z-10 mb-8 flex-1 space-y-3">
      {pkg.features.map((feature) => (
        <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
          <PiCheckBold className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" aria-hidden="true" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>

    <div className="relative z-10 mt-auto">
      <GradientButton
        href={href}
        onClick={onClick}
        gradient={pkg.gradient}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {label || pkg.cta}
      </GradientButton>
    </div>
  </SpotlightCard>
);

export default PackageCard;
