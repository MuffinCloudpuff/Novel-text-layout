import React, { useState, useEffect, useRef } from 'react';
import { Languages, ChevronDown, Check } from 'lucide-react';

export const LANGUAGES = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
];

interface LanguageSelectorProps {
  targetLang: string;
  onChange: (code: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ targetLang, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLang = LANGUAGES.find(l => l.code === targetLang) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block ml-2" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium transition-all duration-200 border
          ${isOpen 
            ? 'bg-white border-gold/40 text-ink shadow-sm ring-2 ring-gold/5' 
            : 'bg-white/50 border-[#E0E0E0] text-ink/80 hover:bg-white hover:border-gold/30 hover:text-ink'
          }`}
      >
        <Languages size={10} className="text-subtle" />
        <span className="min-w-[40px] text-center">{selectedLang.label}</span>
        <ChevronDown size={10} className={`text-subtle transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-36 py-1 bg-white/95 backdrop-blur-xl border border-black/5 rounded-xl shadow-xl z-50 transform origin-top-right animate-in fade-in zoom-in-95 duration-100 flex flex-col">
          <div className="px-3 py-1.5 text-[9px] font-bold text-subtle/50 uppercase tracking-widest border-b border-black/5 mb-1">
            Translate To
          </div>
          {LANGUAGES.map(lang => {
            const isActive = lang.code === targetLang;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full text-left px-3 py-1.5 text-[11px] flex items-center justify-between transition-colors
                  ${isActive 
                    ? 'bg-gold/10 text-ink font-medium' 
                    : 'text-ink/70 hover:bg-black/5 hover:text-ink'
                  }`}
              >
                {lang.label}
                {isActive && <Check size={10} className="text-gold" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
