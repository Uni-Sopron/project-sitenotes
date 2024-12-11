import { togglePencilMode, toggleEraserMode, setEraserSize, setEraserModeActive, stopEraserMode, stopPencilMode, setPencilModeActive, clearCanvas, setPencilSize, setPencilColor } from './content-script-draw';
import { handleImageUpload } from './content-script-img';
import { startHighlighterMode, setisdeleteHighlighter, stopHighlighterMode, setisHighlighterModeActive } from './content-script-highlighter';
let toolbar: HTMLDivElement | null = null;
let eraserMenu: HTMLDivElement | null = null;
let pencilMenu: HTMLDivElement | null = null;
let highlighterMenu: HTMLDivElement | null = null;
let activeButton: string | null = null;
let highlighterButton: HTMLButtonElement | null = null;
let deleteHighlighterButton: HTMLButtonElement | null = null;
let isVertical = false;
let isMovable = false;

const startProcess = (buttonId: string) => {
  console.log(activeButton);

  if (activeButton) {
    setButtonOpacity(activeButton, 1);
    stopProcess();

    if (activeButton === buttonId) {
      activeButton = null
      return;
    }
  }
  activeButton = buttonId;
  setButtonOpacity(buttonId, 0.5);

  // A gomb ID-jának alapján indítsd el a megfelelő folyamatot
  switch (buttonId) {
    case 'pencil-button':
      togglePencilButton();
      break;
    case 'highlighter-button':
      toggleHighlighterButton();
      break;
    case 'eraser-button':
      toggleEraserButton();
      break;
    case 'move-button':
      isMovable = true;
      break
  }
};

const stopProcess = () => {
  // állítsd le a jelenlegi folyamatot

  switch (activeButton) {
    case 'pencil-button':
      // Ceruza kikapcsoló
      stopPencilMode();
      setPencilModeActive(false);
      pencilMenu!.style.display = 'none';

      break;
    case 'highlighter-button':
      // Highlighter kikapcsoló
      setisHighlighterModeActive(false);
      stopHighlighterMode();
      highlighterMenu!.style.display = 'none';
      highlighterButton!.style.backgroundColor = '#f8f9fa';
      deleteHighlighterButton!.style.backgroundColor = '#f8f9fa';

      break;
    case 'eraser-button':
      // Radír kikapcsoló
      setEraserModeActive(false);
      stopEraserMode(); // csúnya, de megoldás h ne radírozzon
      eraserMenu!.style.display = 'none';

      break;
    case 'move-button':
      // Mozgatás kikapcsoló
      isMovable = false;

      break;
  }
};

const setButtonOpacity = (buttonId: string, opacity: number): void => {
  const button = toolbar?.querySelector(`.${buttonId}`) as HTMLImageElement;
  if (button) {
    button.style.opacity = `${opacity}`;
  }
}



const setColorIcon = (buttonId: string, color: string) => {
  // A gomb színének beállítása
  setPencilColor(color);

  const button = toolbar?.querySelector(`.${buttonId}`) as HTMLImageElement;
  if (button) {
    button.style.backgroundColor = color;    
  }

}

// TOOLBAR FUNCTIONALITY
const createToolbar = () => {
  const shadowHost = document.createElement('div');
  shadowHost.id = 'toolbar-shadow-host';
  document.body.appendChild(shadowHost);
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('toolbar.css');
  shadowRoot.appendChild(link);

  toolbar = document.createElement('div');
  toolbar.id = 'myToolbar';
  toolbar.className = isVertical ? 'rounded-rectangle vertical' : 'rounded-rectangle horizontal';
  toolbar.style.position = 'fixed';
  toolbar.style.top = '100px';
  toolbar.style.left = '100px';
  toolbar.style.display = 'flex';
  toolbar.style.padding = '10px';
  toolbar.style.gap = '10px';
  toolbar.style.border = '1px solid black';
  toolbar.style.borderRadius = '15px';
  toolbar.style.backgroundColor = 'white';
  toolbar.style.zIndex = '9999';
  toolbar.style.pointerEvents = 'auto';

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  toolbar.addEventListener('mousedown', (e) => {
    if (isMovable) {
      isDragging = true;
      offsetX = e.clientX - toolbar!.offsetLeft;
      offsetY = e.clientY - toolbar!.offsetTop;
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      let newLeft = e.clientX - offsetX;
      let newTop = e.clientY - offsetY;

      // A toolbar méreteinek figyelembe vétele a forgatás miatt
      const toolbarRect = toolbar!.getBoundingClientRect();
      const toolbarWidth = toolbarRect.width;
      const toolbarHeight = toolbarRect.height;

      // Képernyőméretek
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Ellenőrizzük, hogy a toolbar nem megy túl a képernyő szélén

      // Bal oldal
      if (newLeft < 0) newLeft = 0;

      // Jobb oldal
      if (newLeft + toolbarWidth > screenWidth) {
        newLeft = screenWidth - toolbarWidth;
      }

      // Felső oldal
      if (newTop < 0) newTop = 0;

      // Alsó oldal
      if (newTop + toolbarHeight > screenHeight) {
        newTop = screenHeight - toolbarHeight;
      }

      // Az új pozíció alkalmazása
      toolbar!.style.left = `${newLeft}px`;
      toolbar!.style.top = `${newTop}px`;
    }
  }
  );

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  const toggleLayout = () => {
    isVertical = !isVertical;
    toolbar!.className = isVertical ? 'rounded-rectangle vertical' : 'rounded-rectangle horizontal';
    // Frissítsük a toolbar méreteit és pozícióját
    const toolbarRect = toolbar!.getBoundingClientRect();
    const toolbarWidth = toolbarRect.width;
    const toolbarHeight = toolbarRect.height;

    // Képernyőméretek
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Új pozíció ellenőrzése és korrekciója
    let newLeft = toolbarRect.left;
    let newTop = toolbarRect.top;

    // Ellenőrzés a képernyő bal és jobb szélein
    if (newLeft < 0) newLeft = 0;
    if (newLeft + toolbarWidth > screenWidth) {
      newLeft = screenWidth - toolbarWidth;
    }

    // Ellenőrzés a képernyő felső és alsó szélein
    if (newTop < 0) newTop = 0;
    if (newTop + toolbarHeight > screenHeight) {
      newTop = screenHeight - toolbarHeight;
    }

    // Új pozíció alkalmazása
    toolbar!.style.left = `${newLeft}px`;
    toolbar!.style.top = `${newTop}px`;

    // A folyamat frissítése az új elrendezéshez
    stopProcess();
    activeButton = null;
    updateButtonsConfig();
  };

  const updateButtonsConfig = () => {
    while (toolbar!.firstChild) {
      toolbar!.removeChild(toolbar!.firstChild);
    }

    const buttonsConfig = isVertical
      ? [
        { icon: chrome.runtime.getURL('toolbar-icons/circle.svg'), alt: 'Toggle Layout', onClick: toggleLayout }, // Circle
        { icon: chrome.runtime.getURL('toolbar-icons/move.svg'), alt: 'Move', onClick: () => startProcess('move-button'), className: 'move-button' },
        { icon: chrome.runtime.getURL('toolbar-icons/upload.svg'), alt: 'Upload', onClick: handleImageUpload },
        { icon: chrome.runtime.getURL('toolbar-icons/pencil_with_line.svg'), alt: 'Pencil', onClick: () => startProcess('pencil-button'), className: 'pencil-button' },
        { icon: chrome.runtime.getURL('toolbar-icons/highlighter.svg'), alt: 'Highlighter', onClick: () => startProcess('highlighter-button'), className: 'highlighter-button' },
        { icon: chrome.runtime.getURL('toolbar-icons/color1.svg'), alt: 'Color 1', onClick: () => setColorIcon('color-button-1','#6969C0'), className: 'color-button-1' },
        { icon: chrome.runtime.getURL('toolbar-icons/color2.svg'), alt: 'Color 2', onClick: () => setColorIcon('color-button-2','#BF6969'), className: 'color-button-2' },
        { icon: chrome.runtime.getURL('toolbar-icons/color3.svg'), alt: 'Color 3', onClick: () => setColorIcon('color-button-3','#69BF69'), className: 'color-button-3' },
        { icon: chrome.runtime.getURL('toolbar-icons/eraser.svg'), alt: 'Eraser', onClick: () => startProcess('eraser-button'), className: 'eraser-button' },
      ]
      : [
        { icon: chrome.runtime.getURL('toolbar-icons/upload.svg'), alt: 'Upload', onClick: handleImageUpload },
        { icon: chrome.runtime.getURL('toolbar-icons/pencil_with_line.svg'), alt: 'Pencil', onClick: () => startProcess('pencil-button'), className: 'pencil-button' },
        { icon: chrome.runtime.getURL('toolbar-icons/highlighter.svg'), alt: 'Highlighter', onClick: () => startProcess('highlighter-button'), className: 'highlighter-button' },
        { icon: chrome.runtime.getURL('toolbar-icons/color1.svg'), alt: 'Color 1', onClick: () => setColorIcon('color-button-1','#6969C0'), className: 'color-button-1' },
        { icon: chrome.runtime.getURL('toolbar-icons/color2.svg'), alt: 'Color 2', onClick: () => setColorIcon('color-button-2','#BF6969'), className: 'color-button-2' },
        { icon: chrome.runtime.getURL('toolbar-icons/color3.svg'), alt: 'Color 3', onClick: () => setColorIcon('color-button-3','#69BF69'), className: 'color-button-3' },
        { icon: chrome.runtime.getURL('toolbar-icons/eraser.svg'), alt: 'Eraser', onClick: () => startProcess('eraser-button'), className: 'eraser-button' },
        { icon: chrome.runtime.getURL('toolbar-icons/move.svg'), alt: 'Move', onClick: () => startProcess('move-button'), className: 'move-button' },
        { icon: chrome.runtime.getURL('toolbar-icons/circle.svg'), alt: 'Toggle Layout', onClick: toggleLayout },
      ];

    buttonsConfig.forEach(({ icon, alt, onClick, className }) => {
      const button = document.createElement('button');
      button.className = 'icon-button ' + (className || '');

      const img = document.createElement('img');
      img.src = icon;
      img.alt = alt;

      button.appendChild(img);
      button.onclick = onClick;
      toolbar!.appendChild(button);

      // TODO ocsmány és ronda, de most így oldjuk meg hogy legyen első szín, később módosítjuk
      if (className === 'color-button-1' && button.style.backgroundColor === '') {
        button.style.backgroundColor = '#6969C0';
      }
      if (className === 'color-button-2' && button.style.backgroundColor === '') {
        button.style.backgroundColor = '#BF6969';
      }
      if (className === 'color-button-3' && button.style.backgroundColor === '') {
        button.style.backgroundColor = '#69BF69';
      }

    });
  };

  updateButtonsConfig();
  shadowRoot.appendChild(toolbar);
};

const toggleToolbarVisibility = () => {
  if (toolbar) {
    const isVisible = toolbar.style.display !== 'none';
    toolbar.style.display = isVisible ? 'none' : 'flex';
  } else {
    createToolbar();
  }
};

const toggleEraserButton = () => {
  toggleEraserMode();
  eraserMenu = document.getElementById('eraserMenu') as HTMLDivElement;
  let toolbarRect = toolbar!.getBoundingClientRect(); // A toolbar pozíciója és mérete

  if (!eraserMenu) {
    // A radír menü létrehozása
    eraserMenu = document.createElement('div');
    eraserMenu.id = 'eraserMenu';
    eraserMenu.style.position = 'fixed';
    eraserMenu.style.height = '80px'; // Magasság

    eraserMenu.style.backgroundColor = 'white';
    eraserMenu.style.border = '1px solid black';
    eraserMenu.style.padding = '15px'; // ne állítgasd köszi <3 elrontja a szélesség számítást
    eraserMenu.style.zIndex = '9999';
    eraserMenu.style.borderRadius = '15px';
    eraserMenu.style.color = 'black';
    eraserMenu.style.fontFamily = 'Nunito'; // Betűtípus
    eraserMenu.style.fontSize = '16px'; // Betűméret


    // Radír méret beállító
    const sizeLabel = document.createElement('label');
    sizeLabel.textContent = 'Radír mérete: ';
    sizeLabel.style.color = 'black'; // Szöveg színe
    sizeLabel.style.fontFamily = 'Nunito'; // Betűtípus
    sizeLabel.style.fontSize = '16px'; // Betűméret
    sizeLabel.style.fontWeight = 'bold'; // Vastag betű

    

    const sizeSlider = document.createElement('input');
    sizeSlider.type = 'range';
    sizeSlider.min = '10';
    sizeSlider.max = '50';
    sizeSlider.value = '25';
    sizeSlider.oninput = (e) => {
      const value = (e.target as HTMLInputElement).value;
      setEraserSize(parseInt(value));
    };

    const clearButton = document.createElement('button');
    clearButton.textContent = 'Törlés';
    clearButton.addEventListener('click', clearCanvas);
    clearButton.style.marginLeft = '0px'; // Balra igazítás
    clearButton.style.marginTop = '5px'; // Térköz az előző label objektumtól
    clearButton.style.padding = '8px 12px'; // Nagyobb gombméret
    clearButton.style.borderRadius = '5px'; // Lekerekített szélek
    clearButton.style.backgroundColor = '#f8f9fa'; // Háttérszín
    clearButton.style.color = 'black'; // Szöveg színe
    clearButton.style.fontFamily = 'Nunito'; // Betűtípus
    clearButton.style.fontSize = '16px'; // Betűméret
    clearButton.style.border = '1px solid #ddd'; // Határvonal

    // Label alá igazítás
    clearButton.style.display = 'block'; // Külön sorba kerül a gomb
    clearButton.style.textAlign = 'left'; // Balra igazított szöveg


    eraserMenu.appendChild(sizeLabel);
    eraserMenu.appendChild(sizeSlider);
    eraserMenu.appendChild(clearButton);

    document.body.appendChild(eraserMenu);
  } else {
    eraserMenu.style.display = eraserMenu.style.display === 'none' ? 'block' : 'none';
  }

  // mivel a mozgatas miatt ezt felul kell irni, ezert ezt itthagyom
  if (isVertical) {
    eraserMenu.style.top = `${toolbarRect.bottom - 120}px`; // Y pozíció
    eraserMenu.style.left = `${toolbarRect.right}px`; // X pozíció
    eraserMenu.style.width = `${(toolbarRect.height / 2) - 30}px`; // Szélesség/2  - 2x padding
  } else {
    eraserMenu.style.top = `${toolbarRect.bottom}px`; // Y pozíció
    eraserMenu.style.left = `${toolbarRect.right - toolbarRect.width / 2}px`; // X pozíció
    eraserMenu.style.width = `${(toolbarRect.width / 2) - 30}px`; // Szélesség/2  - 2x padding
  }


}

const togglePencilButton = () => {
  togglePencilMode();
  pencilMenu = document.getElementById('pencilMenu') as HTMLDivElement;
  let toolbarRect = toolbar!.getBoundingClientRect(); // A toolbar pozíciója és mérete

  if (!pencilMenu) {
    pencilMenu = document.createElement('div');
    pencilMenu.id = 'pencilMenu';
    pencilMenu.style.position = 'fixed';
    pencilMenu.style.height = '80px';
    pencilMenu.style.backgroundColor = 'white';
    pencilMenu.style.border = '1px solid black';
    pencilMenu.style.padding = '15px';
    pencilMenu.style.zIndex = '9999';
    pencilMenu.style.borderRadius = '15px';
    pencilMenu.style.color = 'black';
    pencilMenu.style.fontFamily = 'Nunito'; // Betűtípus
    pencilMenu.style.fontSize = '16px'; // Betűméret

    const sizeLabel = document.createElement('label');
    sizeLabel.textContent = 'Ceruza mérete: ';
    sizeLabel.style.color = 'black'; // Szöveg színe
    sizeLabel.style.fontFamily = 'Nunito'; // Betűtípus
    sizeLabel.style.fontSize = '16px'; // Betűméret
    sizeLabel.style.fontWeight = 'bold'; // Vastag betű

    const sizeSlider = document.createElement('input');
    sizeSlider.type = 'range';
    sizeSlider.min = '10';
    sizeSlider.max = '50';
    sizeSlider.value = '25';
    sizeSlider.oninput = (e) => {
      const value = (e.target as HTMLInputElement).value;
      setPencilSize(parseInt(value));
    };

    pencilMenu.appendChild(sizeLabel);
    pencilMenu.appendChild(sizeSlider);
    document.body.appendChild(pencilMenu);
  } else {
    pencilMenu.style.display = pencilMenu.style.display === 'none' ? 'block' : 'none';
  }

  // mivel a mozgatas miatt ezt felul kell irni, ezert ezt itthagyom
  if (isVertical) {
    pencilMenu.style.top = `${toolbarRect.top + 140}px`; // Y pozíció
    pencilMenu.style.left = `${toolbarRect.right}px`; // X pozíció
    pencilMenu.style.width = `${(toolbarRect.height / 2) - 30}px`; // Szélesség/2  - 2x padding
  } else {
    pencilMenu.style.top = `${toolbarRect.bottom}px`; // Y pozíció
    pencilMenu.style.left = `${toolbarRect.left}px`; // X pozíció
    pencilMenu.style.width = `${(toolbarRect.width / 2) - 30}px`; // Szélesség/2  - 2x padding
  }
}

const toggleHighlighterButton = () => {
  highlighterMenu = document.getElementById('highlighterMenu') as HTMLDivElement;
  let toolbarRect = toolbar!.getBoundingClientRect(); // A toolbar pozíciója és mérete

  if (!highlighterMenu) {
    highlighterMenu = document.createElement('div');
    highlighterMenu.id = 'highlighterMenu';
    highlighterMenu.style.position = 'fixed';
    highlighterMenu.style.height = '80px';
    highlighterMenu.style.backgroundColor = 'white';
    highlighterMenu.style.border = '1px solid black';
    highlighterMenu.style.padding = '15px';
    highlighterMenu.style.zIndex = '9999';
    highlighterMenu.style.borderRadius = '15px';

    highlighterButton = document.createElement('button');
    highlighterButton.textContent = 'Highlight';
    highlighterButton.style.marginLeft = '0px';
    highlighterButton.style.marginTop = '0px';
    highlighterButton.style.padding = '8px 12px'; // Nagyobb gombméret
    highlighterButton.style.borderRadius = '5px'; // Lekerekített szélek
    highlighterButton.style.backgroundColor = '#f8f9fa'; // Háttérszín
    highlighterButton.style.color = 'black'; // Szöveg színe
    highlighterButton.style.fontFamily = 'Nunito'; // Betűtípus
    highlighterButton.style.fontSize = '16px'; // Betűméret
    highlighterButton.style.border = '1px solid #ddd'; // Határvonal
    highlighterButton.addEventListener('click', () => {
      // Highlighter mód
      setisdeleteHighlighter(false);
      setisHighlighterModeActive(true);
      startHighlighterMode();
      highlighterButton!.style.backgroundColor = '#E8F3FF';
      deleteHighlighterButton!.style.backgroundColor = '#f8f9fa';
    });

    deleteHighlighterButton = document.createElement('button');
    deleteHighlighterButton.textContent = 'Delete Highlight';
    deleteHighlighterButton.style.marginLeft = '0px';
    deleteHighlighterButton.style.marginTop = '5px';
    deleteHighlighterButton.style.padding = '8px 12px'; // Nagyobb gombméret
    deleteHighlighterButton.style.borderRadius = '5px'; // Lekerekített szélek
    deleteHighlighterButton.style.backgroundColor = '#f8f9fa'; // Háttérszín
    deleteHighlighterButton.style.color = 'black'; // Szöveg színe
    deleteHighlighterButton.style.fontFamily = 'Nunito'; // Betűtípus
    deleteHighlighterButton.style.fontSize = '16px'; // Betűméret
    deleteHighlighterButton.style.border = '1px solid #ddd'; // Határvonal
    deleteHighlighterButton.style.display = 'block'; // Külön sorba kerül a gomb
    deleteHighlighterButton.addEventListener('click', () => {
      // Highlighter törlés mód
      setisdeleteHighlighter(true);
      setisHighlighterModeActive(false)
      highlighterButton!.style.backgroundColor = '#f8f9fa';
      deleteHighlighterButton!.style.backgroundColor = '#E8F3FF';
    });

    highlighterMenu.appendChild(highlighterButton);
    highlighterMenu.appendChild(deleteHighlighterButton);
    document.body.appendChild(highlighterMenu);
  }
  else {
    highlighterMenu.style.display = highlighterMenu.style.display === 'none' ? 'block' : 'none';
  }

  // mivel a mozgatas miatt ezt felul kell irni, ezert ezt itthagyom
  if (isVertical) {
    highlighterMenu.style.top = `${toolbarRect.top + 180}px`; // Y pozíció
    highlighterMenu.style.left = `${toolbarRect.right}px`; // X pozíció
    highlighterMenu.style.width = `${(toolbarRect.height / 2) - 30}px`; // Szélesség/2  - 2x padding
  } else {
    highlighterMenu.style.top = `${toolbarRect.bottom}px`; // Y pozíció
    highlighterMenu.style.left = `${toolbarRect.left}px`; // X pozíció
    highlighterMenu.style.width = `${(toolbarRect.width / 2) - 30}px`; // Szélesség/2  - 2x padding
  }

}
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.action === 'toggleToolbar') {
    toggleToolbarVisibility();
    sendResponse({ status: 'success' });
  }
});
