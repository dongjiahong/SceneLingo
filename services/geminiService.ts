import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GEMINI_MODEL_NAME, SYSTEM_INSTRUCTION, DEFAULT_SETTINGS, STORAGE_KEY_SETTINGS } from "../constants";
import { ScenarioAnalysis, AISettings } from "../types";

// Define the expected JSON output schema for Gemini
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

// Helper to get settings
const getSettings = (): AISettings => {
  const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
  return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
};

// Helper to rotate keys
const getRandomKey = (keysStr: string): string | null => {
  if (!keysStr) return null;
  const keys = keysStr.split(',').map(k => k.trim()).filter(k => k.length > 0);
  if (keys.length === 0) return null;
  return keys[Math.floor(Math.random() * keys.length)];
};

// --- STRATEGY A: GOOGLE GEMINI ---

const callGemini = async (settings: AISettings, textInput: string, imageBase64?: string): Promise<ScenarioAnalysis> => {
  // Priority: User Settings > Env Var
  const apiKey = getRandomKey(settings.geminiKeys);

  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please configure it in user settings.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const parts: any[] = [];

  if (textInput) parts.push({ text: textInput });

  if (imageBase64) {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg",
      }
    });
  }

  if (parts.length === 0) throw new Error("No input provided");

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
  return JSON.parse(jsonText) as ScenarioAnalysis;
};

// --- STRATEGY B: OPENAI COMPATIBLE ---

const callOpenAI = async (settings: AISettings, textInput: string, imageBase64?: string): Promise<ScenarioAnalysis> => {
  const apiKey = getRandomKey(settings.openAIKeys);
  const baseUrl = settings.openAIUrl.replace(/\/+$/, ""); // Remove trailing slash
  const url = `${baseUrl}/chat/completions`;

  if (!apiKey) {
    throw new Error("OpenAI API Key is missing. Please configure it in settings.");
  }

  // Construct standard Chat Completion messages
  const content: any[] = [];
  
  if (textInput) {
    content.push({ type: "text", text: textInput });
  } else {
    // If only image, add a prompt
    content.push({ type: "text", text: "Analyze this image scenario." });
  }

  if (imageBase64) {
    content.push({
      type: "image_url",
      image_url: {
        url: imageBase64 // OpenAI supports data URLs directly
      }
    });
  }

  const messages = [
    { role: "system", content: SYSTEM_INSTRUCTION + "\n\nIMPORTANT: You MUST return valid pure JSON only. Do not wrap in markdown blocks." },
    { role: "user", content }
  ];

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: settings.openAIModel || "gpt-4o",
        messages: messages,
        response_format: { type: "json_object" }, // Attempt to force JSON
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    let contentStr = data.choices?.[0]?.message?.content;

    if (!contentStr) throw new Error("Empty response from OpenAI provider");

    // Clean potential markdown code blocks ```json ... ```
    contentStr = contentStr.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(contentStr) as ScenarioAnalysis;

  } catch (error: any) {
    console.error("OpenAI request failed", error);
    throw new Error(`OpenAI Provider Failed: ${error.message}`);
  }
};

// --- MAIN EXPORT ---

export const analyzeScenario = async (
  textInput: string, 
  imageBase64?: string
): Promise<ScenarioAnalysis> => {
  const settings = getSettings();

  try {
    if (settings.useOpenAI) {
      return await callOpenAI(settings, textInput, imageBase64);
    } else {
      return await callGemini(settings, textInput, imageBase64);
    }
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};