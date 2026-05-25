import React from 'react';

interface HeaderProps {
  autoFormat: boolean;
  onAutoFormatChange: () => void;
}

export const Header: React.FC<HeaderProps> = ({ autoFormat, onAutoFormatChange }) => {
  return (
    <header className="px-6 md:px-12 py-5 flex items-center justify-between z-10 sticky top-0 bg-paper/80 backdrop-blur-sm">
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
           <div className="bg-gold text-white font-serif-title w-8 h-8 rounded-full flex items-center justify-center text-lg pb-1 shadow-sm">α</div>
           <h1 className="text-2xl font-serif-title tracking-tight text-ink">Alpha <span className="font-normal italic text-xl text-subtle/80">智能排版</span></h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
         <label className="flex items-center cursor-pointer group select-none">
           <span className={`mr-2 text-xs font-medium uppercase tracking-widest transition-colors ${autoFormat ? 'text-ink' : 'text-subtle'}`}>
             即时处理
           </span>
           <div className="relative">
             <input 
               type="checkbox" 
               className="sr-only" 
               checked={autoFormat} 
               onChange={onAutoFormatChange}
             />
             <div className={`block w-8 h-4 rounded-full transition-all duration-300 ease-out border ${autoFormat ? 'bg-ink border-ink' : 'bg-transparent border-subtle/40'}`}></div>
             <div className={`absolute left-0 top-0 bg-white w-4 h-4 rounded-full shadow-md border border-black/10 transition-transform duration-300 ease-out ${autoFormat ? 'translate-x-4' : 'translate-x-0'}`}></div>
           </div>
         </label>
      </div>
    </header>
  );
};
