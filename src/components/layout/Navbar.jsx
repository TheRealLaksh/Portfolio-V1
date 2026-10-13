import React from 'react';
import { FiHome, FiUser, FiBriefcase, FiCpu, FiCode, FiFileText, FiMail, FiPackage } from 'react-icons/fi';
import useScrollSpy from '../../hooks/useScrollSpy';
import { cn } from '../../utils/cn';
import { triggerWarp } from '../../utils/triggerWarp';
import { triggerHaptic } from '../../utils/triggerHaptic';
import { useLenis } from '@studio-freight/react-lenis';
import { PiHandshake } from 'react-icons/pi';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navIds = ['home', 'about', 'experience', 'skills', 'projects', 'resume', 'services', 'contact'];
  const activeSection = useScrollSpy(navIds);
  const lenis = useLenis();
  
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const isHirePage = location.pathname === '/hire';

  const scrollToSection = (e, id) => {
    e.preventDefault();
    triggerHaptic();
    triggerWarp();

    if (!isHomePage) {
        navigate(`/#${id}`);
        setTimeout(() => {
             const element = document.getElementById(id);
             if (element) element.scrollIntoView({ behavior: 'auto' });
        }, 100);
        return;
    }
    
    if (lenis) {
      lenis.scrollTo(`#${id}`, {
        offset: -50,
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'auto' });
      }
    }
  };

  const getLinkClass = (id) => cn(
    "relative flex items-center justify-center rounded-xl px-4 py-3 text-base font-medium transition-all duration-300 shrink-0 group hover:bg-white/5",
    activeSection === id 
      ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]" 
      : "text-slate-400 hover:text-slate-200"
  );

  const getTextClass = (id) => cn(
    "overflow-hidden transition-all duration-300 ease-in-out block",
    activeSection === id 
      ? "w-auto opacity-100 ml-2" 
      : "w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 group-hover:ml-2"
  );

  return (
    <nav className={cn(
      "hidden md:flex fixed left-1/2 -translate-x-1/2 z-50 flex-nowrap items-center gap-2 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-3 shadow-2xl shadow-black/80 transition-all duration-500",
      "top-6 opacity-100 translate-y-0"
    )}>
      
      <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className={getLinkClass('home')}>
        <FiHome className="w-5 h-5" />
        <span className={getTextClass('home')}>Home</span>
      </a>

      <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className={getLinkClass('about')}>
        <FiUser className="w-5 h-5" />
        <span className={getTextClass('about')}>About</span>
      </a>

      <a href="#experience" onClick={(e) => scrollToSection(e, 'experience')} className={getLinkClass('experience')}>
        <FiBriefcase className="w-5 h-5" />
        <span className={getTextClass('experience')}>Work</span>
      </a>

      <a href="#skills" onClick={(e) => scrollToSection(e, 'skills')} className={getLinkClass('skills')}>
        <FiCpu className="w-5 h-5" />
        <span className={getTextClass('skills')}>Skills</span>
      </a>

      <a href="#projects" onClick={(e) => scrollToSection(e, 'projects')} className={getLinkClass('projects')}>
        <FiCode className="w-5 h-5" />
        <span className={getTextClass('projects')}>Projects</span>
      </a>

      <div className="mx-1 h-6 w-[1px] bg-white/10 shrink-0 block"></div>

      <a href="#resume" onClick={(e) => scrollToSection(e, 'resume')} className={getLinkClass('resume')}>
        <FiFileText className="w-5 h-5" />
        <span className={getTextClass('resume')}>Resume</span>
      </a>

      <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className={getLinkClass('services')}>
        <FiPackage className="w-5 h-5" />
        <span className={getTextClass('services')}>Services</span>
      </a>

      <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className={getLinkClass('contact')}>
        <FiMail className="w-5 h-5" />
        <span className={getTextClass('contact')}>Contact</span>
      </a>

      <div className="mx-1 h-6 w-[1px] bg-white/10 shrink-0 block"></div>

      <Link
        to="/hire"
        onClick={triggerHaptic}
        className={cn(
          "relative flex items-center justify-center rounded-xl px-4 py-3 text-base font-medium transition-all duration-300 shrink-0 group",
          isHirePage
            ? "bg-sky-500/20 text-sky-300 shadow-[0_0_15px_rgba(14,165,233,0.25)]"
            : "text-sky-400 hover:bg-sky-500/10 hover:text-sky-300"
        )}
      >
        <PiHandshake className="w-5 h-5" />
        <span
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out block",
            isHirePage
              ? "w-auto opacity-100 ml-2"
              : "w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 group-hover:ml-2"
          )}
        >
          Hire me
        </span>
      </Link>

    </nav>
  );
};

export default Navbar;