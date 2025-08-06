import { GoogleGenAI, Type } from "@google/genai";
import type { SpendingSuggestion } from '../types';

// This function assumes the API_KEY is set in the environment.
// As per instructions, no UI is generated for API key management.
let ai: GoogleGenAI;
try {
    ai = new GoogleGenAI({apiKey: process.env.API_KEY});
} catch(e) {
    console.error("Failed to initialize GoogleGenAI. Is API_KEY set?", e);
}


const suggestionsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            suggestion: {
                type: Type.STRING,
                description: 'A concise, actionable suggestion for spending or investing money.'
            },
            rationale: {
                type: Type.STRING,
                description: 'A brief explanation of why this is a good idea for the user.'
            }
        },
        required: ['suggestion', 'rationale']
    }
};

export async function getSpendingSuggestions(surplus: number, interests: string): Promise<SpendingSuggestion[]> {
    if (!ai) {
        throw new Error("Gemini API client not initialized. Make sure the API_KEY environment variable is set.");
    }

    const prompt = `I have a monthly surplus of ₹${surplus.toFixed(2)}. My personal interests include: ${interests || 'general well-being'}. Provide 3 to 5 creative and practical suggestions on how to best use this money. This could include investments, purchases, or experiences that align with my interests.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestionsSchema,
            },
        });

        const jsonText = response.text.trim();
        const suggestions = JSON.parse(jsonText) as SpendingSuggestion[];
        return suggestions;

    } catch (error) {
        console.error("Error fetching spending suggestions:", error);
        throw new Error("Could not get suggestions from the AI. Please check your API key and network connection.");
    }
}
