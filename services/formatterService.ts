
import { TextRange } from '../types';

export interface SentenceNode {
  text: string;
  range: TextRange;
  index?: number;
}

/**
 * Parses text into sentence nodes. 
 * Optimized for "One Sentence Per Paragraph" while respecting document structure.
 */
export const parseSentences = (text: string): SentenceNode[] => {
  if (!text) return [];

  const nodes: SentenceNode[] = [];
  let buffer = '';
  let startIndex = 0;
  
  let inSmartQuote = 0;
  let inStraightQuote = false;

  const isPunctuation = (c: string) => /[。\.?!？！]/.test(c);
  const isClosingPunctuation = (c: string) => /[”"’'\)）\]】]/.test(c);
  const isOpener = (c: string) => /[“‘]/.test(c);
  const isCloser = (c: string) => /[”’]/.test(c);

  const ABBREVIATIONS = [
    'Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Sr', 'Jr', 'St', 'Rd', 'Ave', 
    'vs', 'etc', 'e.g', 'i.e', 'approx', 'fig', 'eq', 'No', 'Inc', 'Co', 'Ltd'
  ];

  const flushBuffer = (currentIndex: number) => {
    const trimmed = buffer.trim();
    if (trimmed.length > 0) {
      nodes.push({
        text: trimmed,
        range: { start: startIndex, end: currentIndex }
      });
    }
    buffer = '';
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (buffer.length === 0) {
      startIndex = i;
    }

    // Treat newlines as hard boundaries for structural items (headers, list items)
    if (char === '\n') {
      flushBuffer(i);
      continue;
    }

    buffer += char;

    if (isOpener(char)) {
      inSmartQuote++;
    } else if (isCloser(char)) {
      if (inSmartQuote > 0) inSmartQuote--;
    } else if (char === '"') {
      inStraightQuote = !inStraightQuote;
    }

    if (isPunctuation(char)) {
      if (char === '.') {
        const nextChar = text[i + 1] || '';
        // If followed by a number or letter immediately, it might be a version (1.1) or abbreviation
        if (/[a-zA-Z0-9]/.test(nextChar)) continue;

        const contentSoFar = buffer.slice(0, -1);
        const isAbbreviation = ABBREVIATIONS.some(abbr => {
          const escapedAbbr = abbr.replace(/\./g, '\\.');
          const regex = new RegExp(`(?:^|[\\s\\(\\["'])` + escapedAbbr + `$`);
          return regex.test(contentSoFar);
        });

        if (isAbbreviation) continue;
      }

      // Consume trailing ellipsis or repeat marks
      while (i + 1 < text.length && isPunctuation(text[i+1])) {
        buffer += text[i+1];
        i++;
      }

      // Consume trailing quotes/brackets
      while (i + 1 < text.length && isClosingPunctuation(text[i+1])) {
        const nextChar = text[i+1];
        buffer += nextChar;
        if (isCloser(nextChar)) {
           if (inSmartQuote > 0) inSmartQuote--;
        } else if (nextChar === '"') {
           inStraightQuote = !inStraightQuote;
        }
        i++;
      }

      if (inSmartQuote === 0 && !inStraightQuote) {
        flushBuffer(i + 1);
      }
    }
  }

  flushBuffer(text.length);
  return nodes;
};

export const getSentenceAtCursor = (text: string, cursor: number): SentenceNode | null => {
  if (!text) return null;
  const nodes = parseSentences(text);

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (cursor >= node.range.start && cursor < node.range.end) {
      const rawText = text.slice(node.range.start, node.range.end);
      const leadingSpace = rawText.match(/^\s*/)?.[0].length || 0;
      const contentStartIndex = node.range.start + leadingSpace;

      if (cursor < contentStartIndex && i > 0) return nodes[i - 1];
      return node;
    }
  }

  for (const node of nodes) {
    if (cursor === node.range.end) return node;
  }

  if (nodes.length > 0) {
    const lastNode = nodes[nodes.length - 1];
    if (cursor > lastNode.range.end) {
      const gap = text.slice(lastNode.range.end, cursor);
      if (!gap.trim()) return lastNode;
    }
  }

  return null;
};

const normalizeText = (text: string) => text.replace(/\s+/g, '');

export const findMappedRange = (
  sourceText: string, 
  targetText: string, 
  cursor: number
): TextRange | null => {
  if (!sourceText || !targetText) return null;

  const sourceNodes = parseSentences(sourceText);
  let sourceIndex = -1;

  for (let i = 0; i < sourceNodes.length; i++) {
    const node = sourceNodes[i];
    if (cursor >= node.range.start && cursor <= node.range.end) {
       const rawText = sourceText.slice(node.range.start, node.range.end);
       const leadingSpace = rawText.match(/^\s*/)?.[0].length || 0;
       if (cursor < node.range.start + leadingSpace && i > 0) {
         sourceIndex = i - 1;
       } else {
         sourceIndex = i;
       }
       break;
    }
  }

  if (sourceIndex === -1 && sourceNodes.length > 0) {
    const last = sourceNodes[sourceNodes.length - 1];
    if (cursor > last.range.end && !sourceText.slice(last.range.end, cursor).trim()) {
      sourceIndex = sourceNodes.length - 1;
    }
  }

  if (sourceIndex === -1) return null;

  const coreNode = sourceNodes[sourceIndex];
  const coreSignature = normalizeText(coreNode.text);
  const targetNodes = parseSentences(targetText);
  
  let candidates: number[] = [];
  targetNodes.forEach((node, idx) => {
    if (normalizeText(node.text) === coreSignature) {
      candidates.push(idx);
    }
  });

  if (candidates.length === 0) {
     if (targetNodes.length === 0) return null;
     let targetIdx = sourceIndex;
     if (targetIdx >= targetNodes.length) targetIdx = targetNodes.length - 1;
     if (targetIdx < 0) return null;
     return targetNodes[targetIdx].range;
  }

  if (candidates.length === 1) return targetNodes[candidates[0]].range;

  let radius = 2;
  const maxRadius = Math.max(sourceNodes.length, targetNodes.length);

  while (candidates.length > 1 && radius < maxRadius + 2) {
    const sStart = Math.max(0, sourceIndex - radius);
    const sEnd = Math.min(sourceNodes.length, sourceIndex + radius + 1);
    const sourceBlockSig = sourceNodes.slice(sStart, sEnd).map(n => normalizeText(n.text)).join('|||');

    const nextCandidates = candidates.filter(targetIdx => {
      const tStart = Math.max(0, targetIdx - radius);
      const tEnd = Math.min(targetNodes.length, targetIdx + radius + 1);
      const targetBlockSig = targetNodes.slice(tStart, tEnd).map(n => normalizeText(n.text)).join('|||');
      return sourceBlockSig === targetBlockSig;
    });

    if (nextCandidates.length === 0) break;
    candidates = nextCandidates;
    if (candidates.length === 1) return targetNodes[candidates[0]].range;
    radius += 2;
  }

  const sourceProgress = sourceIndex / sourceNodes.length;
  let bestCandidateIdx = candidates[0];
  let minDiff = 1;

  for (const idx of candidates) {
    const targetProgress = idx / targetNodes.length;
    const diff = Math.abs(targetProgress - sourceProgress);
    if (diff < minDiff) {
      minDiff = diff;
      bestCandidateIdx = idx;
    }
  }

  return targetNodes[bestCandidateIdx].range;
};

export const basicFormat = (text: string): string => {
  const nodes = parseSentences(text);
  // Using double newlines to clearly separate segments in the UI
  return nodes.map(n => n.text).join('\n\n');
};
