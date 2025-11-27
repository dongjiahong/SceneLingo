import React, { useState, useRef } from 'react';
import { Camera, Send, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';

interface InputAreaProps {
  onSend: (text: string, imageBase64?: string) => void;
  isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !previewUrl) || isLoading) return;

    onSend(text, previewUrl || undefined);
    setText('');
    handleClearImage();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-40">
      
      {/* Image Preview Area */}
      {previewUrl && (
        <div className="px-4 pt-3 animate-in slide-in-from-bottom-5">
          <div className="relative inline-block">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="h-24 w-auto rounded-lg border border-slate-200 shadow-sm object-cover" 
            />
            <button
              onClick={handleClearImage}
              className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 shadow-md hover:bg-slate-700"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 flex gap-3 items-end max-w-2xl mx-auto">
        {/* Hidden File Input */}
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
        />

        {/* Camera/Gallery Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-slate-500 hover:text-primary hover:bg-indigo-50 rounded-xl transition-colors mb-[2px]"
          title="Upload image"
        >
          {previewUrl ? <ImageIcon size={24} /> : <Camera size={24} />}
        </button>

        {/* Text Input */}
        <div className="flex-1 bg-slate-100 rounded-2xl focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder=""
            className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none outline-none p-3 max-h-32 resize-none text-slate-800"
            rows={1}
            style={{ minHeight: '48px' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>

        {/* Send Button */}
        <Button 
          type="submit" 
          disabled={(!text.trim() && !previewUrl) || isLoading}
          className="rounded-full w-12 h-12 !p-0 flex items-center justify-center shrink-0 mb-[2px]"
        >
          <Send size={20} className={isLoading ? 'opacity-0' : 'ml-0.5'} />
        </Button>
      </form>
    </div>
  );
};
