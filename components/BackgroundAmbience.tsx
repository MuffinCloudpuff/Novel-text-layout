import React from 'react';

export const BackgroundAmbience: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
       <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-ink" />
       </svg>

       <svg className="absolute top-0 right-0 h-full w-full pointer-events-none opacity-40" viewBox="0 0 1200 800" preserveAspectRatio="none">
           <path d="M1200 0 C 900 300, 600 200, 1200 800" stroke="#C7B28F" strokeWidth="1" fill="none" className="opacity-30" />
           <path d="M1250 0 C 950 350, 650 250, 1250 850" stroke="#C7B28F" strokeWidth="0.5" fill="none" className="opacity-20" />
           <path d="M1150 0 C 850 250, 550 150, 1150 750" stroke="#C7B28F" strokeWidth="0.5" fill="none" className="opacity-20" />
           <path d="M1000 -100 C 700 200, 400 600, 1000 900" stroke="#1A1A1A" strokeWidth="0.3" fill="none" className="opacity-5" />
           <path d="M-100 200 C 200 400, 600 0, -100 600" stroke="#C7B28F" strokeWidth="0.8" fill="none" className="opacity-10" />
       </svg>

       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vh] h-[140vh] border-[1px] border-gold/5 rounded-full"></div>
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vh] h-[120vh] border-[1px] border-gold/10 rounded-full"></div>
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vh] h-[100vh] border-[1px] border-gold/5 rounded-full"></div>
       <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-t from-champagne/30 to-transparent rounded-full blur-[120px]"></div>
    </div>
  );
};
