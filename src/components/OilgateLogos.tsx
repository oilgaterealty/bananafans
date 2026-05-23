import React from 'react';

interface LogoProps {
  className?: string;
  classNameFallback?: string;
  style?: React.CSSProperties;
}

export const OilgateDropLogo: React.FC<LogoProps> = ({ className = '', style }) => (
  <img
    id="oilgate-drop-logo"
    src="/assets/oilgate-ai-drop-logo.png"
    alt="Oilgate AI Logo"
    className={className}
    style={style}
    draggable={false}
    onError={(e) => console.warn('[OilgateDropLogo] Failed to load /assets/oilgate-ai-drop-logo.png', e)}
  />
);

export const OilgateFullLogo: React.FC<LogoProps> = ({ className = '', style }) => (
  <img
    id="oilgate-full-logo"
    src="/assets/oilgate-ai-full-logo.png"
    alt="Oilgate AI Full Logo"
    className={className}
    style={style}
    draggable={false}
    onError={(e) => console.warn('[OilgateFullLogo] Failed to load /assets/oilgate-ai-full-logo.png', e)}
  />
);
