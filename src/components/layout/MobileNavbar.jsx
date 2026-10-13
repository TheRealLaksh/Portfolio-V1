import React, { useEffect, useState } from 'react';
import { FiHome, FiUser, FiBriefcase, FiCpu, FiCode, FiFileText, FiMail, FiDownload, FiPackage } from 'react-icons/fi';
import useScrollSpy from '../../hooks/useScrollSpy';
import { cn } from '../../utils/cn';
import { triggerWarp } from '../../utils/triggerWarp';
import { triggerHaptic } from '../../utils/triggerHaptic';
import { PiHandshake } from 'react-icons/pi';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const MobileNavbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  
  const navIds = ['home', 'about', 'experience', 'skills', 'projects', 'resume', 'services', 'contact'];
  const activeSection = useScrollSpy(navIds);
  
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const isHirePage = location.pathname === '/hire';

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Mobile scroll logic: hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    triggerHaptic();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    }
  };

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
    
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getLinkClass = (id) => cn(
    "relative flex items-center justify-center rounded-full px-3 py-2 text-sm font-medium transition-all duration-300 shrink-0",
    activeSection === id 
      ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.15)] scale-110" 
      : "text-slate-400 active:scale-95"
  );

  return (
    <nav className={cn(
      "md:hidden fixed left-1/2 -translate-x-1/2 z-50 flex flex-nowrap items-center gap-1 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl p-1 shadow-2xl shadow-black/80 transition-all duration-500 max-w-[95vw] overflow-x-auto no-scrollbar",
      "bottom-4 pb-safe",
      !isVisible && "translate-y-[200%] opacity-0"
    )}>
      
      <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className={getLinkClass('home')}>
        <FiHome className="w-4 h-4" />
      </a>

      <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className={getLinkClass('about')}>
        <FiUser className="w-4 h-4" />
      </a>

      <a href="#experience" onClick={(e) => scrollToSection(e, 'experience')} className={getLinkClass('experience')}>
        <FiBriefcase className="w-4 h-4" />
      </a>

      <a href="#skills" onClick={(e) => scrollToSection(e, 'skills')} className={getLinkClass('skills')}>
        <FiCpu className="w-4 h-4" />
      </a>

      <a href="#projects" onClick={(e) => scrollToSection(e, 'projects')} className={getLinkClass('projects')}>
        <FiCode className="w-4 h-4" />
      </a>

      <a href="#resume" onClick={(e) => scrollToSection(e, 'resume')} className={getLinkClass('resume')}>
        <FiFileText className="w-4 h-4" />
      </a>

      <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className={getLinkClass('services')}>
        <FiPackage className="w-4 h-4" />
      </a>

      <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className={getLinkClass('contact')}>
        <FiMail className="w-4 h-4" />
      </a>

      <Link
        to="/hire"
        onClick={triggerHaptic}
        aria-label="Hire me"
        className={cn(
          "relative flex items-center justify-center rounded-full px-3 py-2 text-sm font-medium transition-all duration-300 shrink-0",
          isHirePage
            ? "bg-sky-500/20 text-sky-300 shadow-[0_0_15px_rgba(14,165,233,0.25)] scale-110"
            : "text-sky-400 active:scale-95"
        )}
      >
        <PiHandshake className="w-4 h-4" />
      </Link>

      {deferredPrompt && (
        <button onClick={handleInstallClick} className="relative flex items-center rounded-full px-3 py-2 text-green-400 bg-green-500/10 border border-green-500/30 active:scale-95 transition-all">
          <FiDownload className="w-4 h-4" />
        </button>
      )}

    </nav>
  );
};

export default MobileNavbar;