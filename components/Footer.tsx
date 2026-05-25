import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="px-12 py-6 text-center z-10">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/50 shadow-sm text-[10px] tracking-widest text-subtle font-medium uppercase">
         <span>Alpha Smart Layout</span>
         <span className="w-1 h-1 rounded-full bg-gold"></span>
         <span>Powered by Gemini 2.5</span>
      </div>
    </footer>
  );
};
