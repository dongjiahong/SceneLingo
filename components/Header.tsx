import React from 'react';
import { Shuffle, Settings } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  onRandom: () => void;
  onSettings: () => void;
  hasHistory: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRandom, onSettings, hasHistory }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between relative">
        
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="relative group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="absolute -inset-2 bg-indigo-100 rounded-full opacity-0 group-hover:opacity-50 transition-opacity blur-md"></div>
            <Logo className="w-9 h-9 relative z-10" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-800 bg-clip-text text-transparent hidden sm:block">
            SceneLingo
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRandom}
            disabled={!hasHistory}
            className="p-2.5 text-primary bg-white border border-indigo-100 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:bg-slate-50 disabled:border-slate-100"
            title="Random Review"
          >
            <Shuffle size={18} strokeWidth={2.5} />
          </button>
          
          <button
            onClick={onSettings}
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all active:scale-95"
            title="AI Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};