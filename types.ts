// Data model for a learning scenario
export interface Scenario {
  id: string;
  createdAt: number;
  input: {
    text?: string;
    imageUrl?: string; // Local preview URL or Storage URL
  };
  data: ScenarioAnalysis;
}

// The structure returned by Gemini AI
export interface ScenarioAnalysis {
  chineseTitle: string;
  mainPhrase: string;
  ipa: string;
  explanation: string;
  exampleSentence: string;
  relatedVocab: string[];
}

// User auth state
export interface UserState {
  uid: string;
  isAnonymous: boolean;
}

// AI Configuration Settings
export interface AISettings {
  geminiKeys: string; // Comma separated
  useOpenAI: boolean;
  openAIUrl: string;
  openAIKeys: string; // Comma separated
  openAIModel: string;
  // Firebase Configuration
  firebaseApiKey?: string;
  firebaseAuthDomain?: string;
  firebaseProjectId?: string;
  firebaseStorageBucket?: string;
  firebaseMessagingSenderId?: string;
  firebaseAppId?: string;
  firebaseMeasurementId?: string; // Optional, only if GA is used
}