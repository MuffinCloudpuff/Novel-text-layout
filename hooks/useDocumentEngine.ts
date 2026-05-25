import { useState, useCallback } from 'react';
import { basicFormat, getSentenceAtCursor, findMappedRange } from '../services/formatterService';
import { smartFormatWithGemini, translateWithGemini } from '../services/geminiService';
import { exportToWord } from '../services/exportService';
import { SyncState } from '../types';
import { LANGUAGES } from '../components/LanguageSelector';

export const useDocumentEngine = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [autoFormat, setAutoFormat] = useState<boolean>(true);
  const [targetLang, setTargetLang] = useState<string>('zh-CN');
  const [highlightState, setHighlightState] = useState<SyncState>({ inputRange: null, outputRange: null });

  const inputCount = input.length;
  const outputParagraphs = output ? output.split(/\n\s*\n/).filter(line => line.trim().length > 0).length : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setInput(newVal);
    setHighlightState({ inputRange: null, outputRange: null });
    
    if (autoFormat) {
      setOutput(basicFormat(newVal));
    }
  };

  const handleOutputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setOutput(newVal);
    const rawInput = newVal.replace(/\n\n/g, ''); 
    setInput(rawInput);
  };

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

  return {
    state: {
      input,
      output,
      isProcessing,
      copied,
      autoFormat,
      targetLang,
      highlightState,
      inputCount,
      outputParagraphs
    },
    actions: {
      setAutoFormat,
      setTargetLang,
      handleInputChange,
      handleOutputChange,
      handleInputCursorMove,
      handleOutputCursorMove,
      handleBasicFormat,
      handleSmartFormat,
      handleTranslate,
      handleCopy,
      handleExport,
      handleClear,
    }
  };
};
