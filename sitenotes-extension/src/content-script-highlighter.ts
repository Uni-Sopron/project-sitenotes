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
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

  const range = selection.getRangeAt(0);
  const text = range.toString();

  if (!text.trim()) return; // Üres szöveg

  const color = activeColor;

  // Kiemelés létrehozása
  const mark = createHighlightElement(text, color);
  range.deleteContents();
  range.insertNode(mark);

  // Mentés az adatbázisba
  await savePageContentToDB(); // Teljes tartalom mentése szűrten
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
  const target = event.currentTarget as HTMLElement;
  const parent = target.parentNode;
  const id = target.dataset.highlightId;

  if (parent && id) {
    // Szöveg visszaállítása az eredeti állapotába
    const text = target.textContent || '';
    const textNode = document.createTextNode(text);

    parent.replaceChild(textNode, target);

    // Törlés az adatbázisból
    try {
      await removeHighlightFromDB(id);
      console.log(`Highlight with ID ${id} deleted.`);
    } catch (error) {
      console.error(`Failed to delete highlight from DB: ${error}`);
    }
  } else {
    console.error("Failed to delete highlight. Parent or ID not found.");
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

const savePageContentToDB = async () => {
  // Hozzunk létre egy másolatot a `document.body` tartalmáról
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = document.body.innerHTML;

  // Az eltávolítandó elemek kiválasztása és eltávolítása
  const highlighterMenu = tempDiv.querySelector('#highlighterMenu');
  if (highlighterMenu) {
    highlighterMenu.remove();
  }

  // Más szükségtelen elemek eltávolítása (ha vannak ilyenek)
  const unwantedSelectors = ['#toolbar-shadow-host', '[id^="shadowHost"]'];
  unwantedSelectors.forEach((selector) => {
    const elements = tempDiv.querySelectorAll(selector);
    elements.forEach((el) => {
      el.remove();
    });
  });

  // Tisztított HTML szöveg
  const cleanedHTML = tempDiv.innerHTML;

  // Mentés IndexedDB-be
  const db = await openHighlighterDatabase();
  const transaction = db.transaction('highlighter', 'readwrite');
  const store = transaction.objectStore('highlighter');

  const pageData = {
    id: 'pageContent', // Egyedi azonosító az oldal tartalmához
    url: window.location.href,
    content: cleanedHTML, // Csak a megtisztított tartalom kerül mentésre
  };

  store.put(pageData);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve(undefined);
    transaction.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};

// Kiemelés létrehozása
const createHighlightElement = (text: string, color: string): HTMLElement => {
  const mark = document.createElement('mark');
  mark.textContent = text;
  mark.style.backgroundColor = color;
  mark.addEventListener('click', removeHighlight);
  mark.addEventListener('mouseenter', onHighlightMouseEnter);
  mark.addEventListener('mouseleave', onHighlightMouseLeave);
  return mark;
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

const restorePageContent = async () => {
  const db = await openHighlighterDatabase();
  const transaction = db.transaction('highlighter', 'readonly');
  const store = transaction.objectStore('highlighter');

  const pageData = await new Promise<any>((resolve, reject) => {
    const request = store.get('pageContent');
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });

  if (pageData && pageData.url === window.location.href) {
    document.body.innerHTML = pageData.content;

    // Ellenőrizzük, hogy ne maradjon `highlighterMenu` az ID-val rendelkező elem
    const highlighterMenu = document.querySelector('#highlighterMenu');
    if (highlighterMenu) {
      highlighterMenu.remove();
    }

    console.log('Page content restored and cleaned.');
  }
};

window.addEventListener('load', async () => {
  console.log('Page fully loaded. Restoring marked texts...');
  await restorePageContent();
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