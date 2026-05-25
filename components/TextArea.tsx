
import React, { useRef, useEffect } from 'react';
import { TextRange } from '../types';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  stats?: string;
  isOutput?: boolean;
  highlightRange?: TextRange | null;
  onCursorMove?: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
  headerAction?: React.ReactNode; // New prop for custom header controls
}

export const TextArea: React.FC<TextAreaProps> = ({ 
  label, 
  stats, 
  className = '', 
  isOutput = false,
  highlightRange,
  value,
  onCursorMove,
  style,
  headerAction,
  ...props 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  
  // Sync scroll from textarea to backdrop
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const top = e.currentTarget.scrollTop;
    if (backdropRef.current) {
      backdropRef.current.scrollTop = top;
    }
    props.onScroll?.(e);
  };

  // Force sync backdrop scroll position whenever value or highlight changes
  useEffect(() => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, [value, highlightRange]);

  // Auto-scroll to highlight when highlightRange changes
  useEffect(() => {
    if (highlightRange && backdropRef.current && textareaRef.current) {
      const highlightSpan = backdropRef.current.querySelector('[data-highlight="true"]') as HTMLElement;
      
      if (highlightSpan) {
        if (document.activeElement !== textareaRef.current) {
            const top = highlightSpan.offsetTop;
            const height = highlightSpan.offsetHeight;
            const containerHeight = textareaRef.current.clientHeight;

            textareaRef.current.scrollTo({
                top: top - (containerHeight / 2) + (height / 2),
                behavior: 'smooth'
            });
        }
      }
    }
  }, [highlightRange, value]);

  const renderBackdrop = () => {
    if (!value || typeof value !== 'string') return null;
    
    if (!highlightRange) {
      return <span className="text-transparent">{value}</span>;
    }

    const { start, end } = highlightRange;
    
    if (start < 0 || end > value.length || start >= end) {
       return <span className="text-transparent">{value}</span>;
    }

    const before = value.substring(0, start);
    const highlight = value.substring(start, end);
    const after = value.substring(end);

    return (
      <>
        <span className="text-transparent">{before}</span>
        <span 
          data-highlight="true" 
          className="bg-lavender/70 rounded-md text-transparent transition-colors duration-300 ring-4 ring-lavender/20"
        >
          {highlight}
        </span>
        <span className="text-transparent">{after}</span>
        <span className="text-transparent"> </span> 
      </>
    );
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-3 px-1 h-7">
        <label className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-widest font-sans flex items-center gap-2">
          {label}
          {headerAction && (
             <div className="ml-2">{headerAction}</div>
          )}
        </label>
        
        {stats && (
          <span className="text-[10px] text-[#8C8C8C] font-mono border border-[#E0E0E0] px-2 py-0.5 rounded-full bg-white/50">
            {stats}
          </span>
        )}
      </div>
      
      {/* Input Area Wrapper */}
      <div className="relative flex-grow rounded-[24px] overflow-hidden border border-black/5 bg-white/50 focus-within:bg-white focus-within:shadow-2xl focus-within:shadow-black/5 focus-within:border-gold/30 transition-all duration-500 ease-out">
        
        {/* Backdrop Layer */}
        <div 
          ref={backdropRef}
          className="absolute inset-0 p-8 whitespace-pre-wrap break-words font-sans text-base leading-relaxed overflow-y-scroll custom-scrollbar scrollbar-invisible pointer-events-none select-none z-0"
          aria-hidden="true"
        >
           {renderBackdrop()}
        </div>

        {/* Textarea Layer */}
        <textarea
          ref={textareaRef}
          value={value}
          onScroll={handleScroll}
          className="absolute inset-0 w-full h-full p-8 bg-transparent resize-none border-0 outline-none focus:ring-0 whitespace-pre-wrap break-words font-sans text-base leading-relaxed text-ink/90 overflow-y-scroll custom-scrollbar z-10"
          spellCheck={false}
          {...props}
        />
      </div>
    </div>
  );
};
