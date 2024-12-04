let isHighlighterModeActive = false;
let isdeleteHighlighter = false;


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


// Function to highlight selected text 
const highlightSelection = () => {
  if (!isHighlighterModeActive) return; // If highlighter mode is not active, exit
  const selection = window.getSelection();
  console.log("ez a kiemelés.", selection);
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return; // No selection, exit

  // Loop through all the ranges in the selection
  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);
    // Ha nincs meglévő kiemelés, alkalmazzunk közvetlen stílust
    const highlight = document.createElement('mark'); // Vagy használhatsz divet is
    highlight.style.backgroundColor = 'yellow'; // Állítsuk be a háttérszínt
    highlight.addEventListener('click', removeHighlight);
    highlight.addEventListener('mouseenter', onHighlightMouseEnter);
    highlight.addEventListener('mouseleave', onHighlightMouseLeave);
    try {
      // Beágyazzuk a kijelölt tartalom köré a highlight elemet
      range.surroundContents(highlight);
    } catch (e) {
      console.error('Nem lehetett körbevenni a tartalmat:', e);
    }
  }
};






const onHighlightMouseEnter = (event: MouseEvent): void => {
  if (isdeleteHighlighter) {
    const target = event.currentTarget as HTMLElement;
    target.style.backgroundColor = 'red'; // Change color to red on hover in delete mode
  }
};

const onHighlightMouseLeave = (event: MouseEvent): void => {
  if (isdeleteHighlighter) {
    const target = event.currentTarget as HTMLElement;
    target.style.backgroundColor = 'yellow'; // Revert color to yellow when mouse leaves
  }
};

//todo: tördeli a szöveget ezzel a mentésnél lesz probléma. 
//      Az eredeti szöveg tartalmaz linket/hivatkozást akkor azok elvesznek 
//      el kell menteni az eredeti formáját
// css ha ráviszem az egeret akkor elszineződik a kijelölés

const removeHighlight = (event: MouseEvent): void => {
  if (isdeleteHighlighter) {
    const target = event.currentTarget as HTMLElement; // Az aktuális 'mark' elem
    const parent = target.parentNode;

    if (parent) {
      // Ellenőrizzük, hogy a 'mark' elemnek van-e gyermeke
      while (target.firstChild) {
        // Klónozzuk a gyerek elemeket az eredeti formátumuk megőrzéséhez
        const child = target.firstChild;
        parent.insertBefore(child, target); // Behelyezzük a szülőbe a kijelölés előtt
      }

      // Végül távolítsuk el az üres 'mark' elemet
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
  getisHighlighterModeActive
};

