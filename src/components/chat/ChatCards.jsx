import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiGithub, FiLinkedin, FiInstagram, FiMail, FiExternalLink, 
  FiCalendar, FiDownload, FiMusic, FiCpu, FiBriefcase, FiStar, FiCheck, FiCopy
} from 'react-icons/fi'; 
import useSpotify from '../../hooks/useSpotify';
import useGitHub from '../../hooks/useGitHub';
import profileImg from '../../assets/images/laksh.pradhwani.webp';
import resumeFile from '../../assets/resume/laksh.pradhwani.resume.pdf';
import { skillsData } from '../../data/skillsData';
import { experienceData } from '../../data/timelineData';

// --- 1. CONTACT CARD (Fixed Email Button) ---
export const ContactCard = () => {
  const [time, setTime] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true };
      const timeString = now.toLocaleTimeString('en-US', options);
      const hours = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false });
      const currentHour = parseInt(hours, 10);
      const online = currentHour >= 9 && currentHour < 23;

      setTime(timeString);
      setIsOnline(online);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('work@lakshpradhwani.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-[280px] bg-slate-900/90 backdrop-blur-xl border border-sky-500/30 rounded-2xl shadow-2xl shadow-sky-500/10 mb-2 overflow-hidden">
      <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-4 pb-8 relative">
        <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 w-max">
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`}></div>
            <span className="text-[10px] font-medium text-white/90 font-mono">
            {time} • {isOnline ? 'Online' : 'Away'}
            </span>
        </div>
      </div>

      <div className="px-5 pb-5 relative z-10 -mt-6">
          <div className="flex justify-between items-end mb-3">
            <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-b from-sky-300 to-blue-600 shadow-lg">
                <img src={profileImg} alt="Profile" loading="lazy" className="w-full h-full rounded-full object-cover border-2 border-slate-900" />
            </div>
            <div className="flex gap-2">
                <a href="https://github.com/TheRealLaksh" target="_blank" rel="noreferrer" className="social-btn text-slate-400 hover:text-white transition-colors"><FiGithub size={16} /></a>
                <a href="https://linkedin.com/in/laksh-pradhwani" target="_blank" rel="noreferrer" className="social-btn text-slate-400 hover:text-blue-400 transition-colors"><FiLinkedin size={16} /></a>
                <a href="https://www.instagram.com/laksh.pradhwani/" target="_blank" rel="noreferrer" className="social-btn text-slate-400 hover:text-pink-400 transition-colors"><FiInstagram size={16} /></a>
            </div>
          </div>

          <h3 className="text-white font-bold text-lg leading-tight">Laksh Pradhwani</h3>
          <p className="text-sky-400/80 text-xs font-medium mb-4">Full Stack Developer</p>

          <div className="space-y-2">
            <button 
              onClick={handleCopyEmail}
              className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 transition-all group active:scale-95"
            >
              <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${copied ? 'bg-green-500/20 text-green-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {copied ? <FiCheck size={12} /> : <FiMail size={12} />}
                  </div>
                  <span className="text-xs font-medium text-slate-200">
                    {copied ? 'Copied to Clipboard!' : 'work@lakshpradhwani.com'}
                  </span>
              </div>
              {!copied && <FiCopy className="text-slate-500 group-hover:text-white transition-colors" size={12} />}
            </button>

            <div className="flex gap-2">
                <a href={resumeFile} download="Laksh_Pradhwani_Resume.pdf" className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl py-2.5 transition-all active:scale-95">
                    <FiDownload size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-300">Resume</span>
                </a>
                <a href="https://calendly.com/laksh-pradhwani/30min/" target="_blank" rel="noopener noreferrer" className="flex-[1.5] flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl py-2.5 shadow-lg shadow-sky-900/20 transition-all active:scale-95">
                    <FiCalendar size={14} />
                    <span className="text-[10px] font-bold">Book a Call</span>
                </a>
            </div>
          </div>
      </div>
    </div>
  );
};

// --- 2. PROJECT SPOTLIGHT CARD ---
export const ProjectCard = () => {
  const { projects, loading, error } = useGitHub();

  if (loading) return (
    <div className="w-[280px] p-4 bg-slate-900/90 rounded-2xl border border-white/10">
      <div className="animate-pulse space-y-3">
        <div className="h-28 bg-slate-800 rounded-lg"></div>
        <div className="h-4 bg-slate-800 rounded w-3/4"></div>
        <div className="h-3 bg-slate-800 rounded w-1/2"></div>
      </div>
    </div>
  );

  if (error || projects.length === 0) return (
    <div className="w-[280px] p-4 bg-slate-900/90 rounded-2xl border border-red-500/30 text-red-400 text-xs">
      Unable to load projects. Check connection.
    </div>
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 max-w-[85vw] md:max-w-[500px] snap-x custom-scrollbar">
      {projects.map((repo) => (
        <div key={repo.id} className="min-w-[280px] snap-center bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col">
           <div className="aspect-video w-full bg-slate-800 rounded-lg mb-3 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
              <div 
                className="w-full h-full opacity-60 transition-transform duration-700 group-hover:scale-110" 
                style={{ 
                    background: `linear-gradient(135deg, hsl(${repo.id % 360}, 60%, 20%), hsl(${(repo.id + 100) % 360}, 60%, 40%))` 
                }}
              ></div>
              <div className="absolute bottom-3 left-3 z-20 flex flex-wrap gap-1">
                 <span className="text-[9px] font-bold text-white bg-white/10 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 uppercase tracking-wide">
                    {repo.genre || 'CODE'}
                 </span>
                 {repo.stars > 0 && (
                   <span className="text-[9px] font-bold text-yellow-300 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded border border-yellow-500/30 flex items-center gap-1">
                      <FiStar size={8} fill="currentColor" /> {repo.stars}
                   </span>
                 )}
              </div>
           </div>

           <h4 className="text-white font-bold mb-1 truncate">{repo.name}</h4>
           <p className="text-xs text-slate-400 mb-4 line-clamp-2 h-8 leading-relaxed">
             {repo.description || "A cool project built with modern tech."}
           </p>

           <div className="flex gap-2 mt-auto">
              <a href={repo.url} target="_blank" rel="noreferrer" className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 rounded-lg text-center text-xs font-medium text-slate-300 transition-colors flex items-center justify-center gap-2 group">
                <FiGithub className="group-hover:text-white" /> Code
              </a>
              {repo.demo && (
                <a href={repo.demo} target="_blank" rel="noreferrer" className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-2.5 rounded-lg text-center text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                  <FiExternalLink /> Live
                </a>
              )}
           </div>
        </div>
      ))}
    </div>
  );
};

// --- 3. EXPERIENCE / ROLE CARD ---
export const ExperienceCard = () => {
  // FIX: Helper to get static classes for themes
  const themeMap = {
    sky: {
      text: "text-sky-500",
      pill: "border-sky-500/30 bg-sky-500/10 text-sky-400",
      company: "text-sky-400"
    },
    purple: {
      text: "text-purple-500",
      pill: "border-purple-500/30 bg-purple-500/10 text-purple-400",
      company: "text-purple-400"
    },
    teal: {
      text: "text-teal-500",
      pill: "border-teal-500/30 bg-teal-500/10 text-teal-400",
      company: "text-teal-400"
    },
    default: {
      text: "text-slate-500",
      pill: "border-slate-500/30 bg-slate-500/10 text-slate-400",
      company: "text-slate-400"
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 max-w-[85vw] md:max-w-[500px] snap-x custom-scrollbar">
      {experienceData.map((item) => {
        const theme = themeMap[item.theme] || themeMap.default;
        
        return (
          <div key={item.id} className="min-w-[280px] snap-center bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col">
              <div className={`absolute top-0 right-0 p-3 opacity-10 ${theme.text}`}><FiBriefcase size={80} /></div>
              
              <div className="relative z-10 flex-1">
                <div className="flex justify-between items-start mb-3">
                    <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center">
                      <img src={item.logo} alt={item.company} className="w-full h-full object-contain" />
                    </div>
                    <span className={`text-[10px] font-mono border px-2 py-1 rounded-full ${theme.pill}`}>
                      {item.date}
                    </span>
                </div>

                <h4 className="text-white font-bold text-lg leading-tight mb-0.5">{item.title}</h4>
                <p className={`${theme.company} text-xs font-medium mb-3`}>{item.company}</p>
                
                <div className="h-[1px] w-full bg-white/10 mb-3"></div>
                
                <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-4">
                    {item.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-auto relative z-10">
                {item.skills.slice(0, 3).map((skill, i) => (
                    <span key={i} className="text-[10px] text-slate-300 bg-slate-800/80 border border-white/5 px-2 py-1 rounded-md">
                      {skill}
                    </span>
                ))}
                {item.skills.length > 3 && (
                    <span className="text-[10px] text-slate-500 px-1 py-1">+ {item.skills.length - 3}</span>
                )}
              </div>
          </div>
        );
      })}
    </div>
  );
};

// --- 4. TECH STACK CARD ---
export const TechStackCard = () => (
  <div className="w-[260px] bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
     <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
        <FiCpu className="text-sky-400" />
        <span className="text-sm font-bold text-white">Core Tech Stack</span>
     </div>
     <div className="grid grid-cols-4 gap-3">
        {skillsData.slice(0, 8).map((skill, idx) => (
           <div key={idx} className="flex flex-col items-center gap-1 group">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl transition-all group-hover:bg-white/10 group-hover:scale-110" style={{ color: skill.color }}>
                 <skill.icon />
              </div>
           </div>
        ))}
     </div>
  </div>
);

// --- 5. NOW PLAYING / VIBE CARD ---
export const VibeCard = () => {
  const { song } = useSpotify();
  
  if (!song || !song.isPlaying) return (
     <div className="w-[240px] bg-slate-900 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 animate-pulse">
           <FiCpu />
        </div>
        <div>
           <p className="text-xs text-slate-400">Not listening to music.</p>
           <p className="text-[10px] text-slate-600">Probably debugging code.</p>
        </div>
     </div>
  );

  return (
    <div className="w-[260px] bg-black/80 backdrop-blur-xl border border-green-500/30 rounded-2xl p-4 relative overflow-hidden group cursor-pointer" onClick={() => window.open(song.url, '_blank')}>
       <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-green-500/20 blur-2xl rounded-full"></div>
       
       <div className="flex items-center gap-3 relative z-10">
          <div className="relative">
             <img src={song.image} alt="Art" className="w-12 h-12 rounded-md shadow-lg animate-[spin_4s_linear_infinite]" />
             <div className="absolute inset-0 bg-black/20 rounded-md flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
             </div>
          </div>
          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-1.5 mb-0.5">
                <FiMusic size={10} className="text-green-400" />
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Now Vibing</span>
             </div>
             <h4 className="text-white text-xs font-bold truncate">{song.name}</h4>
             <p className="text-slate-400 text-[10px] truncate">{song.artist}</p>
          </div>
       </div>
       
       <div className="flex items-end gap-0.5 h-3 mt-3 ml-1">
          {[...Array(12)].map((_, i) => (
             <motion.div 
               key={i}
               className="w-1 bg-green-500/50 rounded-full"
               animate={{ height: ["20%", "100%", "20%"] }}
               transition={{ 
                 duration: 0.8, 
                 repeat: Infinity, 
                 delay: i * 0.05,
                 ease: "easeInOut"
               }}
             />
          ))}
       </div>
    </div>
  );
};