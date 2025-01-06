console.log('Content Image script loaded');
const loadAllImages = async () => {
    // Site loaded
    console.log('Site loaded');
    try {
        console.log('Loading all images...');
        const db = await openImageDatabase();
        const transaction = db.transaction('images', 'readonly');
        const store = transaction.objectStore('images');

        const request = store.getAll();

        request.onsuccess = () => {
            const images = request.result;
            if (images && images.length > 0) {
                images.forEach((imageData) => {
                    // Hozzuk létre és jelenítsük meg a képet
                    const wrapper = document.createElement('div');
                    wrapper.style.position = 'absolute';
                    wrapper.style.left = `${imageData.position.x}px`;
                    wrapper.style.top = `${imageData.position.y}px`;
                    wrapper.style.width = `${imageData.size.width}px`;
                    wrapper.style.height = `${imageData.size.height}px`;
                    wrapper.style.border = '1px dashed gray';
                    wrapper.style.boxSizing = 'border-box';
                    wrapper.style.overflow = 'visible';
                    wrapper.style.zIndex = '9991';

                    const img = new Image();
                    img.src = imageData.src;
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'contain';
                    img.style.transform = imageData.transform || '';

                    wrapper.appendChild(img);
                    document.body.appendChild(wrapper);

                    // Drag and resize functionality hozzáadása
                    addDragAndResize(wrapper, imageData.id);

                    console.log('Image loaded:', imageData.id);
                });
            }
        };

        request.onerror = (event) => {
            console.error('Error loading images:', (event.target as IDBRequest).error);
        };
    } catch (error) {
        console.error('Failed to load all images:', error);
    }
};

window.addEventListener('DOMContentLoaded', loadAllImages);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    try {
        if (message.action === 'invokeHandleImageUpload') {
            handleImageUpload();
            sendResponse({ status: 'success' });
        }
        if (message.action === 'loadImage') {
            loadImage(message.id);
            sendResponse({ status: 'success' });
        }
        if (message.action === 'addImage') {
            handleImageUpload();
            sendResponse({ status: 'success' });
        }
        // if (message.action === 'updateImage') {
        //     updateImageInDB(message.imageId, message.updatedData);
        //     sendResponse({ status: 'success' });
        // }
        if (message.action === 'deleteImage') {
            deleteImageFromDB(message.imageId);
            sendResponse({ status: 'success' });
        }
    } catch (error: any) {
        console.error('Error in managing image:', error);
        sendResponse({ status: 'failure', message: error.message });
    }
    return true; // Keep the message channel open
});

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
                const img = new Image(); // Create an Image object to get the original size
                img.src = e.target?.result as string;

                img.onload = async () => {
                    const maxWidth = 150; // Max width for the image
                    const maxHeight = 150; // Max height for the image
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions while maintaining aspect ratio
                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    // Create a wrapper div for the image to enable resizing
                    const wrapper = document.createElement('div');
                    wrapper.style.position = 'absolute';
                    wrapper.style.top = '200px';
                    wrapper.style.left = '200px';
                    wrapper.style.width = `${width}px`;
                    wrapper.style.height = `${height}px`;
                    wrapper.style.border = '1px dashed gray'; // Optional: a border for visibility
                    wrapper.style.boxSizing = 'border-box'; // Prevents border from affecting size
                    wrapper.style.overflow = 'visible'; // Allow overflow for resizing handles
                    wrapper.style.zIndex = '9991'; // Ensure the image is on top of most elements

                    const resizedImg = document.createElement('img');
                    resizedImg.src = img.src;
                    resizedImg.style.width = '100%'; // Fit the image to the wrapper
                    resizedImg.style.height = '100%'; // Maintain the aspect ratio
                    resizedImg.style.objectFit = 'contain'; // Contain to avoid distortion
                    resizedImg.style.cursor = 'move';

                    // Create resize handles (code to make it resizable)
                    const resizeHandle = document.createElement('div');
                    resizeHandle.style.width = '10px';
                    resizeHandle.style.height = '10px';
                    resizeHandle.style.backgroundColor = 'blue'; // Color for visibility
                    resizeHandle.style.position = 'absolute';
                    resizeHandle.style.bottom = '0';
                    resizeHandle.style.right = '0';
                    resizeHandle.style.cursor = 'nwse-resize'; // Resize cursor
                    resizeHandle.style.display = 'none'; // Initially hidden
                    wrapper.appendChild(resizeHandle);

                    // Create menu for image actions (delete, resize, etc.)
                    const menu = document.createElement('div');
                    menu.style.position = 'absolute';
                    menu.style.backgroundColor = 'white';
                    menu.style.border = '1px solid gray';
                    menu.style.padding = '5px';
                    menu.style.display = 'none'; // Initially hidden

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Törlés';
                    // Törlés gombhoz adatbázis művelet
                    deleteButton.onclick = async () => {
                        document.body.removeChild(wrapper);
                        document.body.removeChild(menu);
                        await deleteImageFromDB(imageData.id);
                    };
                    const resizeButton = document.createElement('button');
                    resizeButton.textContent = 'Méretezés Arányosan';
                    let isAspectRatioLocked = false; // Track if aspect ratio is locked

                    resizeButton.onclick = () => {
                        isAspectRatioLocked = !isAspectRatioLocked; // Toggle aspect ratio lock
                        resizeButton.style.backgroundColor = isAspectRatioLocked ? 'lightgreen' : ''; // Indicate if locked
                        resizeHandle.style.display = isAspectRatioLocked ? 'block' : 'none'; // Show or hide resize handle
                    };

                    const rotateButton = document.createElement('button');
                    rotateButton.textContent = 'Forgatás';
                    rotateButton.onclick = () => {
                        const currentRotation = parseFloat(resizedImg.style.transform.replace('rotate(', '').replace('deg)', '') || '0');
                        const newRotation = currentRotation + 90;
                        resizedImg.style.transform = `rotate(${newRotation}deg)`;
                        saveCurrentState(wrapper, imageData.id); // Mentés
                    };
                    
                    const flipButton = document.createElement('button');
                    flipButton.textContent = 'Tükrözés';
                    flipButton.onclick = () => {
                        const currentTransform = resizedImg.style.transform || '';
                        resizedImg.style.transform = `${currentTransform} scaleX(-1)`;
                        saveCurrentState(wrapper, imageData.id); // Mentés
                    };
                    

                    menu.appendChild(deleteButton);
                    menu.appendChild(resizeButton);
                    menu.appendChild(rotateButton);
                    menu.appendChild(flipButton);
                    wrapper.appendChild(resizedImg);
                    document.body.appendChild(wrapper);
                    document.body.appendChild(menu);

                    // Function to update menu position
                    const updateMenuPosition = () => {
                        menu.style.display = 'block'; // Show menu
                        menu.style.top = `${wrapper.offsetTop + wrapper.offsetHeight + 10}px`; // Position the menu below the image
                        menu.style.left = `${wrapper.offsetLeft}px`; // Align the menu with the left edge of the image
                    };

                    // Show menu on image double-click
                    wrapper.addEventListener('dblclick', (e) => {
                        e.stopPropagation(); // Prevent the click event from propagating to the document
                        updateMenuPosition(); // Update the menu position based on current dimensions
                    });

                    // Hide menu when clicking outside
                    document.addEventListener('click', () => {
                        menu.style.display = 'none'; // Hide menu
                    });

                    // Add drag functionality to the wrapper
                    let isDraggingImage = false;
                    let imgOffsetX = 0;
                    let imgOffsetY = 0;

                    wrapper.addEventListener('mousedown', (e) => {
                        if (e.target === resizeHandle) {
                            // Don't drag the image if resizing
                            return;
                        }
                        isDraggingImage = true;
                        imgOffsetX = e.clientX - wrapper.offsetLeft;
                        imgOffsetY = e.clientY - wrapper.offsetTop;
                    });

                    // Handle resizing with the resize handle
                    let isResizing = false;
                    resizeHandle.addEventListener('mousedown', (e) => {
                        e.preventDefault(); // Prevent default behavior
                        isResizing = true;
                    });

                    document.addEventListener('mousemove', (e) => {
                        if (isDraggingImage) {
                            wrapper.style.left = `${e.clientX - imgOffsetX}px`;
                            wrapper.style.top = `${e.clientY - imgOffsetY}px`;
                        }
                    
                        if (isResizing) {
                            let newWidth = e.clientX - wrapper.getBoundingClientRect().left;
                            let newHeight = isAspectRatioLocked
                                ? (newWidth * height) / width // Maintain aspect ratio
                                : e.clientY - wrapper.getBoundingClientRect().top;
                    
                            wrapper.style.width = `${newWidth}px`;
                            wrapper.style.height = `${newHeight}px`;
                            resizedImg.style.width = '100%';
                            resizedImg.style.height = '100%';
                    
                            updateMenuPosition();
                        }
                    });
                    
                    // Esemény végén mentés
                    document.addEventListener('mouseup', () => {
                        isDraggingImage = false;
                        isResizing = false;
                    
                        // Mentés az IndexedDB-be
                        saveCurrentState(wrapper, imageData.id);
                    });
                    

                    document.addEventListener('mouseup', () => {
                        isDraggingImage = false;
                        isResizing = false;
                    });

                    // After the image is loaded and resized, save the image to IndexedDB
                    const imageData = {
                        id: Date.now(), // Unique ID for the image
                        src: img.src, // Base64 string of the image
                        position: { x: 200, y: 200 }, // Example position
                        size: { width, height }, // Resized dimensions
                    };

                    // const { saveImage } = await import('./database'); death of database.ts
                    saveImage(window.location.href, imageData); // Save the image to IndexedDB
                };
            };

            reader.readAsDataURL(file); // Read the file as a data URL (base64 encoding)
        }
    };

    document.body.appendChild(input);
    input.click(); // Trigger the file input dialog
};

const saveImage = async (url: string, imageData: { 
    id: number; 
    src: string; 
    position: { x: number; y: number }; 
    size: { width: number; height: number }; 
  }): Promise<void> => {
      const image = {
          ...imageData,
          timestamp: {
              created: new Date().toISOString(),
              modified: new Date().toISOString(),
          },
          url: url
      };
  
      // Ellenőrizd, hogy az image.src tartalmaz-e adatot
      if (!image.src) {
          console.error('Image src is missing.');
          return;
      }
  
      await saveImageData('images', image);
  };
  
  // KELL MAJD A TÖBBINEK IS HASONLÓAN: HA NEM LÉTEZIK TÁBLA, HOZZA LÉTRE
  const openImageDatabase = async (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('siteNotesDB', 2);

        request.onupgradeneeded = (event: any) => {
            const db = event.target.result;

            // Ellenőrizzük, hogy az `images` tábla létezik-e, ha nem, hozzuk létre
            if (!db.objectStoreNames.contains('images')) {
                db.createObjectStore('images', { keyPath: 'id' });
                console.log(`Object store "${'images'}" created.`);
            }
        };

        request.onsuccess = () => {
            const db = request.result;

            // Ha új oldalra nyitjuk az adatbázist, ellenőrizzük újra az `images` táblát
            if (!db.objectStoreNames.contains('images')) {
                const version = db.version + 1; // Verzió emelése szükséges új tábla létrehozásához
                db.close();

                const upgradeRequest = indexedDB.open('siteNotesDB', version);
                upgradeRequest.onupgradeneeded = (upgradeEvent: any) => {
                    const upgradeDb = upgradeEvent.target.result;

                    if (!upgradeDb.objectStoreNames.contains('images')) {
                        upgradeDb.createObjectStore('images', { keyPath: 'id' });
                        console.log(`Object store "${'images'}" created during upgrade.`);
                    }
                };

                upgradeRequest.onsuccess = () => resolve(upgradeRequest.result);
                upgradeRequest.onerror = (event: any) => reject(event.target.error);
            } else {
                resolve(db); // Az adatbázis már tartalmazza a `'images'` táblát
            }
        };

        request.onerror = (event: any) => {
            reject(event.target.error);
        };
    });
};

const saveImageData = async (storeName: string, data: any): Promise<void> => {
    try {
        const db = await openImageDatabase();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);

        store.put(data);

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = (event) => {
                console.error('Transaction error:', event);
                reject((event.target as IDBRequest).error);
            };
        });
    } catch (error) {
        console.error('Failed to save image data:', error);
    }
};

const getImageData = async (key: string): Promise<any> => {
    const db = await openImageDatabase();
    const transaction = db.transaction('images', 'readonly');
    const store = transaction.objectStore('images');
  
    const request = store.get(key);
  
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  };

  const loadImage = async (id: number) => {
    try {
        const imageData = await getImageData(id.toString());
        if (imageData) {
            const wrapper = document.createElement('div');
            wrapper.style.position = 'absolute';
            wrapper.style.left = `${imageData.position.x}px`;
            wrapper.style.top = `${imageData.position.y}px`;
            wrapper.style.width = `${imageData.size.width}px`;
            wrapper.style.height = `${imageData.size.height}px`;
            wrapper.style.border = '1px dashed gray';
            wrapper.style.boxSizing = 'border-box';
            wrapper.style.overflow = 'visible';
            wrapper.style.zIndex = '9991';

            const img = new Image();
            img.src = imageData.src || ''; // Ellenőrizd az src-t
            if (!img.src) {
                console.error('Image src is missing in loaded data.');
                return;
            }

            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            img.style.transform = imageData.transform || ''; // Forgatási állapot betöltése

            wrapper.appendChild(img);
            document.body.appendChild(wrapper);

            // Add drag & resize events, and save the state
            addDragAndResize(wrapper, imageData.id);
        } else {
            console.log('Image not found');
        }
    } catch (error) {
        console.error('Failed to load image:', error);
    }
};

const addDragAndResize = (wrapper: HTMLElement, imageId: number) => {
    const img = wrapper.querySelector('img') as HTMLImageElement;
    const resizeHandle = document.createElement('div');

    // Resize handle stílusa
    resizeHandle.style.width = '10px';
    resizeHandle.style.height = '10px';
    resizeHandle.style.backgroundColor = 'blue';
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.right = '0';
    resizeHandle.style.cursor = 'nwse-resize';
    wrapper.appendChild(resizeHandle);

    // Drag
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    wrapper.addEventListener('mousedown', (e) => {
        if (e.target === resizeHandle) {
            return; // Resize esetén ne induljon a drag
        }
        isDragging = true;
        offsetX = e.clientX - wrapper.offsetLeft;
        offsetY = e.clientY - wrapper.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            wrapper.style.left = `${e.clientX - offsetX}px`;
            wrapper.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            saveCurrentState(wrapper, imageId); // Drag után mentés
        }
    });

    // Resize
    let isResizing = false;
    let originalWidth = 0;
    let originalHeight = 0;
    let originalMouseX = 0;
    let originalMouseY = 0;

    resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Alapértelmezett események tiltása
        isResizing = true;

        originalWidth = wrapper.offsetWidth;
        originalHeight = wrapper.offsetHeight;
        originalMouseX = e.clientX;
        originalMouseY = e.clientY;
    });

    document.addEventListener('mousemove', (e) => {
        if (isResizing) {
            const deltaX = e.clientX - originalMouseX;
            const deltaY = e.clientY - originalMouseY;

            wrapper.style.width = `${originalWidth + deltaX}px`;
            wrapper.style.height = `${originalHeight + deltaY}px`;
            img.style.width = '100%'; // Tartsuk a kép méretét a wrapperhez igazítva
            img.style.height = '100%';
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            saveCurrentState(wrapper, imageId); // Resize után mentés
        }
    });
};

const saveCurrentState = async (wrapper: HTMLElement, imageId: number) => {
    const position = {
        x: parseInt(wrapper.style.left, 10),
        y: parseInt(wrapper.style.top, 10),
    };
    const size = {
        width: parseInt(wrapper.style.width, 10),
        height: parseInt(wrapper.style.height, 10),
    };
    const img = wrapper.querySelector('img');
    const transform = img?.style.transform || '';
    const src = img?.src || ''; // Az src mentése

    if (!src) {
        console.error('Image src is missing when saving state.');
        return;
    }

    const updatedData = {
        id: imageId,
        position,
        size,
        transform,
        src, // Adjunk hozzá egy új mezőt
    };

    await saveImageData('images', updatedData);
};

const deleteImageFromDB = async (imageId: number): Promise<void> => {
    const db = await openImageDatabase();
    const transaction = db.transaction('images', 'readwrite');
    const store = transaction.objectStore('images');

    store.delete(imageId);

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject((event.target as IDBRequest).error);
    });
};


export { handleImageUpload }; // export funkciót nem szereti a debugger