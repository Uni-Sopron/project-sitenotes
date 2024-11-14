/*
                                                SOME OF THESE ARE NOT USED FULLY RN DW I'M ON IT
                                                                                                                                                */
                                                                                                                                               
const DB_NAME = 'siteNotesDB';
const DB_VERSION = 1;

// Define object store names
const STORE_PAGES = 'pages';
export const STORE_NOTES = 'notes';
const STORE_DRAWINGS = 'drawings';
const STORE_IMAGES = 'images';
const STORE_MARKERS = 'markers';

// Utility function to open the IndexedDB
export const openDatabase = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;

      // Create object stores for each type of data
      if (!db.objectStoreNames.contains(STORE_PAGES)) {
        db.createObjectStore(STORE_PAGES, { keyPath: 'url' });
      }
      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        db.createObjectStore(STORE_NOTES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_DRAWINGS)) {
        db.createObjectStore(STORE_DRAWINGS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        db.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
      }
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

// Save or update data in a store
export const saveData = async (storeName: string, data: any): Promise<void> => {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);

  // Add or update the data based on the ID
  store.put(data);
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};

// Retrieve data from a store by URL or ID
export const getData = async (storeName: string, key: string): Promise<any> => {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);

  const request = store.get(key);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};

// Create a new note
export const createNote = async (url: string, noteData: { text: string; color: string; position: { x: number; y: number }; }): Promise<void> => {
  const note = {
    id: Date.now(), // Unique ID for the note (timestamp-based)
    text: noteData.text,
    color: noteData.color,
    position: noteData.position,
    timestamp: {
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    },
    url: url
  };

  await saveData(STORE_NOTES, note);
};

// Update an existing note
export const updateNote = async (id: number, noteData: { text: string; color: string; position: { x: number; y: number }; }): Promise<void> => {
  const existingNote = await getData(STORE_NOTES, id.toString()); // NOTE TO SELF: check back on this if it doesn't work
  if (existingNote) {
    existingNote.text = noteData.text;
    existingNote.color = noteData.color;
    existingNote.position = noteData.position;
    existingNote.timestamp.modified = new Date().toISOString(); // Update the modified timestamp

    await saveData(STORE_NOTES, existingNote);
  }
};

// Create or update a drawing
export const saveDrawing = async (url: string, drawingData: { id: number; type: string; color: string; points: Array<{ x: number; y: number }> }): Promise<void> => {
  const drawing = {
    ...drawingData,
    timestamp: {
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    },
    url: url
  };

  await saveData(STORE_DRAWINGS, drawing);
};

// Save an image (e.g., placed images)
export const saveImage = async (url: string, imageData: { id: number; src: string; position: { x: number; y: number }; size: { width: number; height: number } }): Promise<void> => {
  const image = {
    ...imageData,
    timestamp: {
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    },
    url: url
  };

  await saveData(STORE_IMAGES, image);
};

// Save a marked text range
export const saveMarker = async (url: string, markerData: { id: number; text: string; position: { start: number; end: number } }): Promise<void> => {
  const marker = {
    ...markerData,
    timestamp: {
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    },
    url: url
  };

  await saveData(STORE_MARKERS, marker);
};

// Get all notes for a URL
export const getNotesForUrl = async (url: string): Promise<any[]> => {
  const db = await openDatabase();
  const transaction = db.transaction(STORE_NOTES, 'readonly');
  const store = transaction.objectStore(STORE_NOTES);

  const request = store.index('url').openCursor(IDBKeyRange.only(url));
  const notes: any[] = [];

  request.onsuccess = (event: any) => {
    const cursor = event.target.result;
    if (cursor) {
      notes.push(cursor.value);
      cursor.continue();
    }
  };

  return new Promise((resolve, reject) => {
    request.onerror = (event) => reject((event.target as IDBRequest).error);
    request.onsuccess = () => resolve(notes);
  });
};
