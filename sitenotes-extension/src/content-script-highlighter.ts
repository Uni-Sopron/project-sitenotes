// Ide kerül a highlighter kódja, ami a kijelölt szöveget kiemeli a weboldalon.

let isHighlighterModeActive = false;

// HIGHLIGHTER FUNCTIONALITY
//Kiszinezi sárgával a kijelölt szöveget (egyenlőre csak 1 szinnel müködik)
const toggleHighlighterMode = () => {
    if (isHighlighterModeActive) {
      // Deactivate highlighter mode
      document.body.style.cursor = 'default'; // Reset cursor
      document.removeEventListener('mouseup', highlightSelection);
      isHighlighterModeActive = false;
    } else {
      // Activate highlighter mode
      document.body.style.cursor = 'text'; // Set cursor to indicate selection mode
      document.addEventListener('mouseup', highlightSelection);
      isHighlighterModeActive = true;
    }
  };
  
  // Function to highlight selected text
  const highlightSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return; // No selection, exit
  
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.backgroundColor = 'yellow'; // Set highlight color
    span.appendChild(range.extractContents()); // Extract the selected content
    range.insertNode(span); // Insert the highlighted content
  };
  

  export { toggleHighlighterMode };
  
