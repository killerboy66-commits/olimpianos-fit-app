
import { GoogleGenAI, Type } from "@google/genai";
import { WorkoutPlan, UserProfile } from "../types";

// Initialize the Gemini API client lazily to ensure it uses the correct API key
const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateWorkoutPlan = async (profile: UserProfile): Promise<WorkoutPlan> => {
  const ai = getAI();
  const prompt = `Crie um plano de treino detalhado em português para um perfil com as seguintes características:
    Nível: ${profile.level}
    Objetivo: ${profile.goal}
    Equipamentos disponíveis: ${profile.equipment.join(', ')}
    
    Retorne um objeto JSON seguindo estritamente a estrutura do esquema definido.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          category: { type: Type.STRING },
          duration: { type: Type.STRING },
          objective: { type: Type.STRING },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                sets: { type: Type.NUMBER },
                reps: { type: Type.STRING },
                rest: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["name", "sets", "reps", "rest", "description"]
            }
          }
        },
        required: ["title", "category", "duration", "objective", "exercises"]
      }
    }
  });

  // Extract the text output from the response and parse it as JSON. text is a property, not a method.
  const text = response.text;
  const result = text ? JSON.parse(text) : {};
  return { ...result, id: Math.random().toString(36).substr(2, 9) };
};

export const getAIAdvice = async (userMessage: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  const ai = getAI();
  // Pass the chat history to create a stateful conversation context
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    history: history,
    config: {
      systemInstruction: 'Você é um personal trainer altamente qualificado e motivador. Responda em português brasileiro de forma técnica porém acessível. Foque em segurança, execução correta e constância.',
    }
  });

  // sendMessage returns a response where the content is accessed via the .text property
  const response = await chat.sendMessage({ message: userMessage });
  return response.text;
};
