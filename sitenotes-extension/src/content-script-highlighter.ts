let isHighlighterModeActive = false;
let isdeleteHighlighter = false;
let activeColor: string = '#6969C0';

const setisdeleteHighlighter = (value: boolean) => {
  isdeleteHighlighter = value;
  const links = document.querySelectorAll('a');
  if (isdeleteHighlighter) {
    links.forEach(link => link.addEventListener('click', preventLinkClick, true));
  } else {
    links.forEach(link => link.removeEventListener('click', preventLinkClick, true));
  }
};

const preventLinkClick = (event: MouseEvent) => {
  if (isHighlighterModeActive || isdeleteHighlighter) {
    event.preventDefault();
    event.stopPropagation(); 
  }
};

const stopHighlighterMode = () => {
  document.body.style.cursor = 'default';
  document.removeEventListener('mouseup', highlightSelection);
  isHighlighterModeActive = false;
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', preventLinkClick, true);
  });
}

// HIGHLIGHTER FUNCTIONALITY
//Kiszinezi sárgával a kijelölt szöveget (egyenlőre csak 1 szinnel müködik)
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

const highlightSelection = () => {
  if (!isHighlighterModeActive) return;

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);
    const text = range.toString().trim();

    if (!text) return;

    const highlight = document.createElement('mark');
    highlight.style.backgroundColor = activeColor;
    highlight.addEventListener('click', removeHighlight);
    highlight.addEventListener('mouseenter', onHighlightMouseEnter);
    highlight.addEventListener('mouseleave', onHighlightMouseLeave);

    try {
      const container = range.commonAncestorContainer.parentElement;
      range.surroundContents(highlight);

      if (container) {
        saveHighlightToDB(container, activeColor, text, range.startOffset, range.endOffset);
      }
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

    // // Komplementer szín kiszámítása
    // const originalColor = target.style.backgroundColor || 'rgb(255, 255, 0)'; // Default sárga
    // const complementaryColor = getComplementaryColor(originalColor);

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

const removeHighlight = async (event: MouseEvent) => {
  if (!isdeleteHighlighter) return;

  const target = event.currentTarget as HTMLElement;
  const text = target.textContent?.trim();

  if (!text) {
    console.warn('No text found for highlight.');
    return;
  }

  try {
    const db = await openHighlighterDatabase();
    const transaction = db.transaction('highlighter', 'readwrite');
    const store = transaction.objectStore('highlighter');

    const highlightsRequest = store.getAll();

    highlightsRequest.onsuccess = () => {
      const highlights = highlightsRequest.result;
      highlights.forEach((highlight: any) => {
        if (highlight.text === text) {
          store.delete(highlight.id);
          console.log(`Highlight removed from DB: ${highlight.id}`);
        }
      });
    };

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error removing highlight from DB:', error);
    return;
  }

  // Remove from DOM
  const parent = target.parentNode;
  if (parent) {
    while (target.firstChild) {
      parent.insertBefore(target.firstChild, target);
    }
    parent.removeChild(target);
  }
};

const saveHighlightToDB = async (element: HTMLElement, color: string, text: string, startOffset: number, endOffset: number) => {
  const db = await openHighlighterDatabase();
  const transaction = db.transaction('highlighter', 'readwrite');
  const store = transaction.objectStore('highlighter');

  const uniqueSelector = getUniqueSelector(element);

  const highlightData = {
    id: `${text}-${color}-${Date.now()}`, // Egyedi azonosító
    selector: uniqueSelector, // Egyedi szelektor a szülőelemre
    color, // A kiemelés színe
    text, // A kijelölt szöveg
    startOffset, // A szöveg kezdő pozíciója
    endOffset, // A szöveg végpozíciója
  };

  store.put(highlightData);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve(undefined);
    transaction.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};

const getUniqueSelector = (element: HTMLElement): string => {
  if (!element) return '';
  let path = '';
  let current: HTMLElement | null = element;

  while (current) {
    let selector = current.tagName.toLowerCase();
    if (current.id) {
      selector += `#${current.id}`;
      path = `${selector} ${path}`;
      break;
    } else {
      let siblingIndex = 1;
      let sibling = current.previousElementSibling;
      while (sibling) {
        if (sibling.tagName === current.tagName) siblingIndex++;
        sibling = sibling.previousElementSibling;
      }
      selector += `:nth-of-type(${siblingIndex})`;
    }
    path = `${selector} ${path}`;
    current = current.parentElement;
  }
  return path.trim();
};




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
const restoreHighlightsFromDB = async () => {
  const db = await openHighlighterDatabase();
  const transaction = db.transaction('highlighter', 'readonly');
  const store = transaction.objectStore('highlighter');

  const request = store.getAll();

  request.onsuccess = () => {
    const highlights = request.result;

    highlights.forEach((highlight: any) => {
      const { selector, color, text } = highlight;
      const element = document.querySelector(selector);

      if (element) {
        const nodes = getTextNodesIn(element);
        nodes.forEach((node) => {
          const nodeText = node.nodeValue || '';
          const startIndex = nodeText.indexOf(text);

          if (startIndex !== -1) {
            const range = document.createRange();
            range.setStart(node, startIndex);
            range.setEnd(node, startIndex + text.length);

            const mark = document.createElement('mark');
            mark.style.backgroundColor = color;
            mark.textContent = text;

            range.deleteContents();
            range.insertNode(mark);

            mark.addEventListener('click', removeHighlight);
            mark.addEventListener('mouseenter', onHighlightMouseEnter);
            mark.addEventListener('mouseleave', onHighlightMouseLeave);
          }
        });
      }
    });
  };

  request.onerror = (event) => {
    console.error('Failed to restore highlights:', (event.target as IDBRequest)?.error);
  };
};

// Segéd függvény a szöveg node-ok begyűjtéséhez
const getTextNodesIn = (node: Node): Text[] => {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(
    node,
    NodeFilter.SHOW_TEXT,
    null
  );

  let currentNode = walker.nextNode();
  while (currentNode) {
    textNodes.push(currentNode as Text);
    currentNode = walker.nextNode();
  }

  return textNodes;
};

window.addEventListener('load', async () => {
  await restoreHighlightsFromDB();
  console.log('Highlights restored.');
});

export {
  startHighlighterMode,
  setisdeleteHighlighter,
  stopHighlighterMode,
  setisHighlighterModeActive,
  getisHighlighterModeActive,
  setHighlighterColor
};
