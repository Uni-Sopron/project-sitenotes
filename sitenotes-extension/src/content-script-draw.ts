let isPencilModeActive = false; // Ceruza mód állapota
let isDrawing = false;
let isEraserModeActive = false; // Radír mód állapota
let isErasing = false;

let lastX: number | null = null;
let lastY: number | null = null;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let activeEraseSize: number = 25;
let activeColor: string = '#6969C0';
let activeSize: number = 25;

const setupCanvas = async (): Promise<void> => {
  if (!canvas) {
    canvas = document.createElement('canvas');
  }  
  canvas.width = window.innerWidth;
  canvas.height = Math.max(window.innerHeight, document.body.scrollHeight);
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '9000';
  canvas.style.backgroundColor = 'transparent';
  canvas.style.pointerEvents = 'none'; // Az alapértelmezett beállítás
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');

  // Töltse be a korábbi rajzot, ha van mentve
  await loadCanvasDrawing();
};


const clearCanvas = () => {
  ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
  // delete drawings database
  openDrawingsDatabase()
    .then((db) => {
      const transaction = db.transaction('drawings', 'readwrite');
      const store = transaction.objectStore('drawings');
      store.delete(window.location.href);

      transaction.oncomplete = () => {
        console.log('Drawing deleted from IndexedDB.');
        checkAndRemoveURLIfEmpty();
      };

      transaction.onerror = (event) => {
        console.error('Error deleting drawing:', (event.target as IDBRequest).error);
      };
    })
    .catch((error) => {
      console.error('Error opening database:', error);
    });
};

const addPencilEventListeners = () => {
  canvas!.addEventListener('mousedown', startDrawing);
  canvas!.addEventListener('mousemove', draw);
  canvas!.addEventListener('mouseup', stopDrawing);
  canvas!.addEventListener('mouseout', stopDrawing);

  canvas!.addEventListener('touchstart', startDrawing, { passive: true });
  canvas!.addEventListener('touchmove', draw, { passive: false });
  canvas!.addEventListener('touchend', stopDrawing);
  canvas!.addEventListener('touchcancel', stopDrawing);
}
const removePencilEventlisteners = () => {
  canvas!.removeEventListener('mousedown', startDrawing);
  canvas!.removeEventListener('mousemove', draw);
  canvas!.removeEventListener('mouseup', stopDrawing);
  canvas!.removeEventListener('mouseout', stopDrawing);

  canvas!.removeEventListener('touchstart', startDrawing);
  canvas!.removeEventListener('touchmove', draw);
  canvas!.removeEventListener('touchend', stopDrawing);
  canvas!.removeEventListener('touchcancel', stopDrawing);
  
}
const addEraserEventListeners = () => {
    canvas!.addEventListener('mousedown', startErasing);
    canvas!.addEventListener('mousemove', erase);
    canvas!.addEventListener('mouseup', stopErasing);
    canvas!.addEventListener('mouseout', stopErasing);

    canvas!.addEventListener('touchstart', startErasing, { passive: true });
    canvas!.addEventListener('touchmove', erase, { passive: false });
    canvas!.addEventListener('touchend', stopErasing);
    canvas!.addEventListener('touchcancel', stopErasing);
}
const removeEraserEventlisteners = () => {
  canvas!.removeEventListener('mousedown', startErasing);
  canvas!.removeEventListener('mousemove', erase);
  canvas!.removeEventListener('mouseup', stopErasing);
  canvas!.removeEventListener('mouseout', stopErasing);

  canvas!.removeEventListener('touchstart', startErasing);
  canvas!.removeEventListener('touchmove', erase);
  canvas!.removeEventListener('touchend', stopErasing);
  canvas!.removeEventListener('touchcancel', stopErasing);

}

const stopEraserMode = () => {
    canvas!.style.cursor = 'default';
    removeEraserEventlisteners();
    setEraserModeActive(false);
    canvas!.style.pointerEvents = 'none'; // A vászonon lévő események letiltása
}

// ERASER FUNCTIONALITY
const toggleEraserMode = () => {

    if (isEraserModeActive) {
      // Ha a radír mód aktív, akkor visszaállítjuk az egérkurzort és deaktiváljuk a radírozást
      stopEraserMode();
    } else {
      // Ha a radír mód inaktív, akkor aktiváljuk
      lastX = null; // felejtse el a ceruza állapotát
      lastY = null;
      activateEraserMode();
      removePencilEventlisteners();
      canvas!.style.cursor = 'crosshair';
      setEraserModeActive(true);
      setPencilModeActive(false);
      canvas!.style.pointerEvents = 'auto'; // A vászonon lévő események engedélyezése
    }
  };
  
  const activateEraserMode = () => {
    if (!canvas) {setupCanvas();}
    addEraserEventListeners();
  };

  const erase = (e: MouseEvent | TouchEvent) => {
    e.preventDefault(); // Az alapértelmezett viselkedés letiltása (pl. görgetés)

  if (ctx && canvas && isErasing) {
    let x = 0;
    let y = 0;

    if (e instanceof MouseEvent) {
      // Egér esemény esetén
      x = e.clientX - canvas.offsetLeft;
      y = e.clientY - canvas.offsetTop;
    } else if (e instanceof TouchEvent) {
      // Érintés esemény esetén
      const touch = e.touches[0] || e.changedTouches[0];
      x = (touch?.clientX ?? 0) - canvas.offsetLeft;
      y = (touch?.clientY ?? 0) - canvas.offsetTop;
    }

    // A radírozás megkezdése
    ctx.save(); // Elmentjük a jelenlegi állapotot
    ctx.globalCompositeOperation = 'destination-out'; // Beállítjuk a törlés módját

    if (lastX !== null && lastY !== null) {
      // Ha van előző pontunk, akkor vonalat húzunk
      ctx.beginPath();
      ctx.moveTo(lastX + window.scrollX, lastY + window.scrollY);
      ctx.lineTo(x + window.scrollX, y + window.scrollY);
      ctx.lineWidth = activeEraseSize;
      ctx.stroke(); // A vonal kirajzolása
    }

    // A jelenlegi pontot tároljuk a következő vonalhoz
    lastX = x;
    lastY = y;

    ctx.restore(); // Visszaállítjuk az eredeti állapotot
    }
  };
  
  const startErasing = () => {
    isErasing = true;
  };
  
  const stopErasing = () => {
    isErasing = false;
    lastX = null;
    lastY = null;
  };
  
 const setEraserSize = (size: number) => {
    activeEraseSize = size;
};


const setEraserModeActive = (value: boolean) => {
  isEraserModeActive = value;
}

const getEraserModeActive = () => {
  return isEraserModeActive;
}

const stopPencilMode = () => {
  canvas!.style.cursor = 'default'; // Alapértelmezett egérkurzor
  removePencilEventlisteners();
  setPencilModeActive(false);
  canvas!.style.pointerEvents = 'none'; // A vászonon lévő események letiltása
}
  
// PENCIL FUNCTIONALITY
const togglePencilMode = () => {
  if (isPencilModeActive) {
    // Ha a ceruza mód aktív, akkor visszaállítjuk az egérkurzort és deaktiváljuk a rajzolást
    stopPencilMode();
  } else {
    // Ha a ceruza mód inaktív, akkor aktiváljuk
    activatePencilMode();
    removeEraserEventlisteners();
    canvas!.style.cursor = 'crosshair'; // Ceruza kurzor
    setPencilModeActive(true);
    setEraserModeActive(false);
    canvas!.style.pointerEvents = 'auto'; // A vászonon lévő események engedélyezése
  }
};

const setPencilSize = (size: number) => {
  activeSize = size;
  if (ctx) {
    ctx.lineWidth = size;
  }
}

const setPencilColor = (color: string) => {
  activeColor = color;
  if (ctx) {
    ctx.strokeStyle = activeColor;
  }
}

const activatePencilMode = () => {
  if (!canvas) {
    setupCanvas();
  }
  if (ctx) {
    // Beállítjuk a rajzolás alapértelmezett tulajdonságait
    ctx.strokeStyle = activeColor; //#1974D2
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = activeSize;
  }
  addPencilEventListeners();
};

const draw = (e: MouseEvent | TouchEvent) => {
  e.preventDefault(); // Az alapértelmezett viselkedés letiltása (pl. görgetés)
  if (!isDrawing || !ctx) return; // Ha nem rajzolunk, lépjünk ki

      let offsetX = 0;
      let offsetY = 0;

      // Egér esemény esetén
      if (e instanceof MouseEvent) {
          offsetX = e.offsetX;
          offsetY = e.offsetY;
      }
        // Érintés esemény esetén
      else if (e instanceof TouchEvent) {
      const touch = e.touches[0] || e.changedTouches[0];
      offsetX = touch.clientX - canvas!.offsetLeft;
      offsetY = touch.clientY - canvas!.offsetTop;
  }
      ctx.beginPath();             // Kezdünk egy új útvonalat
      if (lastX !== null && lastY !== null) {
          ctx.moveTo(lastX, lastY);     // Rajzolás a korábbi pozícióból
      }
      ctx.lineTo(offsetX, offsetY); // Rajzolás az új pozícióig
      ctx.stroke();                 // Vonal megjelenítése
      [lastX, lastY] = [offsetX, offsetY]; // Frissítjük az utolsó pozíciót
};

const startDrawing = (e: MouseEvent | TouchEvent) => {
  isDrawing = true;

  if (e instanceof MouseEvent) {
    // Egér esemény esetén
    [lastX, lastY] = [e.offsetX, e.offsetY];
  } else if (e instanceof TouchEvent) {
    // Érintés esemény esetén
    const touch = e.touches[0] || e.changedTouches[0];
    [lastX, lastY] = [
      (touch?.clientX ?? 0) - canvas!.offsetLeft,
      (touch?.clientY ?? 0) - canvas!.offsetTop
    ];
  }
};

const stopDrawing = () => {
  isDrawing = false;
  [lastX, lastY] = [null, null];
};

const setPencilModeActive = (value: boolean) => {
  isPencilModeActive = value;
};

const getPencilModeActive = () => {
  return isPencilModeActive;
};

const getCTXColor = () => {
  return ctx!.strokeStyle;
}

const getEraserSize = () => {
  return activeEraseSize;
}

const getPencilSize = () => {
  return activeSize;
}

const savePageURLToChromeStorageDraw = (url: string) => {
  chrome.storage.local.get({ modifiedPages: [] }, (result) => {
      const pages = result.modifiedPages as string[];

      if (!pages.includes(url)) {
          pages.push(url);

          chrome.storage.local.set({ modifiedPages: pages }, () => {
              console.log(`Page URL saved to Chrome Storage: ${url}`);
          });
      }
  });
};

/* INDEXEDDB */

const openDrawingsDatabase = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
      const request = indexedDB.open('siteNotesDB');

      request.onupgradeneeded = (event: any) => {
          const db = event.target.result;

          // Ellenőrizzük, hogy az drawings tábla létezik-e, ha nem, hozzuk létre
          if (!db.objectStoreNames.contains('drawings')) {
              db.createObjectStore('drawings', { keyPath: 'id' });
              console.log(`Object store "${'drawings'}" created.`);
          }
      };

      request.onsuccess = () => {
          const db = request.result;

          // Ha új oldalra nyitjuk az adatbázist, ellenőrizzük újra az drawings táblát
          if (!db.objectStoreNames.contains('drawings')) {
              const version = db.version + 1; // Verzió emelése szükséges új tábla létrehozásához
              db.close();

              const upgradeRequest = indexedDB.open('siteNotesDB', version);
              upgradeRequest.onupgradeneeded = (upgradeEvent: any) => {
                  const upgradeDb = upgradeEvent.target.result;

                  if (!upgradeDb.objectStoreNames.contains('drawings')) {
                      upgradeDb.createObjectStore('drawings', { keyPath: 'id' });
                      console.log(`Object store "${'drawings'}" created during upgrade.`);
                  }
              };

              upgradeRequest.onsuccess = () => resolve(upgradeRequest.result);
              upgradeRequest.onerror = (event: any) => reject(event.target.error);
          } else {
              resolve(db); // Az adatbázis már tartalmazza a 'drawings' táblát
          }
      };

      request.onerror = (event: any) => {
          reject(event.target.error);
      };
    });
};

const loadCanvasDrawing = async (): Promise<void> => {
  const db = await openDrawingsDatabase();
  const transaction = db.transaction('drawings', 'readonly');
  const store = transaction.objectStore('drawings');
  const request = store.get(window.location.href);

  return new Promise((resolve, reject) => {
      request.onsuccess = () => {
          const result = request.result;
          if (result && result.data && canvas && ctx) {
              const img = new Image();
              img.src = result.data;
              img.onload = () => {
                  ctx!.drawImage(img, 0, 0);
                  resolve();
              };
          } else {
              resolve(); // Nem volt mentett adat
          }
      };

      request.onerror = () => reject(request.error);
  });
};

const saveCanvasDrawing = async (): Promise<void> => {
  if (!canvas) return;

  const dataURL = canvas.toDataURL();
  const drawingData = {
      id: window.location.href,
      data: dataURL,
  };

  try {
      await saveDrawingData('drawings', drawingData);
      console.log('Rajz mentve!');
  } catch (error) {
      console.error('Rajz mentése sikertelen:', error);
  }
};

const saveDrawingData = async (storeName: string, data: any): Promise<void> => {
  const db = await openDrawingsDatabase();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);

  // Add or update the data based on the ID
  store.put(data);
  savePageURLToChromeStorageDraw(window.location.href);
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};


window.addEventListener('load', async () => {
  await setupCanvas();
});

const checkAndRemoveURLIfEmpty = async () => {
  const db = await openDrawingsDatabase();
  const storeNames = ['images', 'highlighter', 'drawings', 'notes'];
  const currentURL = window.location.href;
  
  const allEmpty = await Promise.all(
    storeNames.map(storeName => {
      return new Promise<boolean>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(currentURL);
        request.onsuccess = () => {
          resolve(!request.result);
        };
        request.onerror = () => reject(request.error);
      });
    })
  ).then(results => results.every(isEmpty => isEmpty));

  if (allEmpty) {
    chrome.storage.local.get({ modifiedPages: [] }, (result) => {
      const pages = result.modifiedPages as string[];
      const index = pages.indexOf(currentURL);
      if (index !== -1) {
        pages.splice(index, 1);
        chrome.storage.local.set({ modifiedPages: pages }, () => {
          console.log(`Page URL removed from Chrome Storage: ${currentURL}`);
        });
      }
    });
  }
};

window.addEventListener('beforeunload', checkAndRemoveURLIfEmpty);
window.addEventListener('beforeunload', async () => {
  await saveCanvasDrawing();
});

  export { 
    togglePencilMode, 
    toggleEraserMode, 
    setEraserSize, 
    getEraserModeActive, 
    setEraserModeActive, 
    setPencilModeActive, 
    getPencilModeActive, 
    stopEraserMode,
    stopPencilMode,
    clearCanvas,
    setPencilSize,
    setPencilColor,
    getCTXColor,
    getEraserSize,
    getPencilSize
  };