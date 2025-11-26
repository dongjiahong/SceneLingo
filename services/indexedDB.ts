import { Scenario, ScenarioAnalysis } from '../types';

const DB_NAME = 'SceneLingoDB';
const DB_VERSION = 1;
const STORE_ENTRIES = 'entries';
const STORE_ASSETS = 'assets';

// Type for the stored entry (referencing asset by ID instead of holding the image)
interface StoredScenarioEntry {
  id: string;
  createdAt: number;
  input: {
    text?: string;
    assetId?: string; // Reference to the ID in 'assets' store
  };
  data: ScenarioAnalysis;
}

// Open Database Helper
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", request.error);
      reject(request.error);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Store for metadata and text (Entries)
      if (!db.objectStoreNames.contains(STORE_ENTRIES)) {
        db.createObjectStore(STORE_ENTRIES, { keyPath: 'id' });
      }

      // Store for binary images (Assets)
      if (!db.objectStoreNames.contains(STORE_ASSETS)) {
        db.createObjectStore(STORE_ASSETS); // Out-of-line keys (we provide key explicitly)
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
  });
};

// Helper to convert Base64 string to Blob
export const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};

// --- API ---

export const initDB = async () => {
  await openDB();
};

export const addScenarioToDB = async (scenario: Scenario): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction([STORE_ENTRIES, STORE_ASSETS], 'readwrite');
  
  const entriesStore = transaction.objectStore(STORE_ENTRIES);
  const assetsStore = transaction.objectStore(STORE_ASSETS);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);

    let assetId: string | undefined = undefined;

    // 1. If there is an image URL (Base64), convert to Blob and save to 'assets'
    if (scenario.input.imageUrl && scenario.input.imageUrl.startsWith('data:')) {
      assetId = `img_${scenario.id}`;
      const blob = base64ToBlob(scenario.input.imageUrl);
      assetsStore.put(blob, assetId);
    }

    // 2. Prepare the entry object (remove the heavy image string, add reference ID)
    const entry: StoredScenarioEntry = {
      id: scenario.id,
      createdAt: scenario.createdAt,
      input: {
        text: scenario.input.text,
        assetId: assetId // Link to the asset
      },
      data: scenario.data
    };

    // 3. Save entry
    entriesStore.add(entry);
  });
};

export const getScenariosFromDB = async (): Promise<Scenario[]> => {
  const db = await openDB();
  const transaction = db.transaction([STORE_ENTRIES, STORE_ASSETS], 'readonly');
  const entriesStore = transaction.objectStore(STORE_ENTRIES);
  const assetsStore = transaction.objectStore(STORE_ASSETS);

  return new Promise((resolve, reject) => {
    const request = entriesStore.getAll();

    request.onsuccess = async () => {
      const entries: StoredScenarioEntry[] = request.result;
      
      // Sort in memory (descending order) since we didn't create an index for simplicity
      entries.sort((a, b) => b.createdAt - a.createdAt);

      // Hydrate entries: Fetch blobs for each entry that has an assetId
      const scenarios = await Promise.all(entries.map(async (entry) => {
        let imageUrl: string | undefined = undefined;

        if (entry.input.assetId) {
          try {
             const blob = await new Promise<Blob>((res, rej) => {
               const assetReq = assetsStore.get(entry.input.assetId!);
               assetReq.onsuccess = () => res(assetReq.result);
               assetReq.onerror = () => rej(assetReq.error);
             });
             
             if (blob) {
               imageUrl = URL.createObjectURL(blob);
             }
          } catch (e) {
            console.warn(`Failed to load asset ${entry.input.assetId}`, e);
          }
        }

        // Return the domain model (Scenario) expected by the UI
        return {
          id: entry.id,
          createdAt: entry.createdAt,
          input: {
            text: entry.input.text,
            imageUrl: imageUrl // This is now a blob: URL
          },
          data: entry.data
        } as Scenario;
      }));

      resolve(scenarios);
    };

    request.onerror = () => reject(request.error);
  });
};

export const deleteScenarioFromDB = async (id: string): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction([STORE_ENTRIES, STORE_ASSETS], 'readwrite');
  const entriesStore = transaction.objectStore(STORE_ENTRIES);
  const assetsStore = transaction.objectStore(STORE_ASSETS);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      resolve();
    };
    transaction.onerror = (e) => {
      console.error("IndexedDB delete transaction failed", e);
      reject(transaction.error);
    };

    // 1. Get the entry first to find the asset ID
    const getRequest = entriesStore.get(id);

    getRequest.onsuccess = () => {
      const entry: StoredScenarioEntry = getRequest.result;
      
      if (entry) {
        // 2. Delete the asset if it exists
        if (entry.input.assetId) {
          assetsStore.delete(entry.input.assetId);
        }
        
        // 3. Delete the entry
        entriesStore.delete(id);
      } else {
        console.warn(`Scenario ${id} not found in DB`);
        // We still resolve as "success" effectively, since it's gone
      }
    };
    
    getRequest.onerror = (e) => {
      console.error("Failed to retrieve scenario for deletion", e);
      // Let transaction error handler catch this if bubble
    };
  });
};