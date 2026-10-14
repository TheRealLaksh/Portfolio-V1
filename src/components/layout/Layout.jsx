import React, { useState, Suspense } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Preloader from '../ui/Preloader';
import Navbar from './Navbar';
import MobileNavbar from './MobileNavbar';
import SocialSidebar from './SocialSidebar';
import Footer from './Footer';

// LAZY LOAD HEAVY COMPONENTS
const Background = React.lazy(() => import('../3d/Background'));
const ChatWidget = React.lazy(() => import('../chat/ChatWidget'));

// --- LIGHTWEIGHT SPINNER FALLBACK ---
const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-full min-h-[100px] p-4">
    <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin"></div>
  </div>
);

const Layout = ({ children }) => {
  // The preloader is the home page's intro. A visitor who lands on /hire (a client with a
  // question, usually from LinkedIn or WhatsApp) should not wait on it, nor should anyone who
  // asked their device for reduced motion.
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(
    () => pathname === '/' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  return (
    // FIX: Changed overflow-hidden to overflow-x-hidden to prevent vertical scroll locking
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-slate-300">
      <AnimatePresence mode="wait">
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
         <motion.div 
            className="fixed inset-0 z-0"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
         >
            <Suspense fallback={<div className="absolute inset-0 bg-black/90 flex items-center justify-center"><LoadingSpinner /></div>}>
               <Background />
            </Suspense>
         </motion.div>
      )}

      {!loading && (
        <>
          <a
            href="#main-content"
            onClick={(e) => {
              e.preventDefault();
              const main = document.getElementById('main-content');
              main?.focus({ preventScroll: true });
              main?.scrollIntoView({ behavior: 'auto' });
            }}
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-sky-700 focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to content
          </a>

          {/* Render Desktop Navigation */}
          <Navbar />
          
          {/* Render Mobile Navigation */}
          <MobileNavbar />

          <SocialSidebar />
          
          <motion.main 
            id="main-content"
            tabIndex={-1}
            className="relative z-10 flex flex-col items-center w-full outline-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {children}
          </motion.main>

          <Footer />
          
          <Suspense fallback={<div className="fixed bottom-6 right-6 z-50"><LoadingSpinner /></div>}>
            <ChatWidget />
          </Suspense>
        </>
      )}
    </div>
  );
};

export default Layout;