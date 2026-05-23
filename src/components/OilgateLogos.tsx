import React from 'react';

interface LogoProps {
  className?: string;
  classNameFallback?: string;
  style?: React.CSSProperties;
}

const DropSvg: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => (
  <svg id="oilgate-drop-logo" className={className} style={style} viewBox="0 0 240 360" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Oilgate AI Logo">
    <defs>
      <linearGradient id="g1" x1="65" y1="20" x2="185" y2="335" gradientUnits="userSpaceOnUse"><stop stopColor="#fff0bd"/><stop offset="0.35" stopColor="#c79a3f"/><stop offset="0.72" stopColor="#6e491a"/><stop offset="1" stopColor="#fff0bd"/></linearGradient>
      <linearGradient id="g2" x1="140" y1="50" x2="70" y2="310" gradientUnits="userSpaceOnUse"><stop stopColor="#fff4c8"/><stop offset="0.45" stopColor="#c79a3f"/><stop offset="1" stopColor="#4d3211"/></linearGradient>
      <linearGradient id="b1" x1="0" y1="105" x2="0" y2="290" gradientUnits="userSpaceOnUse"><stop stopColor="#20f7ff"/><stop offset="1" stopColor="#0072ff"/></linearGradient>
      <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <path d="M120 20C120 20 210 132 210 224C210 287 170 332 120 332C70 332 30 287 30 224C30 132 120 20 120 20Z" fill="#03060b" stroke="url(#g1)" strokeWidth="7"/>
    <path d="M119 52C92 119 52 181 52 234C52 273 79 313 119 321C111 307 96 282 96 244C96 190 113 116 119 52Z" fill="url(#g2)"/>
    <path d="M121 92C106 140 77 188 77 237C77 267 95 293 121 301C115 289 108 269 108 244C108 193 118 130 121 92Z" fill="url(#g2)" opacity="0.84"/>
    <g stroke="url(#b1)" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" strokeWidth="4"><path d="M138 118V190L151 204V292"/><path d="M162 147V214L176 229V290"/><path d="M124 195V284"/><path d="M190 189V258"/><path d="M108 226V266"/></g>
    <g filter="url(#glow)" fill="#03060b"><circle cx="138" cy="118" r="10" stroke="#20f7ff" strokeWidth="4"/><circle cx="162" cy="147" r="10" stroke="#20f7ff" strokeWidth="4"/><circle cx="124" cy="195" r="10" stroke="#20f7ff" strokeWidth="4"/><circle cx="190" cy="189" r="10" stroke="#20f7ff" strokeWidth="4"/><circle cx="108" cy="226" r="9" stroke="#20f7ff" strokeWidth="4"/></g>
  </svg>
);

export const OilgateDropLogo: React.FC<LogoProps> = ({ className = '', style }) => (
  <DropSvg className={className} style={style} />
);

export const OilgateFullLogo: React.FC<LogoProps> = ({ className = '', style }) => (
  <div id="oilgate-full-logo" className={className} style={style} aria-label="Oilgate AI Full Logo">
    <div style={{ width: '100%', height: '62%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <DropSvg style={{ width: '54%', height: '100%', filter: 'drop-shadow(0 0 10px rgba(0, 170, 255, 0.45))' }} />
    </div>
    <div style={{ marginTop: '-6px', textAlign: 'center', fontFamily: 'Arial, Helvetica, sans-serif', fontWeight: 800, letterSpacing: '0.28em', color: '#f5f5f5', fontSize: 'clamp(18px, 4.2vw, 32px)', textShadow: '0 0 10px rgba(255,255,255,.18)' }}>
      OILGATE <span style={{ color: '#00b8ff', textShadow: '0 0 10px rgba(0,184,255,.55)' }}>AI</span>
    </div>
    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#c79a3f', fontSize: 'clamp(7px, 1.45vw, 10px)', fontFamily: 'Arial, Helvetica, sans-serif', fontWeight: 700, letterSpacing: '0.22em', whiteSpace: 'nowrap' }}>
      <span style={{ width: '28px', height: '1px', background: '#c79a3f', display: 'inline-block' }} />
      <span>INTELLIGENCE UNLOCKS POTENTIAL</span>
      <span style={{ width: '28px', height: '1px', background: '#c79a3f', display: 'inline-block' }} />
    </div>
  </div>
);
