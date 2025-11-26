import React, { useState, useEffect } from 'react';
import { X, Save, Settings, Key, Globe, Box } from 'lucide-react';
import { Button } from './Button';
import { DEFAULT_SETTINGS, STORAGE_KEY_SETTINGS } from '../constants';
import { AISettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      }
    }
  }, [isOpen]);

  const handleChange = (field: keyof AISettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    onClose();
    // Optional: Show toast
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 text-lg">
            <Settings size={20} className="text-primary"/>
            AI Settings
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto no-scrollbar space-y-6">
          
          {/* Gemini Section */}
          <div className={`space-y-4 transition-opacity ${settings.useOpenAI ? 'opacity-50 grayscale' : 'opacity-100'}`}>
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Google Gemini
              </label>
              {!settings.useOpenAI && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>}
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-slate-500 uppercase font-semibold">API Keys (Comma separated)</label>
              <div className="relative">
                <Key size={16} className="absolute left-3 top-3 text-slate-400" />
                <textarea 
                  value={settings.geminiKeys}
                  onChange={(e) => handleChange('geminiKeys', e.target.value)}
                  disabled={settings.useOpenAI}
                  placeholder="Paste your Gemini API keys here, separated by commas..."
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:bg-slate-100"
                  rows={3}
                />
              </div>
              <p className="text-xs text-slate-400">Keys will be rotated randomly for each request.</p>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* OpenAI Section */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
               <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                 <span className={`w-2 h-2 rounded-full ${settings.useOpenAI ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                 OpenAI Compatible
               </label>
               
               {/* Toggle Switch */}
               <button 
                 onClick={() => handleChange('useOpenAI', !settings.useOpenAI)}
                 className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${settings.useOpenAI ? 'bg-primary' : 'bg-slate-200'}`}
               >
                 <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ${settings.useOpenAI ? 'translate-x-5' : 'translate-x-0'}`} />
               </button>
             </div>

             {settings.useOpenAI && (
               <div className="space-y-4 animate-in slide-in-from-top-2">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 uppercase font-semibold">Base URL</label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="text"
                        value={settings.openAIUrl}
                        onChange={(e) => handleChange('openAIUrl', e.target.value)}
                        placeholder="https://api.openai.com/v1"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 uppercase font-semibold">API Keys (Comma separated)</label>
                    <div className="relative">
                      <Key size={16} className="absolute left-3 top-3 text-slate-400" />
                      <textarea 
                        value={settings.openAIKeys}
                        onChange={(e) => handleChange('openAIKeys', e.target.value)}
                        placeholder="sk-..."
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 uppercase font-semibold">Model Name</label>
                    <div className="relative">
                      <Box size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="text"
                        value={settings.openAIModel}
                        onChange={(e) => handleChange('openAIModel', e.target.value)}
                        placeholder="gpt-4o, deepseek-chat, etc."
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                    </div>
                  </div>
               </div>
             )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
          <Button onClick={handleSave} className="flex items-center gap-2 pl-4 pr-6">
            <Save size={18} />
            <span>Save Configuration</span>
          </Button>
        </div>
      </div>
    </div>
  );
};