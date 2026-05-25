
import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Uses Gemini to smartly format the text.
 */
export const smartFormatWithGemini = async (text: string): Promise<string> => {
  if (!text.trim()) return "";

  const ai = getAiClient();

  const prompt = `
    You are an expert typography and document formatting engine.
    
    OBJECTIVE:
    Format the input text so that each valid sentence or structural unit (header, list item) is separated by a double newline (\\n\\n).
    
    CORE RULES:
    1. STRUCTURAL PRESERVATION: 
       - Keep headers (e.g. "1.1 Background", "Chapter 1") on their own lines.
       - Keep list items (e.g. "● Item", "1) Step") on their own lines.
       - Do NOT merge a header into the following paragraph.
    2. SEPARATOR: Separate each valid unit with EXACTLY TWO newlines (\\n\\n).
    3. ENDING PUNCTUATION: Sentences end with Period (.), Chinese Period (。), Question Mark (? ？), Exclamation (! ！).
    4. QUOTE PROTECTION: Do NOT break lines inside a quotation.
    5. ABBREVIATIONS: Do not break after abbreviations like "Mr.", "1.1", "U.S.", "vs.".
    
    INSTRUCTIONS:
    - Preserve all original wording exactly.
    - Return ONLY the formatted text.
    
    Input Text:
    """
    ${text}
    """
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini formatting error:", error);
    throw error;
  }
};

/**
 * Translates text while maintaining paragraph structure.
 */
export const translateWithGemini = async (text: string, targetLanguage: string): Promise<string> => {
  if (!text.trim()) return "";

  const ai = getAiClient();

  const prompt = `
    You are a professional translator and document layout expert.

    OBJECTIVE:
    Translate the following document content into ${targetLanguage}.
    MAINTAIN THE "ONE UNIT PER PARAGRAPH" FORMAT.

    RULES:
    1. TRANSLATION: Accurate and natural ${targetLanguage}.
    2. FORMATTING: Every translated unit (sentence, header, list item) MUST be followed by two newlines (\\n\\n).
    3. STRUCTURE: Preserve the original list structure and headers. Do not merge them.
    4. CONTENT: Return ONLY the translated content.

    Input Text:
    """
    ${text}
    """
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini translation error:", error);
    throw error;
  }
};
