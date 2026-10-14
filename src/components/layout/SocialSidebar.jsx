import React from 'react';

const SocialSidebar = () => {
  return (
    <aside aria-label="Social links" className="fixed bottom-10 left-8 z-50 hidden xl:flex flex-col items-start gap-3">

      {/* GitHub */}
      <a href="https://github.com/TheRealLaksh" target="_blank" rel="noopener noreferrer" aria-label="GitHub"
        className="group relative flex items-center justify-start w-10 hover:w-32 h-10 rounded-full overflow-hidden transition-all duration-500 ease-out bg-transparent border border-transparent hover:bg-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-green-900/20">
        <div
          className="absolute inset-0 w-full h-full bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        </div>
        <div
          className="w-10 h-10 flex items-center justify-center shrink-0 z-10 text-slate-400 group-hover:text-green-400 transition-colors duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2.1c-3.2.7-3.9-1.5-3.9-1.5-.5-1.2-1.1-1.6-1.1-1.6-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.5 1.1 3.1.8.1-.7.4-1.1.7-1.4-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.1-3.3-.1-.3-.5-1.5.1-3.1 0 0 .9-.3 3.4 1.2a11.5 11.5 0 0 1 6.2 0c2.5-1.5 3.4-1.2 3.4-1.2.6 1.6.2 2.8.1 3.1.7.9 1.1 2 1.1 3.3 0 4.6-2.8 5.6-5.5 5.9.4.3.8 1 .8 2v3c0 .4.2.7.8.6 4.6-1.5 7.9-5.9 7.9-10.9C23.5 5.65 18.35.5 12 .5z" />
          </svg>
        </div>
        <span
          className="opacity-0 group-hover:opacity-100 text-green-400 font-medium text-sm whitespace-nowrap transition-all duration-500 delay-100 absolute left-10 pl-1">
          GitHub
        </span>
      </a>

      {/* LinkedIn */}
      <a href="https://www.linkedin.com/in/laksh-pradhwani" target="_blank" rel="noopener noreferrer"
        aria-label="LinkedIn"
        className="group relative flex items-center justify-start w-10 hover:w-32 h-10 rounded-full overflow-hidden transition-all duration-500 ease-out bg-transparent border border-transparent hover:bg-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-blue-900/20">
        <div
          className="absolute inset-0 w-full h-full bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        </div>
        <div
          className="w-10 h-10 flex items-center justify-center shrink-0 z-10 text-slate-400 group-hover:text-blue-400 transition-colors duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect x="2" y="9" width="4" height="12"></rect>
            <circle cx="4" cy="4" r="2"></circle>
          </svg>
        </div>
        <span
          className="opacity-0 group-hover:opacity-100 text-blue-400 font-medium text-sm whitespace-nowrap transition-all duration-500 delay-100 absolute left-10 pl-1">
          LinkedIn
        </span>
      </a>

      {/* Instagram */}
      <a href="https://www.instagram.com/laksh.pradhwani/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
        className="group relative flex items-center justify-start w-10 hover:w-32 h-10 rounded-full overflow-hidden transition-all duration-500 ease-out bg-transparent border border-transparent hover:bg-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-pink-900/20">
        <div
          className="absolute inset-0 w-full h-full bg-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        </div>
        <div
          className="w-10 h-10 flex items-center justify-center shrink-0 z-10 text-slate-400 group-hover:text-pink-400 transition-colors duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        </div>
        <span
          className="opacity-0 group-hover:opacity-100 text-pink-400 font-medium text-sm whitespace-nowrap transition-all duration-500 delay-100 absolute left-10 pl-1">
          Instagram
        </span>
      </a>

      {/* Email */}
      <a href="mailto:work@lakshpradhwani.com" aria-label="Email"
        className="group relative flex items-center justify-start w-10 hover:w-28 h-10 rounded-full overflow-hidden transition-all duration-500 ease-out bg-transparent border border-transparent hover:bg-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-rose-900/20">
        <div
          className="absolute inset-0 w-full h-full bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        </div>
        <div
          className="w-10 h-10 flex items-center justify-center shrink-0 z-10 text-slate-400 group-hover:text-rose-400 transition-colors duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </div>
        <span
          className="opacity-0 group-hover:opacity-100 text-rose-400 font-medium text-sm whitespace-nowrap transition-all duration-500 delay-100 absolute left-10 pl-1">
          Email
        </span>
      </a>

    </aside>
  );
};

export default SocialSidebar;