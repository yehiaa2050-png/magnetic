export const DB_NAME = 'MagneticSimulatorDB';
export const STORE_NAME = 'preferences';

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveParams = async (mass: number, distance: number, material: string, shape: string) => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ mass, distance, material, shape }, 'lastExperiment');
  } catch (e) {
    console.warn('IDB Save Error:', e);
  }
};

export const loadParams = async (): Promise<{ mass: number; distance: number; material: string, shape: string } | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get('lastExperiment');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn('IDB Load Error:', e);
    return null;
  }
};
