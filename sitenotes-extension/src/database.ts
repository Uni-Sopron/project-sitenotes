/*
I'M TAKING THIS SON OF A GUN APART ONE BY ONE, YOU ARE EXPERIENCING BRUTAL MURDER OF A CODE THAT WAS THOUGHT TO BE ORGANISED AND REDUNDANT
                                                                                                                                                */
                                                                                                                                               
// const DB_NAME = 'siteNotesDB';
// const DB_VERSION = 1
// // Define object store names
// const STORE_PAGES = 'pages';

//================================================================================================================================================================//
// Utility function to open the IndexedDB
// export const openPageDatabase = async (): Promise<IDBDatabase> => {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open(DB_NAME, DB_VERSION);

//     request.onupgradeneeded = (event: any) => {
//       const db = event.target.result;

//       if (!db.objectStoreNames.contains(STORE_PAGES)) {
//         db.createObjectStore(STORE_PAGES, { keyPath: 'id' });
//       }
//     };

//     request.onsuccess = () => {
//       resolve(request.result);
//     };

//     request.onerror = (event: any) => {
//       reject(event.target.error);
//     };
//   });
// };



// const savePageData = async (storeName: string, data: any): Promise<void> => {
//   const db = await openPageDatabase();
//   const transaction = db.transaction(storeName, 'readwrite');
//   const store = transaction.objectStore(storeName);

//   // Add or update the data based on the ID
//   store.put(data);
//   return new Promise((resolve, reject) => {
//     transaction.oncomplete = () => resolve();
//     transaction.onerror = (event) => reject((event.target as IDBRequest).error);
//   });
// };

// // Save or update page data in a store
// //================================================================================================================================================================//

// // Retrieve data from a store by URL or ID
// export const getPageData = async (storeName: string, key: string): Promise<any> => {
//   const db = await openPageDatabase();
//   const transaction = db.transaction(storeName, 'readonly');
//   const store = transaction.objectStore(storeName);

//   const request = store.get(key);

//   return new Promise((resolve, reject) => {
//     request.onsuccess = () => resolve(request.result);
//     request.onerror = (event) => reject((event.target as IDBRequest).error);
//   });
// };