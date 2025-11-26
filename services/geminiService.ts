import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GEMINI_MODEL_NAME, SYSTEM_INSTRUCTION } from "../constants";
import { ScenarioAnalysis } from "../types";

// Define the expected JSON output schema
const scenarioSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    chineseTitle: {
      type: Type.STRING,
      description: "A short 2-4 word summary of the scenario in Chinese.",
    },
    mainPhrase: {
      type: Type.STRING,
      description: "The core English sentence or phrase for the scenario.",
    },
    ipa: {
      type: Type.STRING,
      description: "IPA pronunciation guide for the main phrase.",
    },
    explanation: {
      type: Type.STRING,
      description: "Brief explanation in Chinese about the usage or context.",
    },
    exampleSentence: {
      type: Type.STRING,
      description: "A full, practical English example sentence containing the phrase.",
    },
    relatedVocab: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2-3 related English words.",
    },
  },
  required: ["chineseTitle", "mainPhrase", "ipa", "explanation", "exampleSentence", "relatedVocab"],
};

export const analyzeScenario = async (
  textInput: string, 
  imageBase64?: string
): Promise<ScenarioAnalysis> => {
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const parts: any[] = [];

  // Add text part if exists
  if (textInput) {
    parts.push({ text: textInput });
  }

  // Add image part if exists
  if (imageBase64) {
    // Remove data URL header if present (e.g. "data:image/jpeg;base64,")
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg", // Assuming JPEG for simplicity/conversion
      }
    });
  }

  if (parts.length === 0) {
    throw new Error("No input provided to Gemini");
  }

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: scenarioSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");

    const parsedData = JSON.parse(jsonText) as ScenarioAnalysis;
    return parsedData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze scenario. Please try again.");
  }
};
