import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMessageSquare, FiX, FiSend, FiBriefcase,
  FiFileText, FiMail, FiMinimize2, FiMaximize2, FiPackage
} from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import useSectionNav from '../../hooks/useSectionNav';
import { triggerHaptic } from '../../utils/triggerHaptic';
import resumeFile from '../../assets/resume/laksh.pradhwani.resume.pdf';

// Imports from split files
import { useChat } from '../../hooks/useChat';
import { TypingWave, ActionChip, ChatBubble } from './ChatUI';

const BootScreen = ({ onComplete }) => {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const logs = [
      "> INITIALIZING NEURAL UPLINK...",
      "> CONNECTING TO LAKSH_CORE...",
      "> SECURITY HANDSHAKE::VERIFIED",
      "> ESTABLISHING SECURE CHANNEL..."
    ];
    let index = 0;
    const interval = setInterval(() => {
      if (index < logs.length) {
        setLines(prev => [...prev, logs[index]]);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 350);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="flex-1 flex flex-col justify-center items-start p-8 font-mono text-xs leading-7 text-sky-400 z-10">
      {lines.map((line, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <span className="text-sky-600 mr-2">➜</span>{line}
        </motion.div>
      ))}
      <div className="w-2 h-4 bg-sky-400/80 mt-2 animate-pulse" />
    </div>
  );
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [hasBooted, setHasBooted] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const goToSection = useSectionNav();
  const { pathname } = useLocation();

  // The Services chip means "show me what you offer": on /hire that is the packages on this page,
  // anywhere else it is the Services section on the home page.
  const showServices = () => {
    const packages = pathname === '/hire' ? document.getElementById('packages') : null;
    if (packages) packages.scrollIntoView({ behavior: 'smooth' });
    else goToSection('services', { native: true });
  };

  // Custom Hook Logic
  const { chatMessages, isLoading, sendMessage, clearChat, addMessage } = useChat();
  const messagesEndRef = useRef(null);

  // --- EVENT LISTENERS & EFFECTS ---
  // The "Ask AI Laksh!" teaser appears once per visit and goes away by itself. On a phone it sits
  // over the page content, so it must not stay there (it used to cover buttons and headings).
  useEffect(() => {
    let alreadySeen = false;
    try { alreadySeen = sessionStorage.getItem('chat-teaser-seen') === '1'; } catch { /* storage blocked */ }
    if (alreadySeen) return undefined;

    const show = setTimeout(() => {
      setShowNotification(true);
      try { sessionStorage.setItem('chat-teaser-seen', '1'); } catch { /* storage blocked */ }
    }, 3000);
    const hide = setTimeout(() => setShowNotification(false), 12000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  useEffect(() => {
    if (isOpen) setShowNotification(false);
  }, [isOpen]);

  // Mobile Dock Toggle Listener
  useEffect(() => {
    const handleToggle = () => { triggerHaptic(); setIsOpen(prev => !prev); };
    window.addEventListener('toggle-chat', handleToggle);
    return () => window.removeEventListener('toggle-chat', handleToggle);
  }, []);

  // Boot Sequence Trigger
  useEffect(() => {
    if (isOpen && !hasBooted) setIsBooting(true);
  }, [isOpen, hasBooted]);

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isLoading, isOpen, isExpanded]);

  // --- NEW: Handle Redirects for Services ---
  useEffect(() => {
    const lastMsg = chatMessages[chatMessages.length - 1];

    if (lastMsg?.type === 'services') {
      // Small delay to let user read the "Navigating..." message
      setTimeout(() => {
        setIsOpen(false);
        showServices();
        triggerHaptic();
      }, 1200);
    }
  }, [chatMessages]);

  // --- HANDLERS ---
  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action) => {
    if (action === 'projects') {
      setIsOpen(false);
      goToSection('projects', { native: true });
    }
    if (action === 'services') {
      setIsOpen(false);
      showServices();
    }
    if (action === 'resume') {

      window.open(resumeFile, '_blank', 'noopener,noreferrer');
    }
    if (action === 'contact') {
      addMessage({ sender: 'You', content: 'Show me contacts', type: 'text' });
      setTimeout(() => {
        triggerHaptic();
        addMessage({ sender: 'AI Laksh', type: 'contact' });
      }, 600);
    }
  };

  return (
    <>
      {/* 1. NOTIFICATION BUBBLE */}
      <AnimatePresence>
        {showNotification && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
                // Mobile: Top Right, Small
                "fixed z-50 top-[60px] right-3 w-[200px]",
                // Desktop: Bottom Right, Normal
                "md:bottom-[85px] md:right-6 md:top-auto md:w-auto md:max-w-[280px]"
            )}
          >
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className={cn(
                "block w-full text-left relative bg-slate-900/90 backdrop-blur-xl text-white rounded-2xl border border-sky-500/30 shadow-[0_0_30px_-10px_rgba(14,165,233,0.4)]",
                "p-3 md:px-6 md:py-4" // Smaller padding on mobile
              )}
            >
              <span className="flex items-center gap-2 mb-1">
                <span className="flex h-2.5 w-2.5 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span></span>
                <span className="font-bold text-sm md:text-base">Ask AI Laksh!</span>
              </span>
              <span className="block text-xs md:text-sm text-slate-300">Curious about my work? I can answer questions instantly.</span>
            </button>
            <button onClick={() => setShowNotification(false)} aria-label="Dismiss" className="absolute -top-2 -left-2 bg-slate-800 rounded-full p-1 border border-white/10"><FiX size={12} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />

            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={cn(
                "fixed z-50 flex flex-col overflow-hidden shadow-2xl border border-white/10 bg-[#0a0a0b]/95 backdrop-blur-xl origin-bottom-right transition-all duration-300",
                "bottom-0 left-0 right-0 w-full h-[85dvh] rounded-t-3xl",
                "md:bottom-[80px] md:right-6 md:left-auto md:max-w-[calc(100vw-3rem)] md:rounded-3xl",
                isExpanded ? "md:w-[600px] md:h-[700px]" : "md:w-[380px] md:h-[550px]"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5 z-20">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span></span>
                    AI Laksh
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium ml-4 tracking-wider">Online and Ready - v2.0.4</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsExpanded(!isExpanded)} aria-label={isExpanded ? 'Shrink chat' : 'Expand chat'} className="text-slate-400 hover:text-white p-2 hidden md:block">{isExpanded ? <FiMinimize2 /> : <FiMaximize2 />}</button>
                  <button onClick={clearChat} className="text-[10px] text-slate-400 border border-white/10 px-3 py-1 rounded-full hover:bg-white/5">Reset</button>
                  <button onClick={() => setIsOpen(false)} aria-label="Close chat" className="md:hidden text-slate-400 p-2"><FiX size={20} /></button>
                </div>
              </div>

              {/* Body */}
              <div className="relative flex-1 flex flex-col overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

                {isBooting ? (
                  <BootScreen onComplete={() => { setIsBooting(false); setHasBooted(true); }} />
                ) : (
                  <>
                    <div
                      className="flex-1 overflow-y-auto min-h-0 px-5 py-5 space-y-5 custom-scrollbar z-10 overscroll-contain"
                      data-lenis-prevent="true"
                    >
                      {chatMessages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6">
                          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5"><FiMessageSquare size={24} className="text-sky-500/80" /></div>
                          <p className="text-base font-medium text-white mb-2">System Ready</p>
                          <p className="text-xs text-slate-400 mb-8 max-w-[200px]">Ask anything about Laksh's tech stack, projects, or experience.</p>

                          <div className="flex flex-wrap justify-center gap-3">
                            <ActionChip icon={FiBriefcase} label="View Projects" onClick={() => handleQuickAction('projects')} />
                            <ActionChip icon={FiPackage} label="Services" onClick={() => handleQuickAction('services')} /> {/* NEW Services Chip */}
                            <ActionChip icon={FiMail} label="Contacts" onClick={() => handleQuickAction('contact')} />
                            <ActionChip icon={FiFileText} label="Resume" onClick={() => handleQuickAction('resume')} />
                          </div>
                        </div>
                      )}

                      {chatMessages.map((msg, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <ChatBubble msg={msg} />
                        </motion.div>
                      ))}

                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-slate-800/80 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3"><TypingWave /></div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-gradient-to-t from-black/80 to-transparent pb-8 md:pb-4 z-20">
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-purple-500 rounded-full opacity-0 group-focus-within:opacity-20 transition duration-500 blur-md"></div>
                        <input
                          type="text"
                          className="relative w-full rounded-full border border-white/10 bg-slate-900/90 pl-5 pr-12 py-3.5 text-sm text-white outline-none focus:border-sky-500/50 transition-all placeholder:text-slate-500 shadow-inner"
                          aria-label="Message to AI Laksh" placeholder="Ask AI anything..."
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                        />
                        <button onClick={handleSend} aria-label="Send message" disabled={isLoading || !inputValue.trim()} className="absolute right-2 top-2 p-2 bg-sky-600 hover:bg-sky-500 rounded-full text-white transition-all disabled:opacity-0 disabled:scale-75 shadow-lg active:scale-90"><FiSend size={14} /></button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <button 
        onClick={() => { triggerHaptic(); setIsOpen(!isOpen); }} 
        aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
        aria-expanded={isOpen}
        className={cn(
            "fixed z-[60] group flex items-center justify-center transition-all duration-500 ease-out rounded-full",
            // Mobile Styles: Top Right, Small, no text expansion
            "top-3 right-3 w-10 h-10 bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-lg",
            // Desktop Styles: Bottom Right, Large, text expansion on hover
            "md:bottom-6 md:right-6 md:top-auto md:w-12 md:hover:w-36 md:h-12 md:justify-end md:bg-transparent md:border-transparent md:hover:bg-slate-900 md:hover:border-slate-700 md:hover:shadow-2xl hover:shadow-sky-900/20 active:scale-95"
        )}
      >
        {/* Hover Effect Background (Desktop only) */}
        <div className="hidden md:block absolute inset-0 w-full h-full bg-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Text Label (Desktop only) */}
        <span className="hidden md:block absolute right-14 opacity-0 group-hover:opacity-100 text-sky-400 font-medium text-sm whitespace-nowrap transition-all duration-500 delay-75">AI Assistant</span>
        
        {/* Icon */}
        <div className={cn(
            "relative flex items-center justify-center shrink-0 z-10 transition-colors duration-300",
            isOpen ? 'text-white' : 'text-sky-400 md:text-slate-400 md:group-hover:text-sky-400',
            // Sizing for mobile vs desktop
            "w-10 h-10 md:w-12 md:h-12"
        )}>
          {isOpen ? <FiX size={20} className="md:w-6 md:h-6" /> : <FiMessageSquare size={20} className="md:w-6 md:h-6" />}
        </div>
      </button>
    </>
  );
};

export default ChatWidget;