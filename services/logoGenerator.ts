import { GoogleGenAI } from "@google/genai";

export async function generateZeusLogo() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: 'A professional, high-end fitness logo featuring a powerful gold lightning bolt symbolizing Zeus, integrated with a circular crest or a subtle "O" shape. The style should be minimalist, premium, and powerful, with a metallic gold texture on a solid black background. No text, just the icon.',
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}
