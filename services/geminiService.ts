import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTaskDescription = async (taskTitle: string): Promise<string> => {
  try {
    const prompt = `
      You are a project management assistant. Write a concise, professional task description (in Russian) for a task titled: "${taskTitle}".
      Include a brief objective and 3-4 bullet points of potential acceptance criteria.
      Keep it short.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || '';
  } catch (error) {
    console.error("Error generating description:", error);
    return "Не удалось сгенерировать описание. Пожалуйста, попробуйте позже.";
  }
};
