import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { ChatMessage, Role, GeoLocation } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

// Lazy initialization to prevent top-level process.env access issues
let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

// Using the stable Gemini 2.5 Flash model which is fast and reliable
const MODEL_NAME = 'gemini-2.5-flash';

export const sendMessageToGemini = async (
  history: ChatMessage[],
  currentMessage: string,
  location?: GeoLocation
): Promise<GenerateContentResponse> => {
  
  // Format history for the API
  const formattedHistory: Content[] = history
    .filter(msg => !msg.isError)
    .map(msg => ({
      role: msg.role === Role.USER ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

  // Configure tools
  const tools: any[] = [
    { googleSearch: {} },
    { googleMaps: {} }
  ];

  // Configure retrieval config (Location)
  let toolConfig: any = undefined;
  if (location) {
    toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      }
    };
  }

  try {
    const client = getAiClient();
    const chat = client.chats.create({
        model: MODEL_NAME,
        history: formattedHistory,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: tools,
            toolConfig: toolConfig,
        }
    });

    const result = await chat.sendMessage({
        message: currentMessage
    });

    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};