import React from 'react';

interface LogoProps {
  className?: string;
  inverted?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", inverted = false }) => {
  const primaryColor = inverted ? "white" : "#4F46E5"; // Indigo 600
  const secondaryColor = inverted ? "#4F46E5" : "white";

  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <filter id="shadow" x="-2" y="-2" width="28" height="28" filterUnits="userSpaceOnUse">
           <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.1"/>
        </filter>
      </defs>
      
      {/* Main Shape: Chat Bubble / Card */}
      <path 
        d="M20 10C20 15.5228 15.5228 20 10 20C8.5 20 7.1 19.65 5.85 19L3 21L4.35 17.65C3.5 16.25 3 14.7 3 13C3 7.47715 7.47715 3 13 3C16.866 3 20 6.13401 20 10Z" 
        fill={primaryColor}
      />
      
      {/* Inner Detail: Camera Lens / Shutter Aperture */}
      <circle cx="11.5" cy="11.5" r="4.5" stroke={secondaryColor} strokeWidth="1.5" />
      <circle cx="11.5" cy="11.5" r="2" fill={secondaryColor} />
      <path d="M11.5 7V9" stroke={secondaryColor} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 11.5H14" stroke={secondaryColor} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11.5 16V14" stroke={secondaryColor} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 11.5H9" stroke={secondaryColor} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};