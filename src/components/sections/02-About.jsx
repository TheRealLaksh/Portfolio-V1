import React, { useState, useEffect } from 'react';
import Tilt from 'react-parallax-tilt';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiMapPin, FiCpu } from 'react-icons/fi';
import profileImg from '../../assets/images/laksh.pradhwani.webp';
import { TextReveal } from '../ui/TextReveal';
import { Parallax } from '../ui/Parallax';
import { triggerHaptic } from '../../utils/triggerHaptic';

// --- SUB-COMPONENT: TERMINAL BIO ---
const TerminalBio = () => {
  const [text, setText] = useState('');
  const fullText = `const laksh = {
  role: "Full Stack Developer",
  passion: "Building Digital Universes",
  arsenal: ["CSS", "HTML", "JS", "React", "Node.js", "Python", "Kali-Linux", "AI/ML"],
  mission: "To engineer the future."
};`;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full rounded-xl bg-[#1e1e1e] border border-slate-700 shadow-2xl overflow-hidden group hover:border-slate-500 transition-colors duration-300">
      <div className="bg-[#2d2d2d] px-4 py-2 flex items-center gap-2 border-b border-slate-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <div className="flex-1 text-center text-[10px] font-mono text-slate-400 opacity-60">
          laksh_bio.js — bash
        </div>
      </div>
      
      <div className="p-4 md:p-6 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto">
        <pre className="text-slate-300 whitespace-pre-wrap break-words">
          <span className="text-pink-400">const</span> <span className="text-sky-400">Laksh</span> <span className="text-white">=</span> <span className="text-yellow-300">{'{'}</span>
          <br />
          {text}
          <span className="animate-pulse w-2 h-4 bg-sky-400 inline-block align-middle ml-1"></span>
          <br />
          <span className="text-yellow-300">{'}'}</span>;
        </pre>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: LOCATION RADAR ---
const LocationRadar = () => {
  return (
    <div className="relative group cursor-crosshair w-full h-full flex flex-col items-center justify-center min-h-[200px]">
      <div className="relative w-32 h-32 flex items-center justify-center mx-auto">
        <div className="absolute inset-0 border border-emerald-500/30 rounded-full animate-[spin_4s_linear_infinite]"></div>
        <div className="absolute inset-2 border border-emerald-500/10 rounded-full border-dashed animate-[spin_10s_linear_infinite_reverse]"></div>
        <div className="absolute w-full h-full rounded-full animate-[spin_2s_linear_infinite]"
             style={{ background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(16, 185, 129, 0.2) 360deg)' }}>
        </div>
        <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399] animate-pulse relative z-10"></div>
        
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap bg-black/80 backdrop-blur-md px-3 py-1 rounded text-xs text-emerald-400 border border-emerald-500/30 shadow-xl">
           <FiMapPin className="inline mr-1" /> Varanasi, India
           <div className="text-[9px] text-slate-500 font-mono mt-0.5">LAT: 25.3176° N | LNG: 82.9739° E</div>
        </div>
      </div>
      <p className="text-center text-[10px] font-mono text-emerald-500/60 mt-4 tracking-widest">SYSTEM ONLINE</p>
    </div>
  );
};

const About = () => {
  return (
    <section id="about" className="my-20 sm:my-32 relative z-10 w-full overflow-hidden">
      
      {/* Background Number - Aligned Left-4 */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <Parallax speed={-0.2} className="absolute top-[10%] left-4 text-slate-800/50 text-6xl font-bold font-mono opacity-20">02</Parallax>
         <Parallax speed={0.1} className="absolute top-[20%] right-[10%] text-sky-900/20 text-8xl font-black opacity-10">{'}'}</Parallax>
      </div>

      <div className="w-full px-6 md:px-12 relative z-10 max-w-[1600px] mx-auto">

        <TextReveal className="mb-20 text-center flex justify-center">
          <h2 className="section-title text-4xl md:text-5xl font-bold text-white relative inline-block">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-500">
              User Profile
            </span>
          </h2>
        </TextReveal>

        <div className="flex flex-col xl:flex-row items-center gap-16">

          {/* LEFT: 1. HOLOGRAPHIC PROFILE CARD */}
          <div className="w-full xl:w-5/12 flex flex-col items-center">
            <Tilt 
                tiltMaxAngleX={8} 
                tiltMaxAngleY={8} 
                perspective={1000} 
                scale={1.02}
                gyroscope={true}
                transitionSpeed={3000} 
                className="relative w-full max-w-[400px] aspect-[4/5] rounded-2xl overflow-hidden group"
                style={{ transformStyle: 'preserve-3d', willChange: 'transform' }} 
            >
                {/* FIX: Optimized Image for Core Web Vitals (CLS Prevention) */}
                <img 
                  src={profileImg} 
                  alt="Laksh Pradhwani - Full Stack Developer"
                  loading="lazy"
                  width="400"
                  height="500"
                  onClick={triggerHaptic}
                  className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700 brightness-75 group-hover:brightness-100"
                />

                {/* Holographic Overlay Effects */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-200"></div>
                
                {/* Scanner Line */}
                <motion.div 
                    className="absolute top-0 left-0 w-full h-[2px] bg-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.8)] z-20 opacity-0 group-hover:opacity-100"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {/* ID Badge Details (Bottom) */}
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                   <div className="flex justify-between items-end border-b border-white/20 pb-4 mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white tracking-wide">LAKSH.P</h3>
                        <p className="text-sky-400 text-xs font-mono tracking-widest mt-1">LVL. 18 DEV</p>
                      </div>
                      <FiCpu className="text-slate-400 text-2xl animate-pulse" />
                   </div>
                   <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-slate-400">
                      <div>
                         <span className="block text-slate-600">CLASS</span>
                         ENGINEER
                      </div>
                      <div className="text-right">
                         <span className="block text-slate-600">STATUS</span>
                         <span className="text-green-400">ONLINE</span>
                      </div>
                   </div>
                </div>
            </Tilt>
          </div>

          {/* RIGHT: CONTENT & WIDGETS */}
          <div className="w-full xl:w-7/12 flex flex-col gap-10">
            
            {/* STACK 1: TERMINAL */}
            <div className="w-full">
                <TerminalBio />
            </div>

            {/* STACK 2: BIO TEXT */}
            <div className="text-slate-300 text-lg leading-relaxed space-y-6 font-light">
                <TextReveal>
                  <p>
                    I’m a freelance <strong className="text-sky-400">full-stack developer</strong> based
                    in Delhi NCR and a B.Tech <strong className="text-white">Data Science &amp; AI</strong> student
                    at Masters’ Union. I moved from a simple “Hello, World!” to building <strong className="text-white">full-stack applications</strong> and real, functional
                    products, and now I build company websites with admin panels, booking and payment
                    flows, and AI features for clients. My work with the <strong className="text-white">MERN stack</strong>,
                    combined with internships at Unified Mentor, MoreYeahs, and Hotel Kavana, has
                    taught me how to turn ideas into practical, scalable digital solutions. At Unified
                    Mentor I shipped four production apps in one internship, including Helios and
                    Calibridge, both live today.
                  </p>
                </TextReveal>
                
                <TextReveal>
                  <p>
                    I’m growing into an <strong className="text-sky-400">AI/ML Engineer</strong>. My interest in <strong className="text-white">artificial intelligence</strong> has
                    grown through programs at IIT Madras, Plaksha University, and Outskill, where I
                    explored neural networks, data science pipelines, automation workflows, and the
                    impact of responsible AI. Along the way, I’ve earned recognition through <strong className="text-white">hackathons</strong>, robotics events, and national-level
                    competitions such as <strong className="text-white">VVM,</strong> strengthening both
                    my technical skills and problem-solving mindset.
                  </p>
                </TextReveal>

                <TextReveal>
                  <p>
                    Outside college and client work, I stay involved in open-source projects,
                    experiment with new technologies, and keep expanding my capabilities. I’m
                    continuously building, learning, and improving, and I take on a few projects at a
                    time so each one gets proper attention. Have a project in mind? See
                    how <Link to="/hire" className="text-sky-400 underline underline-offset-4 hover:text-sky-300">I can help</Link>.
                    I’m also open to meaningful <strong className="text-white">internship opportunities</strong> that
                    push me further.
                  </p>
                </TextReveal>
            </div>

            {/* STACK 3: WIDGET GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 w-full">
                
                {/* Radar Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center backdrop-blur-sm h-full min-h-[250px]">
                   <LocationRadar />
                </div>

                {/* System Stats Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm flex flex-col justify-center gap-4 font-mono text-xs h-full min-h-[250px]">
                   <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-slate-500">SYSTEM CHECK</span>
                      <span className="text-green-400">ALL SYSTEMS GO</span>
                   </div>
                   
                   <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-400">LOGIC</span>
                          <span className="text-sky-400">98%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }} 
                             whileInView={{ width: '98%' }} 
                             transition={{ duration: 1.5, delay: 0.2 }}
                             className="h-full bg-sky-500" 
                           />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-400">CREATIVITY</span>
                          <span className="text-purple-400">94%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }} 
                             whileInView={{ width: '94%' }} 
                             transition={{ duration: 1.5, delay: 0.4 }}
                             className="h-full bg-purple-500" 
                           />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-400">CAFFEINE</span>
                          <span className="text-red-400 animate-pulse">110%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }} 
                             whileInView={{ width: '100%' }} 
                             transition={{ duration: 1.5, delay: 0.6 }}
                             className="h-full bg-red-500" 
                           />
                        </div>
                      </div>
                   </div>

                </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default About;