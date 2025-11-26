import React from 'react';
import { X, Shuffle } from 'lucide-react';
import { Scenario } from '../types';
import { ScenarioCard } from './ScenarioCard';
import { Button } from './Button';

interface ReviewModalProps {
  scenario: Scenario | null;
  onClose: () => void;
  onNext: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ scenario, onClose, onNext }) => {
  if (!scenario) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        role="dialog"
      >
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <span className="bg-indigo-100 text-primary p-1 rounded-md"><Shuffle size={14}/></span>
              Random Review
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 overflow-y-auto no-scrollbar bg-slate-50/30">
             <ScenarioCard scenario={scenario} /> 
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-center shrink-0">
             <Button onClick={onNext} className="flex items-center gap-2 w-full sm:w-auto shadow-none border-primary bg-primary/10 text-primary hover:bg-primary hover:text-white">
                <Shuffle size={16} />
                <span>Next Random Card</span>
             </Button>
        </div>
      </div>
    </div>
  );
}