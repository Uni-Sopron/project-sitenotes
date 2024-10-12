let toolbar: HTMLDivElement | null = null;
let isVertical = false; // State to toggle between vertical and horizontal layout
let isMovable = false; // State to check if toolbar is movable
let isPencilModeActive = false; // Ceruza mód állapota
let isDrawing = false;
let isErasing = false;
let isEraserModeActive = false; // Radír mód állapota
let isHighlighterModeActive = false;

let lastX = 0;
let lastY = 0;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

let eraserButton: HTMLImageElement | null = null;
let pencilButton: HTMLImageElement | null = null;

const setupCanvas = () => {
    canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '9000';
    canvas.style.backgroundColor = 'transparent'; // Átlátszó hátterű vászon
    canvas.style.pointerEvents = 'auto';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
}

const addPencilEventListeners = () => {
  canvas!.addEventListener('mousedown', startDrawing);
  canvas!.addEventListener('mousemove', draw);
  canvas!.addEventListener('mouseup', stopDrawing);
  canvas!.addEventListener('mouseout', stopDrawing);

  canvas!.addEventListener('touchstart', startDrawing);
  canvas!.addEventListener('touchmove', draw);
  canvas!.addEventListener('touchend', stopDrawing);
  canvas!.addEventListener('touchcancel', stopDrawing);
}
const removePencilEventlisteners = () => {
  canvas!.removeEventListener('mousedown', startDrawing);
  canvas!.removeEventListener('mousemove', draw);
  canvas!.removeEventListener('mouseup', stopDrawing);
  canvas!.removeEventListener('mouseout', stopDrawing);

  canvas!.removeEventListener('touchstart', startDrawing);
  canvas!.removeEventListener('touchmove', draw);
  canvas!.removeEventListener('touchend', stopDrawing);
  canvas!.removeEventListener('touchcancel', stopDrawing);
  
}
const addEraserEventListeners = () => {
    canvas!.addEventListener('mousedown', startErasing);
    canvas!.addEventListener('mousemove', erase);
    canvas!.addEventListener('mouseup', stopErasing);
    canvas!.addEventListener('mouseout', stopErasing);

    canvas!.addEventListener('touchstart', startErasing);
    canvas!.addEventListener('touchmove', erase);
    canvas!.addEventListener('touchend', stopErasing);
    canvas!.addEventListener('touchcancel', stopErasing);
}
const removeEraserEventlisteners = () => {
  canvas!.removeEventListener('mousedown', startErasing);
  canvas!.removeEventListener('mousemove', erase);
  canvas!.removeEventListener('mouseup', stopErasing);
  canvas!.removeEventListener('mouseout', stopErasing);

  canvas!.removeEventListener('touchstart', startErasing);
  canvas!.removeEventListener('touchmove', erase);
  canvas!.removeEventListener('touchend', stopErasing);
  canvas!.removeEventListener('touchcancel', stopErasing);

}

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




// ERASER FUNCTIONALITY
const toggleEraserMode = () => {

  if (isEraserModeActive) {
    // Ha a radír mód aktív, akkor visszaállítjuk az egérkurzort és deaktiváljuk a radírozást
    canvas!.style.cursor = 'default';
    removeEraserEventlisteners();
    isEraserModeActive = false;
    if (eraserButton) {
      eraserButton.style.opacity = '1';
    }
    canvas!.style.pointerEvents = 'none'; // A vászonon lévő események letiltása
  } else {
    // Ha a radír mód inaktív, akkor aktiváljuk
    activateEraserMode();
    removePencilEventlisteners();
    canvas!.style.cursor = 'crosshair';
    if (eraserButton) {
      eraserButton.style.opacity = '0.5';
    }
    if (pencilButton) {
      pencilButton.style.opacity = '1';
    }
    isEraserModeActive = true;
    isPencilModeActive = false;
    canvas!.style.pointerEvents = 'auto'; // A vászonon lévő események engedélyezése
  }
};

const activateEraserMode = () => {
  if (!canvas) {setupCanvas();}
  addEraserEventListeners();
};

const startErasing = () => {
  isErasing = true;
};

const stopErasing = () => {
  isErasing = false;
};

const erase = (e: MouseEvent | TouchEvent) => {
  e.preventDefault(); // Az alapértelmezett viselkedés letiltása (pl. görgetés)
  if (ctx && canvas && isErasing) {
    let x = 0;
    let y = 0;
    const eraseSize = 20; // A radír mérete

    if (e instanceof MouseEvent) {
      // Egér esemény esetén
      x = e.clientX - canvas.offsetLeft;
      y = e.clientY - canvas.offsetTop;
    } else if (e instanceof TouchEvent) {
      // Érintés esemény esetén
      const touch = e.touches[0] || e.changedTouches[0];
      x = (touch?.clientX ?? 0) - canvas.offsetLeft;
      y = (touch?.clientY ?? 0) - canvas.offsetTop;
    }

    // A radírozás megkezdése
    ctx.save(); // Elmentjük a jelenlegi állapotot
    ctx.globalCompositeOperation = 'destination-out'; // Beállítjuk a törlés módját

    ctx.beginPath();
    ctx.arc(x, y, eraseSize / 2, 0, Math.PI * 2, false); // Egy kör rajzolása a megadott koordinátákon
    ctx.fill(); // Kitöltjük a kört, ez törlésként működik

    ctx.restore(); // Visszaállítjuk az eredeti állapotot
  }
};


// PENCIL FUNCTIONALITY
const activatePencilMode = () => {
  if (!canvas) {
    setupCanvas();
    if (ctx) {
      ctx.strokeStyle = 'black';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = 5;
    }
  }
  addPencilEventListeners();
};

const draw = (e: MouseEvent | TouchEvent) => {
  e.preventDefault(); // Az alapértelmezett viselkedés letiltása (pl. görgetés)
  if (!isDrawing || !ctx) return; // Ha nem rajzolunk, lépjünk ki

      let offsetX = 0;
      let offsetY = 0;

      // Egér esemény esetén
      if (e instanceof MouseEvent) {
          offsetX = e.offsetX;
          offsetY = e.offsetY;
      }
        // Érintés esemény esetén
      else if (e instanceof TouchEvent) {
      const touch = e.touches[0] || e.changedTouches[0];
      offsetX = touch.clientX - canvas!.offsetLeft;
      offsetY = touch.clientY - canvas!.offsetTop;
  }
      ctx.beginPath();             // Kezdünk egy új útvonalat
      ctx.moveTo(lastX, lastY);     // Rajzolás a korábbi pozícióból
      ctx.lineTo(offsetX, offsetY); // Rajzolás az új pozícióig
      ctx.stroke();                 // Vonal megjelenítése
      [lastX, lastY] = [offsetX, offsetY]; // Frissítjük az utolsó pozíciót
};

const startDrawing = (e: MouseEvent | TouchEvent) => {
  isDrawing = true;

  if (e instanceof MouseEvent) {
    // Egér esemény esetén
    [lastX, lastY] = [e.offsetX, e.offsetY];
  } else if (e instanceof TouchEvent) {
    // Érintés esemény esetén
    const touch = e.touches[0] || e.changedTouches[0];
    [lastX, lastY] = [
      (touch?.clientX ?? 0) - canvas!.offsetLeft,
      (touch?.clientY ?? 0) - canvas!.offsetTop
    ];
  }
};

const stopDrawing = () => {
  isDrawing = false;
};


// Funkció a ceruza ikonhoz
const togglePencilMode = () => {
  if (isPencilModeActive) {
    // Ha a ceruza mód aktív, akkor visszaállítjuk az egérkurzort és deaktiváljuk a rajzolást
    canvas!.style.cursor = 'default'; // Alapértelmezett egérkurzor
    removePencilEventlisteners();
    if (pencilButton) {
      pencilButton.style.opacity = '1';
    }
    isPencilModeActive = false;
    canvas!.style.pointerEvents = 'none'; // A vászonon lévő események letiltása
  } else {
    // Ha a ceruza mód inaktív, akkor aktiváljuk
    activatePencilMode();
    removeEraserEventlisteners();
    if (pencilButton) {
      pencilButton.style.opacity = '0.5';
    }
    if (eraserButton) {
      eraserButton.style.opacity = '1';
    }
    canvas!.style.cursor = 'crosshair'; // Ceruza kurzor
    isPencilModeActive = true;
    isEraserModeActive = false;
    canvas!.style.pointerEvents = 'auto'; // A vászonon lévő események engedélyezése
  }
};





// TOOLBAR FUNCTIONALITY
// Function to create and show the toolbar
const createToolbar = () => {
  const shadowHost = document.createElement('div'); // Ez az example.com-on ott marad ilyen fehér sáv biszbasznak ami sztem nem igazan jó :c
  shadowHost.id = 'toolbar-shadow-host';
  document.body.appendChild(shadowHost);

  // Attach a shadow root to the shadow host
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

  // Create a link element for the CSS file
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('toolbar.css');

  // Append the link to the shadow root
  shadowRoot.appendChild(link);

  toolbar = document.createElement('div');  
  toolbar.id = 'myToolbar';
  toolbar.className = isVertical ? 'rounded-rectangle vertical' : 'rounded-rectangle horizontal';
  toolbar.style.position = 'fixed';
  toolbar.style.top = '100px';
  toolbar.style.left = '100px';
  toolbar.style.zIndex = '9999';
  toolbar.style.display = 'flex';
  toolbar.style.padding = '10px';
  toolbar.style.gap = '10px';
  toolbar.style.border = '1px solid black';
  toolbar.style.borderRadius = '15px';
  toolbar.style.backgroundColor = 'white';
  toolbar.style.zIndex = '9999'; // Always on top
  toolbar.style.pointerEvents = 'auto'; // Allow interaction

  // Function to handle drag movement
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

  // Helper function to toggle layout orientation
  const toggleLayout = () => {
    isVertical = !isVertical;
    // Update the toolbar class based on the new layout
    toolbar!.className = isVertical ? 'rounded-rectangle vertical' : 'rounded-rectangle horizontal';
    // Update button configuration for new layout
    updateButtonsConfig();
  };

  // Move button click handler to toggle movability
  const toggleMovability = () => {
    isMovable = !isMovable;
    const moveButton = toolbar?.querySelector('.move-button img') as HTMLImageElement;
    if (moveButton) {
      moveButton.style.opacity = isMovable ? '1' : '0.5'; // Change opacity to indicate movable state
    }
  };
  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target?.result as string;
          img.style.position = 'absolute';
          img.style.top = '200px';
          img.style.left = '200px';
          img.style.width = '150px';
          img.style.height = '150px';
          img.style.cursor = 'move';

          // Add drag functionality to the image
          let isDraggingImage = false;
          let imgOffsetX = 0;
          let imgOffsetY = 0;

          img.addEventListener('mousedown', (e) => {
            isDraggingImage = true;
            imgOffsetX = e.clientX - img.offsetLeft;
            imgOffsetY = e.clientY - img.offsetTop;
          });

          document.addEventListener('mousemove', (e) => {
            if (isDraggingImage) {
              img.style.left = `${e.clientX - imgOffsetX}px`;
              img.style.top = `${e.clientY - imgOffsetY}px`;
            }
          });

          document.addEventListener('mouseup', () => {
            isDraggingImage = false;
          });

          document.body.appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    };

    input.click(); // Trigger file selection
  };


  // Function to update button configuration based on the current layout
  const updateButtonsConfig = () => {
    // Clear the toolbar first
    while (toolbar!.firstChild) {
      toolbar!.removeChild(toolbar!.firstChild);
    }

    const buttonsConfig = isVertical
      ? [
        { icon: chrome.runtime.getURL('toolbar-icons/circle.svg'), alt: 'Toggle Layout', onClick: toggleLayout }, // Circle
        { icon: chrome.runtime.getURL('toolbar-icons/pen-solid.svg'), alt: 'Move', onClick: toggleMovability, className: 'move-button' }, // Move

        { icon: chrome.runtime.getURL('toolbar-icons/upload.svg'), alt: 'Upload', onClick: handleImageUpload }, // Updated Upload button


        { icon: chrome.runtime.getURL('toolbar-icons/pencil_with_line.svg'), alt: 'Pencil', onClick: togglePencilMode, className: 'pencil-button' }, // Pencil (Updated to activate drawing)
        { icon: chrome.runtime.getURL('toolbar-icons/highlighter.svg'), alt: 'Highlighter', onClick: toggleHighlighterMode, className: 'highlighter-button' },

        { icon: chrome.runtime.getURL('toolbar-icons/pen-solid.svg'), alt: 'Color 1', onClick: () => console.log('Color 1 clicked') }, // Color 1
        { icon: chrome.runtime.getURL('toolbar-icons/pen-solid.svg'), alt: 'Color 2', onClick: () => console.log('Color 2 clicked') }, // Color 2
        { icon: chrome.runtime.getURL('toolbar-icons/pen-solid.svg'), alt: 'Color 3', onClick: () => console.log('Color 3 clicked') }, // Color 3
        { icon: chrome.runtime.getURL('toolbar-icons/eraser.svg'), alt: 'Eraser', onClick: toggleEraserMode, className: 'eraser-button' }, // Radír gomb
      ]
      : [
        { icon: chrome.runtime.getURL('toolbar-icons/upload.svg'), alt: 'Upload', onClick: handleImageUpload }, // Updated Upload button

        { icon: chrome.runtime.getURL('toolbar-icons/pencil_with_line.svg'), alt: 'Pencil', onClick: togglePencilMode, className: 'pencil-button' }, // Pencil (Updated to activate drawing)// Pencil
        { icon: chrome.runtime.getURL('toolbar-icons/highlighter.svg'), alt: 'Highlighter', onClick: toggleHighlighterMode, className: 'highlighter-button' }, // Highlighter
        { icon: chrome.runtime.getURL('toolbar-icons/pen-solid.svg'), alt: 'Color 1', onClick: () => console.log('Color 1 clicked') }, // Color 1
        { icon: chrome.runtime.getURL('toolbar-icons/pen-solid.svg'), alt: 'Color 2', onClick: () => console.log('Color 2 clicked') }, // Color 2
        { icon: chrome.runtime.getURL('toolbar-icons/pen-solid.svg'), alt: 'Color 3', onClick: () => console.log('Color 3 clicked') }, // Color 3
        { icon: chrome.runtime.getURL('toolbar-icons/eraser.svg'), alt: 'Eraser', onClick: toggleEraserMode, className: 'eraser-button' }, // Radír gomb
        { icon: chrome.runtime.getURL('toolbar-icons/pen-solid.svg'), alt: 'Move', onClick: toggleMovability, className: 'move-button' }, // Move
        { icon: chrome.runtime.getURL('toolbar-icons/circle.svg'), alt: 'Toggle Layout', onClick: toggleLayout }, // Toggle Layout
      ];

    // Create buttons and append to toolbar
    buttonsConfig.forEach(({ icon, alt, onClick, className }) => {
      const button = document.createElement('button');
      button.className = 'icon-button ' + (className || '');

      const img = document.createElement('img'); // Create image element
      img.src = icon; // Set the correct URL
      img.alt = alt; // Set the alt text

      button.appendChild(img); // Append image to button
      button.onclick = onClick; // Set the click handler
      toolbar!.appendChild(button); // Append button to toolbar
    });
      // Initialize eraserButton after toolbar is created
      eraserButton = toolbar!.querySelector('.eraser-button img') as HTMLImageElement;
      pencilButton = toolbar!.querySelector('.pencil-button img') as HTMLImageElement;
  };

  // Initial button configuration
  updateButtonsConfig();



  // Append the toolbar to the shadow root
  shadowRoot.appendChild(toolbar);
};

// Function to toggle the toolbar visibility
const toggleToolbarVisibility = () => {
  if (toolbar) {
    const isVisible = toolbar.style.display !== 'none';
    toolbar.style.display = isVisible ? 'none' : 'flex'; // Toggle visibility
  } else {
    createToolbar(); // If toolbar doesn't exist, create it
  }
};

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.action === 'toggleToolbar') {
    toggleToolbarVisibility();
    sendResponse({ status: 'success' });
  }
});
