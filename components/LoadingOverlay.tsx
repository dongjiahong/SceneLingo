import React from 'react';
import { Logo } from './Logo';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, message = "Analyzing..." }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        {/* Pulsing rings */}
        <div className="absolute w-24 h-24 border-4 border-indigo-100 rounded-full animate-ping opacity-75"></div>
        <div className="absolute w-20 h-20 bg-indigo-50 rounded-full animate-pulse"></div>
        
        {/* Bouncing Logo */}
        <div className="relative z-10 animate-bounce">
          <Logo className="w-12 h-12 drop-shadow-lg" />
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{message}</h3>
        <p className="text-sm text-slate-400 mt-1 animate-pulse">Consulting the AI tutor...</p>
      </div>
    </div>
  );
};