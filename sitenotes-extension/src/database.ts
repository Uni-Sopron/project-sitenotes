/*
I'M TAKING THIS SON OF A GUN APART ONE BY ONE, YOU ARE EXPERIENCING BRUTAL MURDER OF A CODE THAT WAS THOUGHT TO BE ORGANISED AND REDUNDANT
                                                                                                                                                */
                                                                                                                                               
const DB_NAME = 'siteNotesDB';
const DB_VERSION = 1;

// Define object store names
const STORE_PAGES = 'pages';

const STORE_DRAWINGS = 'drawings';

const STORE_MARKERS = 'markers';

//================================================================================================================================================================//
// Utility function to open the IndexedDB
export const openPageDatabase = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_PAGES)) {
        db.createObjectStore(STORE_PAGES, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
};

export const openDrawingDatabase = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_DRAWINGS)) {
        db.createObjectStore(STORE_DRAWINGS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
};

export const openMarkerDatabase = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_MARKERS)) {
        db.createObjectStore(STORE_MARKERS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
};
//================================================================================================================================================================//


// Save or update marker data in a store
export const saveMarkerData = async (storeName: string, data: any): Promise<void> => {
  const db = await openMarkerDatabase();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);

  // Add or update the data based on the ID
  store.put(data);
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};

// Save or update drawing data in a store
export const saveDrawingData = async (storeName: string, data: any): Promise<void> => {
  const db = await openDrawingDatabase();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);

  // Add or update the data based on the ID
  store.put(data);
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};

// Save or update page data in a store
export const savePageData = async (storeName: string, data: any): Promise<void> => {
  const db = await openPageDatabase();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);

  // Add or update the data based on the ID
  store.put(data);
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};
//================================================================================================================================================================//

// Retrieve data from a store by URL or ID
export const getPageData = async (storeName: string, key: string): Promise<any> => {
  const db = await openPageDatabase();
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);

  const request = store.get(key);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};



export const getDrawingData = async (key: string): Promise<any> => {
  const db = await openDrawingDatabase();
  const transaction = db.transaction(STORE_DRAWINGS, 'readonly');
  const store = transaction.objectStore(STORE_DRAWINGS);

  const request = store.get(key);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};

export const getMarkerData = async (key: string): Promise<any> => {
  const db = await openMarkerDatabase();
  const transaction = db.transaction(STORE_MARKERS, 'readonly');
  const store = transaction.objectStore(STORE_MARKERS);

  const request = store.get(key);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};

// Save a marked text range
// export const saveMarker = async (url: string, markerData: { id: number; text: string; position: { start: number; end: number } }): Promise<void> => {
//   const marker = {
//     ...markerData,
//     timestamp: {
//       created: new Date().toISOString(),
//       modified: new Date().toISOString(),
//     },
//     url: url
//   };

//   await saveData(STORE_MARKERS, marker);
// };

// Get all notes for a URL
// export const getNotesForUrl = async (url: string): Promise<any[]> => {
//   const db = await openNoteDatabase();
//   const transaction = db.transaction(STORE_NOTES, 'readonly');
//   const store = transaction.objectStore(STORE_NOTES);

//   const request = store.index('url').openCursor(IDBKeyRange.only(url));
//   const notes: any[] = [];

//   request.onsuccess = (event: any) => {
//     const cursor = event.target.result;
//     if (cursor) {
//       notes.push(cursor.value);
//       cursor.continue();
//     }
//   };

//   return new Promise((resolve, reject) => {
//     request.onerror = (event) => reject((event.target as IDBRequest).error);
//     request.onsuccess = () => resolve(notes);
//   });
// };
