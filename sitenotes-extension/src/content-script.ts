let toolbar: HTMLDivElement | null = null;
let isVertical = false; // State to toggle between vertical and horizontal layout

// Function to create and show the toolbar
const createToolbar = () => {
  // Create a shadow host
  // Create a shadow host
  const shadowHost = document.createElement('div');
  shadowHost.id = 'toolbar-shadow-host';
  document.body.appendChild(shadowHost);

  // Attach a shadow root to the shadow host
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

  // Create a link element for the CSS file
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('toolbar.css'); // Reference your CSS file

  // Append the link to the shadow root
  shadowRoot.appendChild(link);

  // Create the toolbar within the shadow DOM
  // Create the toolbar within the shadow DOM
  toolbar = document.createElement('div');
  toolbar.id = 'myToolbar';
  toolbar.className = isVertical ? 'rounded-rectangle vertical' : 'rounded-rectangle horizontal'; // Apply styles based on orientation
  toolbar.style.position = 'fixed';
  toolbar.style.top = '100px';
  toolbar.style.left = '100px';
  toolbar.style.zIndex = '9999';
  toolbar.style.display = 'flex';
  toolbar.style.flexDirection = isVertical ? 'column' : 'row'; // Vertical or horizontal layout
  toolbar.style.flexWrap = 'nowrap';  // No wrapping, all icons in a line for vertical
  toolbar.style.justifyContent = 'center';  // Center the icons inside the toolbar
  toolbar.style.alignItems = 'center';  // Align the icons properly inside
  toolbar.style.padding = '10px';  // Padding for toolbar content
  toolbar.style.gap = '10px'; // Consistent spacing between icons
  toolbar.style.border = '1px solid black';
  toolbar.style.borderRadius = '15px';
  toolbar.style.backgroundColor = 'white';

  // No need to manually set width or height, as flex will handle it


  // Function to handle drag movement
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  toolbar.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - toolbar!.offsetLeft; 
    offsetY = e.clientY - toolbar!.offsetTop;
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
    toolbar!.style.flexDirection = isVertical ? 'column' : 'row';
    toolbar!.style.width = isVertical ? '50px' : '200px';
    toolbar!.style.height = isVertical ? '200px' : '50px';
  };

  // Add toolbar buttons (with icons)
  // Add toolbar buttons (with icons)
  const buttonsConfig = [
      { icon: chrome.runtime.getURL('toolbar-icons/upload.svg'), alt: 'Upload', onClick: () => console.log('Upload clicked') },
      { icon: chrome.runtime.getURL('toolbar-icons/pencil_with_line.svg'), alt: 'Pencil', onClick: () => console.log('Pencil clicked') },
      { icon: chrome.runtime.getURL('toolbar-icons/highlighter.svg'), alt: 'Highlighter', onClick: () => console.log('Highlighter clicked') },
      { icon: chrome.runtime.getURL('toolbar-icons/pen-solid.svg'), alt: 'Color 1', onClick: () => console.log('Color 1 clicked') },
      { icon: chrome.runtime.getURL('toolbar-icons/pen-solid.svg'), alt: 'Color 2', onClick: () => console.log('Color 2 clicked') },
      { icon: chrome.runtime.getURL('toolbar-icons/pen-solid.svg'), alt: 'Color 3', onClick: () => console.log('Color 3 clicked') },
      { icon: chrome.runtime.getURL('toolbar-icons/eraser.svg'), alt: 'Eraser', onClick: () => console.log('Eraser clicked') },
      { icon: chrome.runtime.getURL('toolbar-icons/pen-solid.svg'), alt: 'Move', onClick: () => console.log('Move clicked') },
      { icon: chrome.runtime.getURL('toolbar-icons/circle.svg'), alt: 'Toggle Layout', onClick: toggleLayout },
  ];
  
  // Create buttons and append to toolbar
  buttonsConfig.forEach(({ icon, alt, onClick }) => {
      const button = document.createElement('button');
      button.className = 'icon-button';
      
      const img = document.createElement('img'); // Create image element
      img.src = icon; // Set the correct URL
      img.alt = alt; // Set the alt text
  
      button.appendChild(img); // Append image to button
      button.onclick = onClick; // Set the click handler
      toolbar!.appendChild(button); // Append button to toolbar
  });
  
  // Dynamically set width and height
  const iconSize = 50; // Each icon is roughly 50px
  const numberOfIcons = buttonsConfig.length;
  if (isVertical) {
    toolbar.style.width = `${iconSize + 20}px`; // Slightly larger than icon size to account for padding
    toolbar.style.height = `${numberOfIcons * (iconSize + 20)}px`; // Height based on number of icons
  } else {
    toolbar.style.width = `${numberOfIcons * (iconSize + 20)}px`; // Width based on number of icons
    toolbar.style.height = `${iconSize + 20}px`; // Height slightly larger than icon size
  }
  

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
