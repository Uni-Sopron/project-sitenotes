import { togglePencilMode, toggleEraserMode } from './content-script-draw';
import { handleImageUpload } from './content-script-img';
import { toggleHighlighterMode, setHighlighterButton } from './content-script-highlighter'; // Importáld a setHighlighterButton-t
let toolbar: HTMLDivElement | null = null;
let isVertical = false; 
let isMovable = false; 

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
      toolbar!.style.left = `${e.clientX - offsetX}px`;
      toolbar!.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  const toggleLayout = () => {
    isVertical = !isVertical;
    toolbar!.className = isVertical ? 'rounded-rectangle vertical' : 'rounded-rectangle horizontal';
    updateButtonsConfig();
  };

  const toggleMovability = () => {
    isMovable = !isMovable;
    const moveButton = toolbar?.querySelector('.move-button img') as HTMLImageElement;
    if (moveButton) {
      moveButton.style.opacity = isMovable ? '1' : '0.5';
    }
  };

  const updateButtonsConfig = () => {
    while (toolbar!.firstChild) {
      toolbar!.removeChild(toolbar!.firstChild);
    }

    const buttonsConfig = isVertical
      ? [
        { icon: chrome.runtime.getURL('toolbar-icons/circle.svg'), alt: 'Toggle Layout', onClick: toggleLayout }, // Circle
        { icon: chrome.runtime.getURL('toolbar-icons/pen-solid.svg'), alt: 'Move', onClick: toggleMovability, className: 'move-button' },
        { icon: chrome.runtime.getURL('toolbar-icons/upload.svg'), alt: 'Upload', onClick: handleImageUpload },
        { icon: chrome.runtime.getURL('toolbar-icons/pencil_with_line.svg'), alt: 'Pencil', onClick: togglePencilMode, className: 'pencil-button' },
        { icon: chrome.runtime.getURL('toolbar-icons/highlighter.svg'), alt: 'Highlighter', onClick: toggleHighlighterMode, className: 'highlighter-button' },
        { icon: chrome.runtime.getURL('toolbar-icons/pen-solid.svg'), alt: 'Color 1', onClick: () => console.log('Color 1 clicked') },
        { icon: chrome.runtime.getURL('toolbar-icons/pen-solid.svg'), alt: 'Color 2', onClick: () => console.log('Color 2 clicked') },
        { icon: chrome.runtime.getURL('toolbar-icons/pen-solid.svg'), alt: 'Color 3', onClick: () => console.log('Color 3 clicked') },
        { icon: chrome.runtime.getURL('toolbar-icons/eraser.svg'), alt: 'Eraser', onClick: toggleEraserMode, className: 'eraser-button' },
      ]
      : [
        { icon: chrome.runtime.getURL('toolbar-icons/upload.svg'), alt: 'Upload', onClick: handleImageUpload },
        { icon: chrome.runtime.getURL('toolbar-icons/pencil_with_line.svg'), alt: 'Pencil', onClick: togglePencilMode, className: 'pencil-button' },
        { icon: chrome.runtime.getURL('toolbar-icons/highlighter.svg'), alt: 'Highlighter', onClick: toggleHighlighterMode, className: 'highlighter-button' },
        { icon: chrome.runtime.getURL('toolbar-icons/pen-solid.svg'), alt: 'Color 1', onClick: () => console.log('Color 1 clicked') },
        { icon: chrome.runtime.getURL('toolbar-icons/pen-solid.svg'), alt: 'Color 2', onClick: () => console.log('Color 2 clicked') },
        { icon: chrome.runtime.getURL('toolbar-icons/pen-solid.svg'), alt: 'Color 3', onClick: () => console.log('Color 3 clicked') },
        { icon: chrome.runtime.getURL('toolbar-icons/eraser.svg'), alt: 'Eraser', onClick: toggleEraserMode, className: 'eraser-button' },
        { icon: chrome.runtime.getURL('toolbar-icons/pen-solid.svg'), alt: 'Move', onClick: toggleMovability, className: 'move-button' },
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

      // Beállítja a gombot a highlighterhez
      if (className === 'highlighter-button') {
          setHighlighterButton(button); // A gomb referencia beállítása
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

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.action === 'toggleToolbar') {
    toggleToolbarVisibility();
    sendResponse({ status: 'success' });
  }
});
