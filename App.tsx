
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { basicFormat, getSentenceAtCursor, findMappedRange } from './services/formatterService';
import { smartFormatWithGemini, translateWithGemini } from './services/geminiService';
import { exportToWord } from './services/exportService';
import { Button } from './components/Button';
import { TextArea } from './components/TextArea';
import { SyncState } from './types';
import { 
  Sparkles, 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Zap,
  RotateCcw,
  Languages,
  ChevronDown,
  FileText
} from 'lucide-react';

const LANGUAGES = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
];

const App: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [autoFormat, setAutoFormat] = useState<boolean>(true);
  
  // Translation State
  const [targetLang, setTargetLang] = useState<string>('zh-CN');
  
  // Bidirectional highlighting state
  const [highlightState, setHighlightState] = useState<SyncState>({ inputRange: null, outputRange: null });

  // Stats calculation
  const inputCount = input.length;
  const outputParagraphs = output ? output.split(/\n\s*\n/).filter(line => line.trim().length > 0).length : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setInput(newVal);
    // Clear highlight when typing to avoid visual confusion
    setHighlightState({ inputRange: null, outputRange: null });
    
    if (autoFormat) {
      setOutput(basicFormat(newVal));
    }
  };

  /**
   * Bi-directional Sync: Right to Left
   * When user edits Output, update Output state AND Input state.
   */
  const handleOutputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setOutput(newVal);
    // Simple reverse strategy for basic formatting
    const rawInput = newVal.replace(/\n\n/g, ''); 
    setInput(rawInput);
  };

  /**
   * LEFT -> RIGHT Locator (Content Search)
   */
  const handleInputCursorMove = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const cursor = target.selectionStart;

    if (!input || !output) return;

    const targetRange = findMappedRange(input, output, cursor);
    const sourceNode = getSentenceAtCursor(input, cursor);

    if (sourceNode && targetRange) {
      setHighlightState({
        inputRange: sourceNode.range,
        outputRange: targetRange
      });
    } else {
      setHighlightState({ inputRange: null, outputRange: null });
    }
  };

  /**
   * RIGHT -> LEFT Locator (Content Search)
   */
  const handleOutputCursorMove = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const cursor = target.selectionStart;

    if (!input || !output) return;

    const targetRange = findMappedRange(output, input, cursor);
    const sourceNode = getSentenceAtCursor(output, cursor);

    if (sourceNode && targetRange) {
      setHighlightState({
        inputRange: targetRange,
        outputRange: sourceNode.range
      });
    } else {
      setHighlightState({ inputRange: null, outputRange: null });
    }
  };

  const handleBasicFormat = useCallback(() => {
    setIsProcessing(true);
    setTimeout(() => {
      setOutput(basicFormat(input));
      setIsProcessing(false);
    }, 200);
  }, [input]);

  const handleSmartFormat = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      const result = await smartFormatWithGemini(input);
      setOutput(result);
    } catch (error) {
      alert("AI 服务暂时不可用，请检查网络或 API Key。");
      setOutput(basicFormat(input));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranslate = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      const result = await translateWithGemini(input, LANGUAGES.find(l => l.code === targetLang)?.label || 'Simplified Chinese');
      setOutput(result);
      if (autoFormat) setAutoFormat(false);
    } catch (error) {
       alert("翻译服务暂时不可用，请检查网络或 API Key。");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleExport = () => {
    if (!output) return;
    const timestamp = new Date().toISOString().slice(0, 10);
    exportToWord(output, `Alpha-Layout-${timestamp}.doc`);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setHighlightState({ inputRange: null, outputRange: null });
  };

  // Improved Custom Language Selector
  const LanguageSelector = () => {
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
      setTargetLang(code);
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

  return (
    <div className="flex flex-col h-screen relative bg-paper text-ink overflow-hidden font-sans">
      
      {/* Background Ambience */}
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
      
      {/* Header */}
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
                 onChange={() => setAutoFormat(!autoFormat)}
               />
               <div className={`block w-8 h-4 rounded-full transition-all duration-300 ease-out border ${autoFormat ? 'bg-ink border-ink' : 'bg-transparent border-subtle/40'}`}></div>
               <div className={`absolute left-0 top-0 bg-white w-4 h-4 rounded-full shadow-md border border-black/10 transition-transform duration-300 ease-out ${autoFormat ? 'translate-x-4' : 'translate-x-0'}`}></div>
             </div>
           </label>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-grow flex flex-col md:flex-row p-4 md:p-8 gap-6 md:gap-12 overflow-hidden z-10 max-w-[1400px] mx-auto w-full">
        
        {/* Input Column */}
        <section className="flex-1 flex flex-col min-h-[300px] relative gap-4">
          <div className="flex-grow relative group">
            <TextArea
              label="原文 (自动检测)"
              placeholder="请输入或粘贴需要处理的文本..."
              value={input}
              onChange={handleInputChange}
              onSelect={handleInputCursorMove}
              onKeyUp={handleInputCursorMove}
              highlightRange={highlightState.inputRange}
              stats={input ? `${inputCount} 字` : '0 字'}
              className="h-full"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center pt-2">
             <Button 
                variant="ghost" 
                onClick={handleClear} 
                disabled={!input}
                icon={<RotateCcw size={14} />}
                className="mr-2"
              >
                清空
              </Button>

            <div className="flex-grow"></div>

            {!autoFormat && (
              <Button 
                variant="secondary" 
                onClick={handleBasicFormat}
                disabled={!input}
                icon={<Zap size={14} />}
              >
                快速整理
              </Button>
            )}
            
            <Button 
              variant="secondary" 
              onClick={handleTranslate}
              disabled={!input || isProcessing}
              isLoading={isProcessing}
              icon={<Languages size={14} />}
              title="翻译并排版"
            >
              智能翻译
            </Button>
            
            <Button 
              variant="primary" 
              onClick={handleSmartFormat}
              disabled={!input || isProcessing}
              isLoading={isProcessing}
              icon={<Sparkles size={14} />}
            >
              AI 深度优化
            </Button>
          </div>
        </section>

        {/* Divider */}
        <div className="hidden md:flex flex-col justify-center items-center opacity-10">
           <ArrowRightLeft className="text-ink w-6 h-6" />
        </div>

        {/* Output Column */}
        <section className="flex-1 flex flex-col min-h-[300px] gap-4">
           <div className="flex-grow relative">
            <TextArea
              label="结果"
              headerAction={<LanguageSelector />}
              placeholder="排版或翻译结果将在此显示..."
              value={output}
              onChange={handleOutputChange}
              onSelect={handleOutputCursorMove}
              onKeyUp={handleOutputCursorMove}
              highlightRange={highlightState.outputRange}
              isOutput
              stats={output ? `${outputParagraphs} 段` : '0 段'}
              className="h-full"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              variant="secondary" 
              onClick={handleExport}
              disabled={!output}
              icon={<FileText size={14} />}
            >
              导出 Word
            </Button>

            <Button 
              variant={copied ? "primary" : "secondary"} 
              onClick={handleCopy}
              disabled={!output}
              icon={copied ? <Check size={14} /> : <Copy size={14} />}
            >
              {copied ? "已复制" : "复制结果"}
            </Button>
          </div>
        </section>

      </main>

      {/* Footer Info */}
      <footer className="px-12 py-6 text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/50 shadow-sm text-[10px] tracking-widest text-subtle font-medium uppercase">
           <span>Alpha Smart Layout</span>
           <span className="w-1 h-1 rounded-full bg-gold"></span>
           <span>Powered by Gemini 2.5</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
