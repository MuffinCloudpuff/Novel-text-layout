
import React from 'react';
import { Button } from './components/Button';
import { TextArea } from './components/TextArea';
import { 
  Sparkles, 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Zap,
  RotateCcw,
  Languages,
  FileText
} from 'lucide-react';
import { LanguageSelector } from './components/LanguageSelector';
import { BackgroundAmbience } from './components/BackgroundAmbience';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { useDocumentEngine } from './hooks/useDocumentEngine';

const App: React.FC = () => {
  const { state, actions } = useDocumentEngine();
  const {
    input, output, isProcessing, copied, autoFormat, targetLang,
    highlightState, inputCount, outputParagraphs
  } = state;
  const {
    setAutoFormat, setTargetLang, handleInputChange, handleOutputChange,
    handleInputCursorMove, handleOutputCursorMove, handleBasicFormat,
    handleSmartFormat, handleTranslate, handleCopy, handleExport, handleClear
  } = actions;

  return (
    <div className="flex flex-col h-screen relative bg-paper text-ink overflow-hidden font-sans">
      <BackgroundAmbience />
      
      {/* Header */}
      <Header autoFormat={autoFormat} onAutoFormatChange={() => setAutoFormat(!autoFormat)} />

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
              headerAction={<LanguageSelector targetLang={targetLang} onChange={setTargetLang} />}
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
      <Footer />
    </div>
  );
};

export default App;
