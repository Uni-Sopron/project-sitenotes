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
    } catch (e) {
      console.error('Nem lehetett körbevenni a tartalmat:', e);
    }
  }
};



// // Segédfüggvény a komplementer szín kiszámításához
// const getComplementaryColor = (color: string): string => {
//   // Szín beolvasása és RGB komponensekre bontása
//   const rgbMatch = color.match(/\d+/g);
//   if (rgbMatch && rgbMatch.length === 3) {
//     const [r, g, b] = rgbMatch.map(Number); // Piros, zöld, kék komponensek
//     const compR = 255 - r; // Komplementer piros
//     const compG = 255 - g; // Komplementer zöld
//     const compB = 255 - b; // Komplementer kék
//     return `rgb(${compR}, ${compG}, ${compB})`;
//   }
//   // Ha nem sikerült a színt feldolgozni, visszaadjuk alapértelmezetten a fehéret
//   return 'rgb(255, 255, 255)';
// };

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



const removeHighlight = (event: MouseEvent): void => {
  if (isdeleteHighlighter) {
    const target = event.currentTarget as HTMLElement;
    const parent = target.parentNode;

    if (parent) {

      while (target.firstChild) {

        const child = target.firstChild;
        parent.insertBefore(child, target);
      }


      parent.removeChild(target);
    }
  } else {
    console.log("nincs bekapcsolva a törlés");
  }
};

export {
  startHighlighterMode,
  setisdeleteHighlighter,
  stopHighlighterMode,
  setisHighlighterModeActive,
  getisHighlighterModeActive,
  setHighlighterColor
};
