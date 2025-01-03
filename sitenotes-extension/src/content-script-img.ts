// import { saveImage } from "./database"; THERE WON'T BE DATABASE.TS
const DB_NAME_IMG = 'siteNotesDB';
const DB_VERSION_IMG = 1;
const STORE_IMAGES = 'images';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    try {
        if (message.action === 'loadImage') {
            loadImage(message.id);
            sendResponse({ status: 'success' });
        }
        // if (message.action === 'addImage') {
        //     handleImageUpload();
        //     sendResponse({ status: 'success' });
        // }
        // if (message.action === 'updateImage') {
        //     updateImageInDB(message.imageId, message.updatedData);
        //     sendResponse({ status: 'success' });
        // }
        // if (message.action === 'deleteImage') {
        //     deleteImageFromDB(message.imageId);
        //     sendResponse({ status: 'success' });
        // }
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
                    deleteButton.onclick = () => {
                        document.body.removeChild(wrapper);
                        document.body.removeChild(menu); // Remove menu as well
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
                        resizedImg.style.transform = `rotate(${currentRotation + 90}deg)`; // Rotate 90 degrees
                    };

                    const flipButton = document.createElement('button');
                    flipButton.textContent = 'Tükrözés';
                    flipButton.onclick = () => {
                        resizedImg.style.transform += 'scaleX(-1)'; // Flip horizontally
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
                                : e.clientY - wrapper.getBoundingClientRect().top; // Allow free height adjustment

                            if (isAspectRatioLocked) {
                                // Maintain aspect ratio
                                const aspectRatio = width / height;
                                newHeight = newWidth / aspectRatio;
                            }

                            wrapper.style.width = `${newWidth}px`;
                            wrapper.style.height = `${newHeight}px`;
                            resizedImg.style.width = '100%';
                            resizedImg.style.height = '100%';

                            // Update the menu position when the image is resized
                            updateMenuPosition();
                        }
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

const saveImage = async (url: string, imageData: { id: number; src: string; position: { x: number; y: number }; size: { width: number; height: number } }): Promise<void> => {
    const image = {
      ...imageData,
      timestamp: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      },
      url: url
    };
  
    await saveImageData(STORE_IMAGES, image);
  };

  const openImageDatabase = async (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME_IMG, DB_VERSION_IMG);

        request.onupgradeneeded = (event: any) => {
            const db = event.target.result;

            // Ellenőrizzük, hogy az `images` tábla létezik-e, ha nem, hozzuk létre
            if (!db.objectStoreNames.contains(STORE_IMAGES)) {
                db.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
                console.log(`Object store "${STORE_IMAGES}" created.`);
            }
        };

        request.onsuccess = () => {
            const db = request.result;

            // Ha új oldalra nyitjuk az adatbázist, ellenőrizzük újra az `images` táblát
            if (!db.objectStoreNames.contains(STORE_IMAGES)) {
                const version = db.version + 1; // Verzió emelése szükséges új tábla létrehozásához
                db.close();

                const upgradeRequest = indexedDB.open(DB_NAME_IMG, version);
                upgradeRequest.onupgradeneeded = (upgradeEvent: any) => {
                    const upgradeDb = upgradeEvent.target.result;

                    if (!upgradeDb.objectStoreNames.contains(STORE_IMAGES)) {
                        upgradeDb.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
                        console.log(`Object store "${STORE_IMAGES}" created during upgrade.`);
                    }
                };

                upgradeRequest.onsuccess = () => resolve(upgradeRequest.result);
                upgradeRequest.onerror = (event: any) => reject(event.target.error);
            } else {
                resolve(db); // Az adatbázis már tartalmazza a `STORE_IMAGES` táblát
            }
        };

        request.onerror = (event: any) => {
            reject(event.target.error);
        };
    });
};


const saveImageData = async (storeName: string, data: any): Promise<void> => {
    const db = await openImageDatabase();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
  
    // Add or update the data based on the ID
    store.put(data);
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  };

const getImageData = async (key: string): Promise<any> => {
    const db = await openImageDatabase();
    const transaction = db.transaction(STORE_IMAGES, 'readonly');
    const store = transaction.objectStore(STORE_IMAGES);
  
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
            const img = new Image();
            img.src = imageData.src;
            img.style.position = 'absolute';
            img.style.left = `${imageData.position.x}px`;
            img.style.top = `${imageData.position.y}px`;
            img.style.width = `${imageData.size.width}px`;
            img.style.height = `${imageData.size.height}px`;
            img.style.zIndex = '9991';

            document.body.appendChild(img);
        } else {
            console.log('Image not found');
        }
    } catch (error) {
        console.error('Failed to load image:', error);
    }
};

export { handleImageUpload };