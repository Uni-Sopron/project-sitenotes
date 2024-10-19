let isHighlighterModeActive = false;
let highlighterButton: HTMLButtonElement | null = null; // Declare a variable to store the highlighter button element
// HIGHLIGHTER FUNCTIONALITY
//Kiszinezi sárgával a kijelölt szöveget (egyenlőre csak 1 szinnel müködik)
const toggleHighlighterMode = () => {
  if (isHighlighterModeActive) {
      // Mód deaktiválása
      document.body.style.cursor = 'default';
      document.removeEventListener('mouseup', highlightSelection);
      isHighlighterModeActive = false;
      updateHighlighterButtonOpacity('1'); // Visszaállítja az átlátszóságot
  } else {
      // Mód aktiválása
      document.body.style.cursor = 'text';
      document.addEventListener('mouseup', highlightSelection);
      isHighlighterModeActive = true;
      updateHighlighterButtonOpacity('0.5'); // Szürke átlátszóság
  }
};

const updateHighlighterButtonOpacity = (opacity: string) => {
  if (highlighterButton) {
      const img = highlighterButton.querySelector('img') as HTMLImageElement;
      img.style.opacity = opacity; // Átlátszóság beállítása
  }
};

const setHighlighterButton = (button: HTMLButtonElement) => {
  highlighterButton = button; // Beállítja a gomb hivatkozást
};

  // Function to highlight selected text    # ez még mindig tördeli a sorokat!!!!!:(
  const highlightSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return; // No selection, exit

    // Loop through all the ranges in the selection
    for (let i = 0; i < selection.rangeCount; i++) {
        const range = selection.getRangeAt(i);
        const span = document.createElement('span');
        span.style.backgroundColor = 'yellow'; // Set highlight color
        
        // Use a DocumentFragment to avoid breaking HTML structure
        const documentFragment = range.cloneContents();
        span.appendChild(documentFragment); // Append the cloned contents to the span
        
        // Replace the range with the new span
        range.deleteContents(); // Remove the original content
        range.insertNode(span); // Insert the highlighted span
    }
};
  

  export { toggleHighlighterMode, updateHighlighterButtonOpacity, setHighlighterButton };