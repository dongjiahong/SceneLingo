import React from 'react';

interface LogoProps {
  className?: string;
  inverted?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", inverted = false }) => {
  // Indigo-600 for primary, White for inverted
  const fill = inverted ? "white" : "#4F46E5"; 
  const stroke = inverted ? "#4F46E5" : "white";

  return (
    <svg 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      aria-label="SceneLingo Logo"
    >
      <defs>
        <linearGradient id="logo_gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" /> {/* Indigo 500 */}
          <stop offset="100%" stopColor="#4338ca" /> {/* Indigo 700 */}
        </linearGradient>
      </defs>
      
      {/* Main Shape: Camera body merging into a speech bubble */}
      <path 
        d="M4 10C4 6.68629 6.68629 4 10 4H22C25.3137 4 28 6.68629 28 10V20C28 23.3137 25.3137 26 22 26H10C9.2 26 8 26.5 6 28.5V24C4.89543 24 4 23.1046 4 22V10Z" 
        fill={inverted ? "white" : "url(#logo_gradient)"} 
      />
      
      {/* Lens Ring */}
      <circle 
        cx="16" 
        cy="15" 
        r="5.5" 
        stroke={stroke} 
        strokeWidth="2.5" 
        strokeOpacity={inverted ? "1" : "0.9"}
      />
      
      {/* Inner Lens / Aperture */}
      <circle 
        cx="16" 
        cy="15" 
        r="2" 
        fill={stroke} 
      />

      {/* AI Sparkle / Flash element (Top Right) */}
      <path 
        d="M23 8L23.5 9.5L25 10L23.5 10.5L23 12L22.5 10.5L21 10L22.5 9.5L23 8Z" 
        fill={inverted ? "#4F46E5" : "white"} // Contrast with background
        fillOpacity="0.9"
      />
    </svg>
  );
};
