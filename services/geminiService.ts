import { GoogleGenAI, Type } from "@google/genai";
import { VocabItem } from "../types";
import { v4 as uuidv4 } from 'uuid'; // Simulating uuid if not available, but we'll use a simple random string generator in helper

const genAI = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
});

const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateVocabFromTopic = async (topic: string): Promise<VocabItem[]> => {
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a list of 5 advanced English vocabulary words related to the topic "${topic}". 
      Return a JSON array where each object has 'word' (English), 'meaning' (Vietnamese translation), and 'example' (English sentence).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              meaning: { type: Type.STRING },
              example: { type: Type.STRING }
            },
            required: ["word", "meaning", "example"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    
    return data.map((item: any) => ({
      id: generateId(),
      word: item.word,
      meaning: item.meaning,
      example: item.example
    }));
  } catch (error) {
    console.error("Error generating vocab:", error);
    throw error;
  }
};

export const explainWord = async (word: string): Promise<string> => {
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Explain the word "${word}" simply in Vietnamese. Include pronunciation (IPA), word type, and usage nuance.`,
    });
    return response.text || "Could not retrieve explanation.";
  } catch (error) {
    console.error("Error explaining word:", error);
    return "Error connecting to AI service.";
  }
};
