import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Play, Video, Eye, ShieldAlert, Cpu, Upload } from 'lucide-react';
import { OilgateDropLogo } from './components/OilgateLogos';
import { IntakeModal } from './components/IntakeModal';
import {
  playCounterHover,
  playCounterIncrement,
  playCtaHover,
  playModalOpen,
  playModalClose,
  playLogoHover,
  playLogoGlitch,
  playLogoRedirect,
  playGaugeScan
} from './utils/audio';

// Starting anchor offset. Modify this to easily change the baseline counter representation!
const CONFIGURABLE_STARTING_NUMBER = -1;

export default function App() {
  const [targetCount, setTargetCount] = useState<number>(CONFIGURABLE_STARTING_NUMBER);
  const [currentCount, setCurrentCount] = useState<number>(CONFIGURABLE_STARTING_NUMBER);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [hasVisited, setHasVisited] = useState<boolean>(false);
  const [isCtaHovered, setIsCtaHovered] = useState<boolean>(false);
  const [eggClickCount, setEggClickCount] = useState<number>(0);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isLogoPulsing, setIsLogoPulsing] = useState<boolean>(false);
  const [videoStatus, setVideoStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [videoSrc, setVideoSrc] = useState<string>('/videos/bananafans-avatar-loop.mp4');

  // Inline video uploader states for smooth drag & drop experience
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadSuccess = () => {
    setVideoStatus('loading');
    setUploadStatus('success');
    // Force video player reload with timestamp cache-buster
    setVideoSrc(`/videos/bananafans-avatar-loop.mp4?t=${Date.now()}`);
    setTimeout(() => {
      setUploadStatus('idle');
    }, 2500);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (videoStatus !== 'loaded') {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (videoStatus === 'loaded') return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await uploadAvatarVideo(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadAvatarVideo(files[0]);
    }
  };

  const uploadAvatarVideo = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.mp4')) {
      setUploadStatus('error');
      setUploadError('Please select a valid MP4 video file (.mp4).');
      return;
    }

    setUploadStatus('uploading');
    setUploadProgress(20);

    try {
      const reader = new FileReader();
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 60) + 20;
          setUploadProgress(percent);
        }
      };

      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const response = await fetch('/api/dev-upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/octet-stream',
            },
            body: arrayBuffer,
          });

          if (response.ok) {
            setUploadProgress(100);
            handleUploadSuccess();
          } else {
            const data = await response.json().catch(() => ({}));
            setUploadStatus('error');
            setUploadError(data.error || 'Server upload failed.');
          }
        } catch (err: any) {
          setUploadStatus('error');
          setUploadError('Network upload failed.');
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      setUploadStatus('error');
      setUploadError('Initialization failed.');
    }
  };



  const handleLogoClick = () => {
    if (eggClickCount === 0) {
      setEggClickCount(1);
      playLogoGlitch();
      if (prefersReducedMotion) {
        setIsLogoPulsing(true);
        setTimeout(() => setIsLogoPulsing(false), 800);
      } else {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 600);
      }
    } else {
      playLogoRedirect();
      setTimeout(() => {
        window.location.href = 'https://oilgateai.com';
      }, 200);
    }
  };

  // Generate randomized temptation level on mount (persists across re-renders in session)
  const [temptationLevel] = useState<number>(() => {
    return Math.floor(Math.random() * (92 - 45 + 1)) + 45;
  });

  // Track user preferences for motion reduction
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
    }

    // Play subtle premium logo scan on load
    const scanTimer = setTimeout(() => {
      playGaugeScan();
    }, 300);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', listener);
      }
      clearTimeout(scanTimer);
    };
  }, []);

  // Premium Tech Spotlight Tracking Listener
  useEffect(() => {
    const updateSpotlight = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
      document.documentElement.style.setProperty('--spotlight-opacity', '1');
    };

    const handleMouseLeave = () => {
      document.documentElement.style.setProperty('--spotlight-opacity', '0');
    };

    window.addEventListener('mousemove', updateSpotlight);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', updateSpotlight);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Live Counter Loading & Increment Strategy
  useEffect(() => {
    // 1. Check persistent localStorage for current count state
    const savedCountStr = localStorage.getItem('bananafans_click_count');
    let actStartingCount = CONFIGURABLE_STARTING_NUMBER;
    
    if (savedCountStr) {
      const parsed = parseInt(savedCountStr, 10);
      // Accept any saved integer (including 0 and negatives) so the counter
      // can progress naturally from the configured baseline upward.
      if (!isNaN(parsed)) {
        actStartingCount = parsed;
      }
    } else {
      localStorage.setItem('bananafans_click_count', String(CONFIGURABLE_STARTING_NUMBER));
    }

    // Set initial display count to the current saved baseline
    setCurrentCount(actStartingCount);
    setTargetCount(actStartingCount);

    // 2. Prevent spam: Increment once per unique session state
    const alreadyIncremented = sessionStorage.getItem('bananafans_incremented');
    
    if (!alreadyIncremented) {
      // NOTE ON FUTURE DATABASE INTEGRATION:
      // When connecting a real production database (e.g. Supabase, Firebase Firestore, or Cloud SQL),
      // replace this local increment of storage with a real asynchronous API call (e.g. POST /api/views).
      // The API should handle database transactions to increment the visit count securely on the backend,
      // and return the authentic live database number as the source of truth to set targetCount.
      
      const delayTimer = setTimeout(() => {
        const finalCount = actStartingCount + 1;
        localStorage.setItem('bananafans_click_count', String(finalCount));
        sessionStorage.setItem('bananafans_incremented', 'true');
        
        setTargetCount(finalCount);
        setHasVisited(true);
      }, 1000); // Deliberate premium 1-second delay after page load before incrementing

      return () => clearTimeout(delayTimer);
    } else {
      setHasVisited(false);
    }
  }, []);

  // Smoothed count up scoreboard logic
  useEffect(() => {
    if (currentCount < targetCount) {
      const timer = setTimeout(() => {
        const diff = targetCount - currentCount;
        // Since we scale by exactly 1 on visitor entrance, this increments perfectly by 1
        const incrementValue = diff > 15 ? Math.floor(Math.random() * 4) + 2 : 1;
        setCurrentCount(prev => Math.min(targetCount, prev + incrementValue));
        playCounterIncrement();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [currentCount, targetCount]);

  return (
    <div className="relative min-h-[100dvh] flex flex-col justify-between overflow-hidden bg-oilgate-dark">
      <motion.div
        className="relative min-h-[100dvh] flex flex-col justify-between w-full h-full"
        animate={isShaking && !prefersReducedMotion ? {
          x: [0, -6, 6, -5, 5, -3, 3, -1, 1, 0],
          y: [0, 2, -2, 1, -1, 1, -1, 0],
          filter: [
            "hue-rotate(0deg) saturate(100%) brightness(1.0)",
            "hue-rotate(6deg) saturate(115%) brightness(1.15)",
            "hue-rotate(-4deg) saturate(105%) brightness(0.95)",
            "hue-rotate(3deg) saturate(110%) brightness(1.08)",
            "hue-rotate(0deg) saturate(100%) brightness(1.0)"
          ],
        } : {}}
        transition={{ duration: 0.55, ease: "linear" }}
      >
      
      {/* Dynamic Cursor Spotlight Overlay */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 opacity-[var(--spotlight-opacity,0)]"
        style={{
          background: `radial-gradient(550px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(0, 114, 255, 0.08) 0%, rgba(0, 242, 254, 0.02) 45%, transparent 80%)`
        } as React.CSSProperties}
      />

      {/* Visual background highlights & accent dust */}
      <div className="absolute top-[-10%] left-[10%] w-[35rem] h-[35rem] rounded-full bg-oilgate-blue/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[-10%] w-[45rem] h-[45rem] rounded-full bg-gradient-to-tr from-oilgate-cyan/5 to-oilgate-blue/5 blur-[150px] pointer-events-none" />

      {/* Grid Overlay Line decoration for depth */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0b1528_1px,transparent_1px),linear-gradient(to_bottom,#0b1528_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.4] pointer-events-none" />

      {/* Top Banner Mystery Text */}
      <header className="w-full py-4 px-6 z-10 border-b border-white/[0.02] flex items-center justify-center">
        <div className="flex items-center justify-center space-x-1.5 font-mono text-[10px] uppercase tracking-widest text-gray-500">
          <Eye className="w-3 h-3 text-oilgate-blue animate-pulse" />
          <span>PRIVATE LINK OPENED</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block ml-1 animate-ping" />
        </div>
      </header>

      {/* MAIN STAGE CONTAINER (Centered vertically/horizontally on desktop, stacked on mobile) */}
      <main className="flex-grow flex flex-col justify-center items-center px-4 md:px-8 py-8 md:py-12 z-10 w-full max-w-6xl mx-auto">
        <div className="w-full flex flex-col items-center justify-center space-y-8 md:space-y-12">
          
          {/* Headline (Fades in elegantly with cinematic reveal) */}
          <div className="text-center max-w-2xl px-2">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 0.8 }}
              className="font-mono text-[11px] tracking-[0.25em] text-oilgate-gold uppercase font-bold block mb-3"
            >
              UNVERIFIED MOTIVES DETECTED
            </motion.span>
            <h1
              id="main-headline"
              className="font-display font-medium text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight text-white leading-tight lowercase animate-cinematic-headline"
              style={{ opacity: 0 }}
            >
              gauging how many people want to see me naked 🤔
            </h1>
          </div>

          {/* Core Dashboard Grid (Avatar on left, scoreboard on right on desktop) */}
          <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 xl:gap-14">
            
            {/* LEFT SIDE: Avatar looping placeholder */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="w-full max-w-[260px] xs:max-w-[290px] sm:max-w-[320px] lg:max-w-[340px]"
            >
              <div 
                className={`relative group rounded-3xl overflow-hidden border p-2.5 shadow-2xl transition-all duration-500 ${
                  isDragging 
                    ? 'border-emerald-500 bg-emerald-950/10 scale-[1.02]' 
                    : 'border-oilgate-border bg-[#070b13] hover:border-zinc-800'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                  if (videoStatus !== 'loaded' && uploadStatus !== 'uploading') {
                    fileInputRef.current?.click();
                  }
                }}
                style={{ cursor: videoStatus !== 'loaded' ? 'pointer' : 'default' }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="video/mp4"
                  className="hidden"
                />

                {/* Visual Camera lens outline overlay (Only show when loading) */}
                {videoStatus !== 'loaded' && (
                  <div className="absolute top-5 right-5 z-20 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider font-bold text-gray-300 border border-white/5 uppercase select-none">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                    <span>AUTOPLAY</span>
                  </div>
                )}

                <div className="relative aspect-[9/16] rounded-[18px] overflow-hidden bg-[#070b13] border border-white/[0.02] flex flex-col items-center justify-center text-center">
                  
                  {/* Loop video container */}
                  {/* Note: This is pointed to /videos/bananafans-avatar-loop.mp4 as requested */}
                  <video
                    id="avatar-loop-video"
                    src={videoSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-300 ${videoStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                    onCanPlay={() => setVideoStatus('loaded')}
                    onError={() => setVideoStatus('error')}
                  />

                  {/* Fallback graphical UI for development or missing video asset (Only show when NOT loaded) */}
                  {videoStatus !== 'loaded' && (
                    <div className="absolute inset-0 z-10 flex flex-col justify-between p-5 font-mono select-none pointer-events-none">
                      
                      {/* Top alignment lines */}
                      <div className="flex justify-between items-start text-[9px] text-gray-500">
                        <span>CH: 01_AVATAR</span>
                        <span>{videoStatus === 'loaded' ? 'MP4_PLAYBACK' : '60 FPS'}</span>
                      </div>

                      {/* Highly polished audio-wave style radar graphic */}
                      <div className="flex flex-col items-center justify-center space-y-4 my-auto">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          {/* Interactive sonar waves */}
                          <div className="absolute inset-0 rounded-full border-2 border-dashed border-oilgate-blue/30 animate-spin" style={{ animationDuration: '40s' }} />
                          <div className="absolute inset-2 rounded-full border border-oilgate-blue/20 animate-ping" style={{ animationDuration: '3s' }} />
                          <div className="absolute inset-4 rounded-full border border-white/5 bg-oilgate-dark/95 flex items-center justify-center" />
                          <Video className="absolute w-8 h-8 text-oilgate-blue/80 animate-pulse" />
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-[10px] text-oilgate-gold uppercase tracking-widest font-bold block">
                            AVATAR LOOP PLACEHOLDER
                          </span>
                          <span className="text-[9px] text-gray-500 block max-w-[180px] bg-black/40 px-2 py-1 rounded border border-white/[0.02]">
                            drag & drop your .mp4 here
                          </span>
                        </div>
                      </div>

                      {/* Bottom alignment details */}
                      <div className="flex justify-between items-end text-[8px] text-gray-600">
                        <span>REC STATUS: {videoStatus === 'loaded' ? 'PLAYING' : 'ARMED'}</span>
                        <span className="flex items-center">
                          <span className={`w-1.5 h-1.5 rounded-full mr-1 ${videoStatus === 'loaded' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                          {videoStatus === 'loaded' ? 'ACTIVE LOOP' : 'CLICK TO UPLOAD'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Inline dragover layer */}
                  {isDragging && (
                    <div className="absolute inset-0 z-30 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-3 font-mono text-center pointer-events-none border-2 border-dashed border-emerald-500 rounded-lg animate-pulse">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                        <Upload className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] text-emerald-400 uppercase tracking-widest font-bold block">
                          DROP FILE HERE
                        </span>
                        <span className="text-[9px] text-zinc-400 block px-2 leading-relaxed">
                          to replace avatar video loop
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Inline uploading layer */}
                  {uploadStatus === 'uploading' && (
                    <div className="absolute inset-0 z-35 bg-[#070b13]/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-4 font-mono text-center">
                      <div className="relative w-14 h-14 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-t-emerald-500 animate-spin" />
                        <Video className="w-5 h-5 text-emerald-400 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-white uppercase tracking-wider font-bold block">
                          UPLOADING VIDEO
                        </span>
                        <span className="text-[9px] text-gray-400 block">
                          Saving to workspace ({uploadProgress}%)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Inline error layer */}
                  {uploadStatus === 'error' && (
                    <div className="absolute inset-0 z-35 bg-[#070b13]/98 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-4 font-mono text-center">
                      <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                        <span className="text-rose-500 text-sm font-bold">!</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-rose-400 uppercase tracking-wider font-bold block">
                          UPLOAD FAILED
                        </span>
                        <p className="text-[9px] text-zinc-400 max-w-[190px] leading-relaxed mx-auto">
                          {uploadError}
                        </p>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playModalClose();
                          setUploadStatus('idle');
                        }}
                        className="text-[9px] px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all cursor-pointer"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* RIGHT SIDE / CENTER: SCOREBOARD LIVE COUNTER */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="w-full max-w-[340px] xs:max-w-[380px] sm:max-w-[420px] flex flex-col items-center gap-6"
            >
              {/* Huge Live Scoreboard wrap with pulsing animation */}
              <div 
                onMouseEnter={playCounterHover}
                className="relative w-full rounded-3xl p-6 sm:p-8 bg-[#090e1a]/85 border border-oilgate-border pulse-border-glow select-none text-center"
              >
                
                {/* Scoreboard gloss reflection shine */}
                <div className="absolute inset-0 rounded-3xl bg-linear-gradient(to_bottom_right,white/5,transparent_60%) pointer-events-none" />

                {/* Grid backdrop */}
                <div className="absolute inset-0 bg-radial-gradient(ellipse_60%_60%_at_50%_40%,rgba(0,114,255,0.06),transparent) pointer-events-none" strokeWidth="2.5" />

                <div className="relative space-y-4">
                  {/* Status header */}
                  <div className="flex items-center justify-center space-x-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="font-mono text-xs text-emerald-400 tracking-wider uppercase font-bold">
                      BANANAFANS LINK ACTIVITY
                    </span>
                  </div>

                  {/* The Counter Container (Scoreboard styled box) */}
                  <div className="border border-white/5 bg-[#04060b] rounded-2xl px-4 py-8 shadow-inner shadow-black relative overflow-hidden">
                    
                    {/* Scoreboard segmented glass columns */}
                    <div className="absolute inset-y-0 left-1/4 w-[1px] bg-white/[0.01]" />
                    <div className="absolute inset-y-0 left-2/4 w-[1px] bg-white/[0.01]" />
                    <div className="absolute inset-y-0 left-3/4 w-[1px] bg-white/[0.01]" />

                    {/* Counter print */}
                    <span
                      id="live-telemetry-counter"
                      className="font-mono font-bold text-5xl xs:text-6xl sm:text-7xl tracking-tighter text-white glow-blue select-text block"
                    >
                      {currentCount.toLocaleString()}
                    </span>

                    {/* Unique session notifier pop */}
                    <AnimatePresence>
                      {hasVisited && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute bottom-2 left-0 right-0 mx-auto text-center"
                        >
                          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded">
                            +1 Unique Link Visit Logged
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Subtitle metric */}
                  <div className="pt-3 space-y-2.5">
                    <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block">
                      CURRENT TEMPTATION LEVEL
                    </span>
                    <div className="relative w-full max-w-[220px] h-3 bg-zinc-950/95 rounded-full border border-white/[0.08] mx-auto overflow-hidden p-[1.5px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.95),0_0_12px_rgba(0,114,255,0.04)]">
                      {/* Full-width elegant backdrop showing a dimmer, softer, darker variation of the same color progression */}
                      <div className="absolute inset-[1px] bg-gradient-to-r from-emerald-950/60 via-amber-950/65 to-rose-950/70 rounded-full pointer-events-none" />
                      
                      {/* Premium subtle tick indicators representing full-scale capacity pathway */}
                      <div className="absolute inset-x-0 inset-y-[1px] flex justify-between px-6 pointer-events-none opacity-[0.12] z-10">
                        <span className="w-[1.5px] h-full bg-white" />
                        <span className="w-[1.5px] h-full bg-white" />
                        <span className="w-[1.5px] h-full bg-white" />
                      </div>

                      {/* Gradient temperature track representing progression from safe (green) through caution (orange) to risky (red) */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${temptationLevel}%` }}
                        transition={
                          prefersReducedMotion
                            ? { duration: 0 }
                            : { duration: 2.2, ease: [0.19, 1, 0.22, 1] }
                        }
                        className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-amber-500 to-rose-600 shadow-[0_0_10px_rgba(224,49,88,0.25)] relative z-20"
                      >
                        {/* Leading edge premium beam overlays */}
                        <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-transparent to-white/75 rounded-r-full blur-[0.8px]" />
                        <div className="absolute right-[1px] top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full blur-[1.5px] opacity-95 shadow-[0_0_6px_white]" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION TRIGGER CTA BUTTON: Positioned in the column exactly under the scoreboard card */}
              <div className="flex justify-center w-full">
                <motion.button
                  id="start-build-cta"
                  onMouseEnter={() => {
                    setIsCtaHovered(true);
                    playCtaHover();
                  }}
                  onMouseLeave={() => setIsCtaHovered(false)}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ y: 1, scale: 0.97 }}
                  onClick={() => {
                    playModalOpen();
                    setIsModalOpen(true);
                  }}
                  className="relative overflow-hidden bg-gradient-to-r from-oilgate-blue to-oilgate-cyan text-white font-semibold font-display tracking-widest uppercase transition-all duration-300 px-8 py-4 rounded-xl shadow-lg shadow-glow-blue-hover hover:shadow-[0_0_25px_rgba(0,114,255,0.45)] text-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {/* Shimmer element */}
                  <motion.span
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-[25deg] pointer-events-none"
                    initial={{ left: '-100%' }}
                    animate={isCtaHovered ? { left: '150%' } : { left: '-100%' }}
                    transition={{ duration: 0.75, ease: "easeOut" }}
                  />
                  <Sparkles className="w-4 h-4 text-oilgate-gold z-10 relative" />
                  <span className="z-10 relative">Start My Oilgate AI Build</span>
                </motion.button>
              </div>
            </motion.div>
          </div>

        </div>
      </main>

      </motion.div>

      {/* Floating Brand Logo intentionally positioned in the left bottom corner */}
      <div className="fixed bottom-6 left-6 sm:bottom-8 sm:left-8 md:bottom-10 md:left-10 z-40">
        <motion.button
          type="button"
          onClick={handleLogoClick}
          onMouseEnter={playLogoHover}
          whileHover={{ 
            y: -2, 
            scale: 1.05,
            filter: "drop-shadow(0 0 15px rgba(0, 114, 255, 0.4))"
          }}
          whileTap={{ scale: 0.95 }}
          animate={isLogoPulsing ? {
            scale: [1, 1.15, 0.95, 1.05, 1],
            filter: [
              "drop-shadow(0 0 10px rgba(0, 114, 255, 0.2))",
              "drop-shadow(0 0 20px rgba(0, 114, 255, 0.6))",
              "drop-shadow(0 0 10px rgba(0, 114, 255, 0.2))"
            ]
          } : {}}
          transition={isLogoPulsing ? { duration: 0.8 } : { duration: 0.2 }}
          className="focus:outline-none cursor-pointer bg-transparent border-none p-0 flex items-center justify-center outline-none select-none"
          title="Go to Oilgate AI"
        >
          <OilgateDropLogo 
            className="h-10 sm:h-12 md:h-14 w-auto drop-shadow-[0_0_10px_rgba(0,114,255,0.2)]" 
          />
        </motion.button>
      </div>

      {/* intake form modal */}
      <IntakeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
