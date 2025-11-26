import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { Scenario, ScenarioAnalysis } from '../types';
import { addScenarioToDB, getScenariosFromDB, deleteScenarioFromDB } from './indexedDB';

// NOTE: In a real environment, these would be populated by process.env variables.
// For this generated code, we check if they exist.
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

let app: FirebaseApp | undefined;
let auth: any;
let db: Firestore | undefined;
let isDemoMode = false;

// Initialize Firebase safely
try {
  if (!getApps().length) {
    // Only initialize if we have a somewhat valid looking config or want to try
    // In a real app, we would strictly require env vars.
    // Here we define a simple check to see if we should fallback to LocalStorage (Demo Mode)
    if (firebaseConfig.apiKey === "demo-key") {
      console.warn("Firebase config missing. Running in IndexedDB Demo Mode.");
      isDemoMode = true;
    } else {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
    }
  } else {
    app = getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (e) {
  console.error("Firebase initialization failed, falling back to demo mode:", e);
  isDemoMode = true;
}

// --- Auth Services ---

export const signInUser = async (): Promise<User | { uid: string, isAnonymous: boolean }> => {
  if (isDemoMode) {
    return { uid: 'demo-user', isAnonymous: true };
  }
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  if (isDemoMode) {
    // Simulate auth state change
    setTimeout(() => callback({ uid: 'demo-user', isAnonymous: true } as User), 500);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// --- Firestore / DB Services ---

export const saveScenario = async (userId: string, data: ScenarioAnalysis, input: { text?: string, imageUrl?: string }) => {
  if (isDemoMode) {
    const newScenario: Scenario = {
      id: Date.now().toString(),
      createdAt: Date.now(),
      input,
      data
    };
    
    // Use IndexedDB
    await addScenarioToDB(newScenario);
    
    // Dispatch a custom event to update UI in demo mode
    window.dispatchEvent(new Event('storage-update'));
    return newScenario;
  }

  if (!db) throw new Error("Firestore not initialized");

  await addDoc(collection(db, 'users', userId, 'scenarios'), {
    ...data,
    input,
    createdAt: serverTimestamp()
  });
};

export const subscribeToScenarios = (userId: string, callback: (scenarios: Scenario[]) => void) => {
  if (isDemoMode) {
    // Function to load data from IndexedDB
    const load = async () => {
      try {
        const scenarios = await getScenariosFromDB();
        callback(scenarios);
      } catch (error) {
        console.error("Failed to load local scenarios", error);
        callback([]);
      }
    };

    load(); // Initial load
    window.addEventListener('storage-update', load);
    return () => window.removeEventListener('storage-update', load);
  }

  if (!db) return () => {};

  const q = query(
    collection(db, 'users', userId, 'scenarios'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const scenarios = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Handle serverTimestamp being null immediately after write
      createdAt: doc.data().createdAt?.toMillis() || Date.now() 
    })) as Scenario[];
    callback(scenarios);
  });
};

export const deleteScenario = async (userId: string, scenarioId: string) => {
  if (isDemoMode) {
    await deleteScenarioFromDB(scenarioId);
    window.dispatchEvent(new Event('storage-update'));
    return;
  }

  if (!db) return;
  await deleteDoc(doc(db, 'users', userId, 'scenarios', scenarioId));
};