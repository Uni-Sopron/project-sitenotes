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

                img.onload = () => {
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
                    const scrollX = window.scrollX || 0;
                    const scrollY = window.scrollY || 0;
                    wrapper.style.top = `${scrollY + 200}px`;
                    wrapper.style.left = `${scrollX + 200}px`;
                    wrapper.style.width = `${width}px`;
                    wrapper.style.height = `${height}px`;
                    wrapper.style.border = '1px dashed gray'; // Optional: a border for visibility
                    wrapper.style.boxSizing = 'border-box'; // Prevents border from affecting size
                    wrapper.style.overflow = 'visible'; // Allow overflow for resizing handles
                    wrapper.style.zIndex = '8000'; 


                    const resizedImg = document.createElement('img');
                    resizedImg.src = img.src;
                    resizedImg.style.width = '100%'; // Fit the image to the wrapper
                    resizedImg.style.height = '100%'; // Maintain the aspect ratio
                    resizedImg.style.objectFit = 'contain'; // Contain to avoid distortion
                    resizedImg.style.cursor = 'move';

                    // Create resize handles
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

                    // Create menu for image actions
                    const menu = document.createElement('div');
                    menu.style.position = 'absolute';
                    menu.style.backgroundColor = 'white';
                    menu.style.border = '1px solid gray';
                    menu.style.padding = '5px';
                    menu.style.display = 'none'; // Initially hidden
                    menu.style.zIndex = '9999';
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
                };
            };
            reader.readAsDataURL(file);
        }
    };

    input.click();
};

export { handleImageUpload };
