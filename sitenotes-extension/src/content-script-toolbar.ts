import { togglePencilMode, toggleEraserMode } from './content-script-draw';
import { toggleHighlighterMode } from './content-script-highlighter';

let toolbar: HTMLDivElement | null = null;
let isVertical = false; // State to toggle between vertical and horizontal layout
let isMovable = false; // State to check if toolbar is movable

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
      // // Initialize eraserButton after toolbar is created
      // // TODO - ha aktív és forgatod, akkor nem színezi jól az ikont
      // eraserButton = toolbar!.querySelector('.eraser-button img') as HTMLImageElement;
      // pencilButton = toolbar!.querySelector('.pencil-button img') as HTMLImageElement;
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
