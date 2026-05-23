import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  classNameFallback?: string;
  style?: React.CSSProperties;
}

/**
 * Drop-Only Logo: Golden water drop silhouette with glowing circuit traces.
 * Attempts to load from `/assets/oilgate-ai-drop-logo.png` (with an optional background shadow/glow).
 * Falls back to a high-fidelity inline SVG rendering of the bronze-gold drop & glowing circuit logic
 * if the file is not found.
 */
export const OilgateDropLogo: React.FC<LogoProps> = ({ className = '', style }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <svg
        id="oilgate-drop-svg-fallback"
        className={`shimmer-logo ${className}`}
        style={style}
        viewBox="0 0 200 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gold-grad-outer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eed48f" />
            <stop offset="35%" stopColor="#c5a059" />
            <stop offset="70%" stopColor="#8d6526" />
            <stop offset="100%" stopColor="#eed48f" />
          </linearGradient>

          <linearGradient id="gold-grad-inner" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff3d1" />
            <stop offset="40%" stopColor="#c5a059" />
            <stop offset="100%" stopColor="#5d4117" />
          </linearGradient>

          <linearGradient id="circuit-glow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="100%" stopColor="#0072ff" />
          </linearGradient>

          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d="M100 20 C100 20 185 130 185 205 C185 252.5 147 290 100 290 C53 290 15 252.5 15 205 C15 130 100 20 100 20 Z"
          fill="#060912"
          stroke="url(#gold-grad-outer)"
          strokeWidth="6"
        />

        {/* Outer Left Swooping Crescent filled with gold gradient */}
        <path
          d="M 100 45 C 75 110 38 170 38 215 C 38 245 62 278 100 278 C 96 270 78 244 78 215 C 78 170 94 110 100 45 Z"
          fill="url(#gold-grad-inner)"
        />

        {/* Inner Left Swooping Crescent filled with gold gradient */}
        <path
          d="M 100 80 C 88 120 62 170 62 215 C 62 238 78 259 100 259 C 97 252 86 236 86 215 C 86 170 95 125 100 80 Z"
          fill="url(#gold-grad-inner)"
          opacity="0.85"
          style={{ marginTop: '0px', paddingLeft: '1px' }}
        />

        {/* Glowing Blue Circuits on the Right side */}
        <g stroke="url(#circuit-glow)" strokeLinecap="round" strokeLinejoin="round" filter="url(#neon-glow)" fill="none">
          {/* Central main trace with angled bends */}
          <path d="M 112 125 L 112 180 L 124 195 L 124 265" strokeWidth="3" />
          
          {/* Secondary right-hand trace */}
          <path d="M 134 150 L 134 210 L 146 225 L 146 270" strokeWidth="3" />

          {/* Inner vertical short trace */}
          <path d="M 102 195 L 102 255" strokeWidth="3" />

          {/* Far right vertical short trace */}
          <path d="M 154 185 L 154 245" strokeWidth="3" />

          {/* Bottom left short trace component */}
          <path d="M 90 220 L 90 248" strokeWidth="3" />
        </g>

        {/* Glowing nodes (Circles with dark centers to emulate hollow circuit pads) */}
        <g filter="url(#neon-glow)">
          <circle cx="112" cy="125" r="4.5" stroke="#00f2fe" strokeWidth="2.5" fill="#060912" />
          <circle cx="134" cy="150" r="4.5" stroke="#00f2fe" strokeWidth="2.5" fill="#060912" />
          <circle cx="102" cy="195" r="4.5" stroke="#00f2fe" strokeWidth="2.5" fill="#060912" />
          <circle cx="154" cy="185" r="4.5" stroke="#00f2fe" strokeWidth="2.5" fill="#060912" />
          <circle cx="90" cy="220" r="4" stroke="#00f2fe" strokeWidth="2" fill="#060912" />
        </g>
      </svg>
    );
  }

  return (
    <img
      id="oilgate-drop-logo"
      src="/assets/oilgate-ai-drop-logo.png"
      alt="Oilgate AI Logo"
      className={className}
      style={style}
      referrerPolicy="no-referrer"
      onError={() => {
        console.log('Using beautiful high-fidelity SVG fallback for Oilgate drop-only logo.');
        setError(true);
      }}
    />
  );
};

/**
 * Full Logo: Features a premium dark metallic portal arch surrounding the golden drop logo,
 * with modern elegant typography below.
 * Attempts to load from `/assets/oilgate-ai-full-logo.png`.
 * Falls back to high-fidelity SVG output if file is not found.
 */
export const OilgateFullLogo: React.FC<LogoProps> = ({ className = '', style }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <svg
        id="oilgate-full-svg-fallback"
        className={`w-full max-w-[280px] h-auto ${className}`}
        style={style}
        viewBox="0 0 540 540"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="full-gold-grad-outer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eed48f" />
            <stop offset="35%" stopColor="#c5a059" />
            <stop offset="70%" stopColor="#8d6526" />
            <stop offset="100%" stopColor="#eed48f" />
          </linearGradient>
          <linearGradient id="full-gold-grad-inner" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff3d1" />
            <stop offset="40%" stopColor="#c5a059" />
            <stop offset="100%" stopColor="#5d4117" />
          </linearGradient>
          <linearGradient id="full-circuit-glow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="100%" stopColor="#0072ff" />
          </linearGradient>
          <linearGradient id="metallic-arch" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2c303d" />
            <stop offset="50%" stopColor="#15171d" />
            <stop offset="100%" stopColor="#0d0e12" />
          </linearGradient>
          <filter id="neon-glow-full" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <line x1="130" y1="315" x2="410" y2="315" stroke="#121b2a" strokeWidth="4" />
        <line x1="150" y1="312" x2="390" y2="312" stroke="#223b5d" strokeWidth="1.5" />

        <rect x="155" y="105" width="230" height="205" fill="none" stroke="#202636" strokeWidth="3" rx="2" />
        <path d="M158 108 H382 V310 H345 V145 H195 V310 H158 Z" fill="url(#metallic-arch)" stroke="#1a202d" strokeWidth="2" />
        
        <rect x="156" y="260" width="30" height="5" fill="#c5a059" opacity="0.9" />
        <rect x="354" y="260" width="30" height="5" fill="#c5a059" opacity="0.9" />

        <path d="M192 310 V142 H348 V310" stroke="#00d8ff" strokeWidth="1.5" filter="url(#neon-glow-full)" opacity="0.65" />

        <g transform="translate(193, 142) scale(0.77)">
          <path
            d="M100 20 C100 20 185 130 185 205 C185 252.5 147 290 100 290 C53 290 15 252.5 15 205 C15 130 100 20 100 20 Z"
            fill="#030509"
            stroke="url(#full-gold-grad-outer)"
            strokeWidth="5.5"
          />
          {/* Outer Left Swooping Crescent filled with gold gradient */}
          <path
            d="M 100 45 C 75 110 38 170 38 215 C 38 245 62 278 100 278 C 96 270 78 244 78 215 C 78 170 94 110 100 45 Z"
            fill="url(#full-gold-grad-inner)"
          />

          {/* Inner Left Swooping Crescent filled with gold gradient */}
          <path
            d="M 100 80 C 88 120 62 170 62 215 C 62 238 78 259 100 259 C 97 252 86 236 86 215 C 86 170 95 125 100 80 Z"
            fill="url(#full-gold-grad-inner)"
            opacity="0.85"
          />

          {/* Glowing Blue Circuits on the Right side */}
          <g stroke="url(#full-circuit-glow)" strokeLinecap="round" strokeLinejoin="round" filter="url(#neon-glow-full)" fill="none">
            {/* Central main trace with angled bends */}
            <path d="M 112 125 L 112 180 L 124 195 L 124 265" strokeWidth="3" />
            
            {/* Secondary right-hand trace */}
            <path d="M 134 150 L 134 210 L 146 225 L 146 270" strokeWidth="3" />

            {/* Inner vertical short trace */}
            <path d="M 102 195 L 102 255" strokeWidth="3" />

            {/* Far right vertical short trace */}
            <path d="M 154 185 L 154 245" strokeWidth="3" />

            {/* Bottom left short trace component */}
            <path d="M 90 220 L 90 248" strokeWidth="3" />
          </g>

          {/* Glowing nodes (Circles with dark centers to emulate hollow circuit pads) */}
          <g filter="url(#neon-glow-full)">
            <circle cx="112" cy="125" r="4.5" stroke="#00f2fe" strokeWidth="2.5" fill="#030509" />
            <circle cx="134" cy="150" r="4.5" stroke="#00f2fe" strokeWidth="2.5" fill="#030509" />
            <circle cx="102" cy="195" r="4.5" stroke="#00f2fe" strokeWidth="2.5" fill="#030509" />
            <circle cx="154" cy="185" r="4.5" stroke="#00f2fe" strokeWidth="2.5" fill="#030509" />
            <circle cx="90" cy="220" r="4" stroke="#00f2fe" strokeWidth="2" fill="#030509" />
          </g>
        </g>

        <text
          x="270"
          y="390"
          fontFamily="'Space Grotesk', 'Inter', sans-serif"
          fontWeight="700"
          fontSize="48"
          fill="#FFFFFF"
          textAnchor="middle"
          letterSpacing="12"
        >
          OILGATE<tspan fill="#0072ff"> AI</tspan>
        </text>

        <g transform="translate(0, 425)">
          <line x1="45" y1="-8" x2="135" y2="-8" stroke="#c5a059" strokeWidth="1.5" />
          
          <text
            x="270"
            y="0"
            fontFamily="'Inter', sans-serif"
            fontWeight="500"
            fontSize="14"
            fill="#c5a059"
            textAnchor="middle"
            letterSpacing="4"
          >
            INTELLIGENCE UNLOCKS POTENTIAL
          </text>

          <line x1="405" y1="-8" x2="495" y2="-8" stroke="#c5a059" strokeWidth="1.5" />
        </g>
      </svg>
    );
  }

  return (
    <img
      id="oilgate-full-logo"
      src="/assets/oilgate-ai-full-logo.png"
      alt="Oilgate AI Full Logo"
      className={className}
      style={style}
      referrerPolicy="no-referrer"
      onError={() => {
        console.log('Using beautiful high-fidelity SVG fallback for Oilgate full logo.');
        setError(true);
      }}
    />
  );
};
