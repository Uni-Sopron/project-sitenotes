let isHighlighterModeActive = false;
let isdeleteHighlighter = false;
let activeColor: string = '#6969C0';

const setisdeleteHighlighter = (value: boolean) => {
  isdeleteHighlighter = value;
};

const stopHighlighterMode = () => {
  document.body.style.cursor = 'default';
  document.removeEventListener('mouseup', highlightSelection);
  isHighlighterModeActive = false;
}

// HIGHLIGHTER FUNCTIONALITY
const startHighlighterMode = () => {
  // Mód aktiválása
  document.body.style.cursor = 'text';
  document.addEventListener('mouseup', highlightSelection);
  isHighlighterModeActive = true;
};

const setisHighlighterModeActive = (value: boolean) => {
  isHighlighterModeActive = value;
};

const getisHighlighterModeActive = () => {
  return isHighlighterModeActive;
}
const setHighlighterColor = (color: string) => {
  activeColor = color;
  if (isHighlighterModeActive) {
    const highlight = document.createElement('mark');
    highlight.style.backgroundColor = activeColor;
  }
};

const highlightSelection = async () => {
  if (!isHighlighterModeActive) return;
  const selection = window.getSelection();
  console.log("ez a kiemelés.", selection);
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);

    const highlight = document.createElement('mark');
    highlight.style.backgroundColor = activeColor;
    highlight.addEventListener('click', removeHighlight);
    highlight.addEventListener('mouseenter', onHighlightMouseEnter);
    highlight.addEventListener('mouseleave', onHighlightMouseLeave);
    try {
      range.surroundContents(highlight);
      await saveHighlightToDB(range, activeColor);
    } catch (e) {
      console.error('Nem lehetett körbevenni a tartalmat:', e);
    }
  }
};

const onHighlightMouseEnter = (event: MouseEvent): void => {
  if (isdeleteHighlighter) {
    const target = event.currentTarget as HTMLElement;

    // Eredeti szín eltárolása
    if (!target.dataset.originalColor) {
      target.dataset.originalColor = target.style.backgroundColor;
    }

    // Háttérszín beállítása a komplementer színre
    target.style.backgroundColor = '#D4D4D4'
  }
};

const onHighlightMouseLeave = (event: MouseEvent): void => {
  if (isdeleteHighlighter) {
    const target = event.currentTarget as HTMLElement;
    const originalColor = target.dataset.originalColor || activeColor;
    target.style.backgroundColor = originalColor;
  }
};

const removeHighlight = async (event: MouseEvent): Promise<void> => {
  if (isdeleteHighlighter) {
    const target = event.currentTarget as HTMLElement;
    const parent = target.parentNode;
    const id = target.dataset.highlightId;

    if (parent && id) {
      while (target.firstChild) {
        const child = target.firstChild;
        parent.insertBefore(child, target);
      }

      parent.removeChild(target);
      await removeHighlightFromDB(id);
    }
  } else {
    console.log("nincs bekapcsolva a törlés");
  }
};

  // KELL MAJD A TÖBBINEK IS HASONLÓAN: HA NEM LÉTEZIK TÁBLA, HOZZA LÉTRE
  const openHighlighterDatabase = async (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('siteNotesDB');

        request.onupgradeneeded = (event: any) => {
            const db = event.target.result;

            // Ellenőrizzük, hogy az `highlighter` tábla létezik-e, ha nem, hozzuk létre
            if (!db.objectStoreNames.contains('highlighter')) {
                db.createObjectStore('highlighter', { keyPath: 'id' });
                console.log(`Object store "${'highlighter'}" created.`);
            }
        };

        request.onsuccess = () => {
            const db = request.result;

            // Ha új oldalra nyitjuk az adatbázist, ellenőrizzük újra az `highlighter` táblát
            if (!db.objectStoreNames.contains('highlighter')) {
                const version = db.version + 1; // Verzió emelése szükséges új tábla létrehozásához
                db.close();

                const upgradeRequest = indexedDB.open('siteNotesDB', version);
                upgradeRequest.onupgradeneeded = (upgradeEvent: any) => {
                    const upgradeDb = upgradeEvent.target.result;

                    if (!upgradeDb.objectStoreNames.contains('highlighter')) {
                        upgradeDb.createObjectStore('highlighter', { keyPath: 'id' });
                        console.log(`Object store "${'highlighter'}" created during upgrade.`);
                    }
                };

                upgradeRequest.onsuccess = () => resolve(upgradeRequest.result);
                upgradeRequest.onerror = (event: any) => reject(event.target.error);
            } else {
                resolve(db); // Az adatbázis már tartalmazza a `'highlighter'` táblát
            }
        };

        request.onerror = (event: any) => {
            reject(event.target.error);
        };
    });
};

// Save or update Highlighter data in a store
const saveHighlighterData = async (storeName: string, data: any): Promise<void> => {
  const db = await openHighlighterDatabase();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);

  // Add or update the data based on the ID
  store.put(data);
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};

const getHighlighterData = async (key: string): Promise<any> => {
  const db = await openHighlighterDatabase();
  const transaction = db.transaction('highlighter', 'readonly');
  const store = transaction.objectStore('highlighter');

  const request = store.get(key);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};

// XPath generálása egy elemhez
const generateXPath = (element: Node): string => {
  if (element.nodeType === Node.TEXT_NODE) {
    element = element.parentNode!;
  }
  const parts: string[] = [];
  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let index = 1;
    let sibling = element.previousSibling;
    while (sibling) {
      if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === element.nodeName) {
        index++;
      }
      sibling = sibling.previousSibling;
    }
    const tagName = element.nodeName.toLowerCase();
    const part = index > 1 ? `${tagName}[${index}]` : tagName;
    parts.unshift(part);
    element = element.parentNode!;
  }
  return parts.length ? `/${parts.join('/')}` : '';
};

const saveHighlightToDB = async (range: Range, color: string) => {
  const selectedText = range.toString();
  const url = window.location.href;
  const xpath = generateXPath(range.startContainer);
  const highlightData = {
    id: Date.now(), // Egyedi azonosító
    url,
    text: selectedText,
    color,
    xpath,
  };

  // Ellenőrizzük, hogy már létezik-e
  const existing = await getHighlighterData(highlightData.id.toString());
  if (!existing) {
    await saveHighlighterData('highlighter', highlightData);
  }
};

const removeHighlightFromDB = async (id: string) => {
  const db = await openHighlighterDatabase();
  const transaction = db.transaction('highlighter', 'readwrite');
  const store = transaction.objectStore('highlighter');

  store.delete(id);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve(undefined);
    transaction.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};

const restoreHighlights = async () => {
  const url = window.location.href;
  const db = await openHighlighterDatabase();
  const transaction = db.transaction('highlighter', 'readonly');
  const store = transaction.objectStore('highlighter');

  const highlights = await new Promise<any[]>((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const data = request.result.filter((item: any) => item.url === url);
      resolve(data);
    };
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });

  highlights.forEach((highlight) => {
    const range = document.evaluate(highlight.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (range) {
      const mark = document.createElement('mark');
      mark.style.backgroundColor = highlight.color;
      mark.textContent = highlight.text;
      mark.dataset.highlightId = highlight.id; // Hozzáadjuk az egyedi ID-t
      mark.addEventListener('click', removeHighlight);
      range.parentNode?.replaceChild(mark, range);
    }
  });  
};

window.addEventListener('load', async () => {
  console.log('Page fully loaded. Restoring marked texts...');
  await restoreHighlights();
  console.log('Marked texts have been successfully loaded.');
});

export {
  startHighlighterMode,
  setisdeleteHighlighter,
  stopHighlighterMode,
  setisHighlighterModeActive,
  getisHighlighterModeActive,
  setHighlighterColor
};