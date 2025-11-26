import React, { useState } from 'react';
import { Volume2, Trash2, Maximize2 } from 'lucide-react';
import { Scenario } from '../types';

interface ScenarioCardProps {
  scenario: Scenario;
  onDelete?: (id: string) => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onDelete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { data, input } = scenario;

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(data.mainPhrase);
      utterance.lang = 'en-US';
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric' 
    }).format(new Date(timestamp));
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4 transition-all hover:shadow-md animate-in slide-in-from-bottom-2 duration-300">
      
      {/* Header: Title & Time */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{data.chineseTitle}</h3>
          <p className="text-xs text-slate-400 mt-1">{formatDate(scenario.createdAt)}</p>
        </div>
        <div className="flex gap-2 relative z-10">
           {onDelete && (
             <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(scenario.id);
              }}
              className="p-2 text-slate-300 hover:text-red-400 transition-colors cursor-pointer"
              title="Delete scenario"
            >
              <Trash2 size={16} />
            </button>
           )}
        </div>
      </div>

      {/* Image Preview (if available) */}
      {input.imageUrl && (
        <div className="mb-4 rounded-xl overflow-hidden h-32 w-full relative group bg-slate-100">
           <img 
            src={input.imageUrl} 
            alt="Context" 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-md pointer-events-none">
             <Maximize2 size={12} className="text-white"/>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-indigo-50 rounded-xl p-4 mb-4 relative">
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSpeak();
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all cursor-pointer z-10 ${
            isPlaying ? 'bg-primary text-white scale-110' : 'bg-white text-primary shadow-sm hover:scale-105'
          }`}
        >
          <Volume2 size={20} className={isPlaying ? 'animate-pulse' : ''} />
        </button>
        
        <p className="text-xl font-bold text-primary pr-10 leading-snug">
          {data.mainPhrase}
        </p>
        <p className="text-slate-500 font-mono text-sm mt-1">/{data.ipa}/</p>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div className="flex gap-2 items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Context</span>
            <p className="text-sm text-slate-600 leading-relaxed">{data.explanation}</p>
        </div>

        <div className="flex gap-2 items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Example</span>
            <p className="text-sm text-slate-600 italic">"{data.exampleSentence}"</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100">
          {data.relatedVocab.map((word, idx) => (
            <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};