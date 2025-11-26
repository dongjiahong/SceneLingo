export const GEMINI_MODEL_NAME = 'gemini-2.5-flash';

export const SYSTEM_INSTRUCTION = `
You are an expert bilingual English tutor (Chinese/English) who helps users learn authentic English expressions based on real-life scenarios.

Your Task:
1. Analyze the user's input (which may be a text description, an image, or both).
2. Identify the core intent or the specific action/object shown.
3. Provide the most natural, native-speaker way to express this in English. Avoid textbook-style translations if a more common idiom exists.
4. Return the result strictly in JSON format.

Output Requirements:
- chineseTitle: A short 2-4 word summary in Chinese (e.g., "系鞋带", "点咖啡").
- mainPhrase: The core English sentence or phrase (e.g., "Tie my shoes").
- ipa: The IPA pronunciation for the main phrase.
- explanation: A brief explanation in Chinese of why this phrase is used or the cultural context.
- exampleSentence: A full, practical example sentence using the phrase.
- relatedVocab: An array of 2-3 related English words.
`;

// Fallback user ID for demo mode if Firebase is not configured
export const DEMO_USER_ID = 'demo-user-123';

export const DEFAULT_SETTINGS = {
  geminiKeys: '',
  useOpenAI: false,
  openAIUrl: 'https://api.openai.com/v1',
  openAIKeys: '',
  openAIModel: 'gpt-4o',
  // Firebase Configuration
  firebaseApiKey: '',
  firebaseAuthDomain: '',
  firebaseProjectId: '',
  firebaseStorageBucket: '',
  firebaseMessagingSenderId: '',
  firebaseAppId: '',
  firebaseMeasurementId: '',
};

export const STORAGE_KEY_SETTINGS = 'scenelingo_settings';