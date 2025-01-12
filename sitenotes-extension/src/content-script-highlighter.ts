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

const stopHighlighterMode = () => {
  document.body.style.cursor = 'default';
  document.removeEventListener('mouseup', highlightSelection);
  isHighlighterModeActive = false;
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    link.removeEventListener('click', preventLinkClick, true);
  });
}
const preventLinkClick = (event: MouseEvent) => {
  if (isHighlighterModeActive || isdeleteHighlighter) {
    event.preventDefault();
    event.stopPropagation();
   
  }
};
// HIGHLIGHTER FUNCTIONALITY
//Kiszinezi sárgával a kijelölt szöveget (egyenlőre csak 1 szinnel müködik)
const startHighlighterMode = () => {
  // Mód aktiválása
  document.body.style.cursor = 'text';
  document.addEventListener('mouseup', highlightSelection);
  isHighlighterModeActive = true;
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', preventLinkClick, true);
  });
};

const setisHighlighterModeActive = (value: boolean) => {
  isHighlighterModeActive = value;
};

const getisHighlighterModeActive = () => {
  return isHighlighterModeActive;
}
const getisdeleteHighlighter = () => {
  return isdeleteHighlighter;
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
  setHighlighterColor,
  getisdeleteHighlighter
};

