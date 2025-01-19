// const DB_NAME_NOTE = 'siteNotesDB';
// const DB_VERSION_NOTE = 2;
const STORE_NOTES = 'notes';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    try {
        if (message.action === 'loadNotes') {
            loadNotes();
            sendResponse({ status: 'success' });
        }
        if (message.action === 'addNote') {
            addNoteToPage();
            sendResponse({ status: 'success' });
        }
        if (message.action === 'updateNote') {
            updateNoteInDB(message.noteId, message.updatedData);
            sendResponse({ status: 'success' });
        }
        if (message.action === 'deleteNote') {
            deleteNoteFromDB(message.noteId);
            sendResponse({ status: 'success' });
        }
    } catch (error: any) {
        console.error('Error in managing note:', error);
        sendResponse({ status: 'failure', message: error.message });
    }
    return true; // Keep the message channel open
});

const savePageURLToChromeStorageNotes = (url: string) => {
    chrome.storage.local.get({ modifiedPages: [] }, (result) => {
        const pages = result.modifiedPages as string[];
  
        if (!pages.includes(url)) {
            pages.push(url);
  
            chrome.storage.local.set({ modifiedPages: pages }, () => {
                console.log(`Page URL saved to Chrome Storage: ${url}`);
            });
        }
    });
  };

// INDEXEDDB MOVED HERE

const saveNoteData = async (storeName: string, data: any): Promise<void> => {
    const db = await openNoteDatabase();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
  
    // Add or update the data based on the ID
    store.put(data);
    savePageURLToChromeStorageNotes(window.location.href);
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => reject((event.target as IDBRequest).error);
    });
};

const getNoteData = async (key: string): Promise<any> => {
    const db = await openNoteDatabase();
    const transaction = db.transaction(STORE_NOTES, 'readonly');
    const store = transaction.objectStore(STORE_NOTES);
    
    const request = store.get(key);
  
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  };

  const openNoteDatabase = async (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('siteNotesDB');

        request.onupgradeneeded = (event: any) => {
            const db = event.target.result;

            // Ellenőrizzük, hogy az `notes` tábla létezik-e, ha nem, hozzuk létre
            if (!db.objectStoreNames.contains('notes')) {
                db.createObjectStore('notes', { keyPath: 'id' });
                console.log(`Object store "${'notes'}" created.`);
            }
        };

        request.onsuccess = () => {
            const db = request.result;

            // Ha új oldalra nyitjuk az adatbázist, ellenőrizzük újra az `notes` táblát
            if (!db.objectStoreNames.contains('notes')) {
                const version = db.version + 1; // Verzió emelése szükséges új tábla létrehozásához
                db.close();

                const upgradeRequest = indexedDB.open('siteNotesDB', version);
                upgradeRequest.onupgradeneeded = (upgradeEvent: any) => {
                    const upgradeDb = upgradeEvent.target.result;

                    if (!upgradeDb.objectStoreNames.contains('notes')) {
                        upgradeDb.createObjectStore('notes', { keyPath: 'id' });
                        console.log(`Object store "${'notes'}" created during upgrade.`);
                    }
                };

                upgradeRequest.onsuccess = () => resolve(upgradeRequest.result);
                upgradeRequest.onerror = (event: any) => reject(event.target.error);
            } else {
                resolve(db); // Az adatbázis már tartalmazza a `'notes'` táblát
            }
        };

        request.onerror = (event: any) => {
            reject(event.target.error);
        };
    });
};


const renderedNotes = new Set();

// Adjust loadNotes for correct position
const loadNotes = async () => {
    const url = window.location.href;
    const notes = await getAllNotesForURL(url);

    for (const note of notes) {
        if (!renderedNotes.has(note.id)) {
            renderedNotes.add(note.id);
            if (note.title.trim() || note.text.trim()) {
                addNoteToPage(
                    note.id,
                    note.title,
                    note.text,
                    note.color,
                    note.position,
                    note.isAnchored
                );
            } else {
                await deleteNoteFromDB(note.id);
            }
        }
    }
};
// Retrieve all notes for the current URL
async function getAllNotesForURL(url: string) {
    const db = await openNoteDatabase();
    const transaction = db.transaction(STORE_NOTES, 'readonly');
    const store = transaction.objectStore(STORE_NOTES);

    const notes: any[] = [];
    return new Promise<any[]>((resolve, reject) => {
        const request = store.openCursor();
        request.onsuccess = (event: any) => {
            const cursor = event.target.result;
            if (cursor) {
                const note = cursor.value;
                // Check if note URL matches the current URL
                if (note.url === url) {
                    notes.push(note);
                }
                cursor.continue();
            } else {
                resolve(notes);
            }
        };
        request.onerror = () => {
            console.error('Failed to fetch notes');
            reject(new Error('Error fetching notes for URL'));
        };
    });
}

function addNoteToPage(
    noteId?: number,
    title: string = '',
    text: string = '',
    color: string = 'lightyellow',
    position: { x: number; y: number } = { x: 100, y: 100 },
    isAnchored: boolean = false
) {
    const shadowHost = document.createElement('div');
    shadowHost.id = `shadowHost-${noteId || Date.now()}`;
    document.body.appendChild(shadowHost);

    const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
    const noteDiv = document.createElement('div');
    noteDiv.id = `noteDiv-${noteId || Date.now()}`;
    noteDiv.className = 'notes';
    noteDiv.style.backgroundColor = color;
    noteDiv.style.position = isAnchored ? 'absolute' : 'fixed';
    noteDiv.style.left = `${position.x}px`;
    noteDiv.style.top = `${position.y}px`;
    shadowRoot.appendChild(noteDiv);
    
    // Append CSS file
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('note.css');
    shadowRoot.appendChild(link);

    // the divs (they are styled in the CSS file)
    const buttonDiv = document.createElement('div');
    buttonDiv.id = 'buttonDiv';
    noteDiv.appendChild(buttonDiv);
    
    // COLOR PALETTE
    const colorPalette = document.createElement('input');
    colorPalette.type = 'color';
    colorPalette.style.display = 'none';
    buttonDiv.appendChild(colorPalette);

    const textDiv = document.createElement('div');
    textDiv.id = 'textDiv';
    noteDiv.appendChild(textDiv);
    
    // START FOR BUTTONS
    // Create an anchor button
    const anchorButton = document.createElement('button');
    anchorButton.className = 'Buttons';
    anchorButton.style.backgroundImage = `url("${chrome.runtime.getURL('note-icons/anchor.svg')}")`;
    anchorButton.style.opacity = '0.5';
    buttonDiv.appendChild(anchorButton);
    
    // Add color button
    const colorButton = document.createElement('button');
    colorButton.className = 'Buttons';
    colorButton.style.backgroundImage = `url("${chrome.runtime.getURL('note-icons/palette.svg')}")`;
    buttonDiv.appendChild(colorButton);
    
    // Upload note button
    const uploadButton = document.createElement('button');
    uploadButton.className = 'Buttons';
    uploadButton.style.backgroundImage = `url("${chrome.runtime.getURL('note-icons/upload.svg')}")`;
    buttonDiv.appendChild(uploadButton);
    
    // Download note button
    const downloadButton = document.createElement('button');
    downloadButton.className = 'Buttons';
    downloadButton.style.backgroundImage = `url("${chrome.runtime.getURL('note-icons/download.svg')}")`
    buttonDiv.appendChild(downloadButton);
    
    // Delete button - should be close button instead
    const closeButton = document.createElement('button');
    closeButton.className = 'Buttons';
    closeButton.style.backgroundImage = `url("${chrome.runtime.getURL('note-icons/X.svg')}")`;
    buttonDiv.appendChild(closeButton);
    
    // Editable button for the text area
    const editButton = document.createElement('button');
    editButton.className = 'Buttons';
    editButton.style.backgroundImage = `url("${chrome.runtime.getURL('note-icons/edit.svg')}")`;
    buttonDiv.appendChild(editButton);
    
    // information button for download and upload
    const infoButton = document.createElement('button');
    infoButton.style.backgroundImage = `url("${chrome.runtime.getURL('note-icons/info.svg')}")`;
    infoButton.className = 'Buttons';
    buttonDiv.appendChild(infoButton);
    
    // Remove the note
    const deleteNote = document.createElement('button');
    deleteNote.className = 'Buttons';
    deleteNote.style.backgroundImage = `url("${chrome.runtime.getURL('note-icons/trash.svg')}")`;
    buttonDiv.appendChild(deleteNote);
    
    // END OF BUTTONS
    
    // Create a text area and title area for user notes
    const titleArea = document.createElement('textarea');
    titleArea.id = 'titleArea';
    titleArea.value = title;
    titleArea.placeholder = 'Title';
    textDiv.appendChild(titleArea);

    const textArea = document.createElement('textarea');
    textArea.id = 'textArea';
    textArea.value = text;
    textArea.placeholder = 'Enter your note here';
    textDiv.appendChild(textArea);

    // Save note data in IndexedDB when the user starts typing
    titleArea.addEventListener('input', () => {
        const currentColor = noteDiv.style.backgroundColor;
        const currentPosition = { x: noteDiv.offsetLeft, y: noteDiv.offsetTop };
        saveNote(titleArea, textArea, noteDiv, currentPosition, currentColor, isAnchored);
    });
    
    textArea.addEventListener('input', () => {
        const currentColor = noteDiv.style.backgroundColor;
        const currentPosition = { x: noteDiv.offsetLeft, y: noteDiv.offsetTop };
        saveNote(titleArea, textArea, noteDiv, currentPosition, currentColor, isAnchored);
    });
    
    // Add draggable and position saving functionality
    let isDragging = false;
    noteDiv.onmousedown = function (event) {
        if (isAnchored) return;

        isDragging = true;
        const shiftX = event.clientX - parseFloat(noteDiv.style.left);
        const shiftY = event.clientY - parseFloat(noteDiv.style.top);

        function moveAt(clientX: number, clientY: number) {
            const newX = clientX - shiftX;
            const newY = clientY - shiftY;
            noteDiv.style.left = `${Math.max(0, newX)}px`;
            noteDiv.style.top = `${Math.max(0, newY)}px`;

            if (title || text) {
                const updatedPosition = { x: newX, y: newY };
                saveNote(titleArea, textArea, noteDiv, updatedPosition, color, isAnchored);
            }
        }

        function onMouseMove(event: MouseEvent) {
            if (isDragging) {
                moveAt(event.clientX, event.clientY);
            }
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
        });
    };
    
    // Anchor toggle button
    anchorButton.onclick = function () {
        isAnchored = !isAnchored;
        anchorButton.style.opacity = isAnchored ? '1' : '0.5';

        const rect = noteDiv.getBoundingClientRect();
        noteDiv.style.position = isAnchored ? 'absolute' : 'fixed';
        noteDiv.style.left = isAnchored ? `${rect.left + window.scrollX}px` : `${rect.left}px`;
        noteDiv.style.top = isAnchored ? `${rect.top + window.scrollY}px` : `${rect.top}px`;

        saveNote(
            titleArea,
            textArea,
            noteDiv,
            { x: noteDiv.offsetLeft, y: noteDiv.offsetTop },
            noteDiv.style.backgroundColor,
            isAnchored
        );
};

    
    // Change the color of the note div
    colorButton.onclick = function() {
       colorPalette.style.display = colorPalette.style.display === 'none' ? 'block' : 'none';
    };

    // handle download button
    downloadButton.onclick = function() {
        const title = titleArea.value;
        const content = textArea.value;
        if (!title || !content){
            alert('Please fill in the title and note before downloading the note.');
            return;
        }
        const blob = new Blob([`Title: ${title}\n\nNote: ${content}`], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${title}.txt`;
        link.click();
      };
    
    // handle upload button
    uploadButton.onclick = function() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt';
        fileInput.onchange = function() {
            const file = fileInput.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function() {
                const content = reader.result as string;

                let title = "";
                let note = "";

                if (content.includes("Title:") && content.includes("Note:")) {
                    const [titleLine, noteLine] = content.split('\n\n');
                    title = titleLine.split(': ')[1] || "";
                    note = noteLine.split(': ')[1] || "";
                } else {
                    // If it doesn't follow the format, append everything to the text area
                    note = content;
                }

                // Assign values 
                titleArea.value = title;
                textArea.value = note;
                };
            reader.readAsText(file);
        };
        fileInput.click();
    }
    
    // NOTE TO DEVS: rewritten to close button instead that replaces note with a small icon (not a delete button)
    // ALSO IDEA: Make the icon draggable and reopen the note when clicking it
    // ALSO ALSO IDEA: When opening page, check if there are any closed notes and display them as icons 
        // (probably not user friendly and could lose track of notes)
    // Handle close button
    closeButton.onclick = function () {
        const noteId = Number(noteDiv.id.split('-')[1]); // Extract note ID
    
        // Save the note's current position
        const position = { x: noteDiv.offsetLeft, y: noteDiv.offsetTop };
    
        // Create a small icon representing the closed note
        const closedIcon = document.createElement('div');
        closedIcon.className = 'closed-note-icon';
        closedIcon.style.backgroundColor = noteDiv.style.backgroundColor;
        closedIcon.style.position = 'absolute';
        closedIcon.style.left = `${position.x+ window.scrollX}px`;
        closedIcon.style.top = `${position.y + window.scrollY}px`;
        closedIcon.style.zIndex = '9999'; // Make sure it's on top of other elements
        closedIcon.textContent = '📝'; // Icon representing the note
        document.body.appendChild(closedIcon);
    
        // Remove the full note from the page
        shadowHost.remove();
    
        // Save "closed" state and position in the database
        const rect = noteDiv.getBoundingClientRect();
        const currentPosition = { x: rect.left, y: rect.top };
        
        updateNoteInDB(noteId, {
            title: titleArea.value,
            text: textArea.value,
            color: noteDiv.style.backgroundColor,
            position: currentPosition,
            closed: true, // Mark note as closed
        });
    
        // Reopen the note when clicking the icon
        closedIcon.onclick = function () {
            // Remove the icon and recreate the full note at the same position
            closedIcon.remove();
            addNoteToPage(
                noteId,
                titleArea.value,
                textArea.value,
                noteDiv.style.backgroundColor,
                position // Pass the saved position here
            );
        };
    };
    
    // handle editing button
    editButton.onclick = function() {
        const isEditable = textArea.readOnly;
        textArea.readOnly = titleArea.readOnly = !isEditable;
        editButton.style.opacity = isEditable ? '1' : '0.5';
    };

    // info alert for development, so everybody knows
    infoButton.onclick = function() {
        alert('Functions: \n\tAnchor: Anchor the note on a given position. \n\n\tColor: Change the color of the note. \n\n\tUpload: Upload a note from a .txt file. It needs a "Title:" and "Note:" part. (Try what it looks like with download) \n\n\tDownload: Download the note as a .txt file. \n\n\tTrash: Delete the note. \n\n\tX: Iconize the note. \n\n\tReadonly: Make the note editable or readonly.');
    }

    // color palette input
    colorPalette.onchange = function() {
        noteDiv.style.backgroundColor = colorPalette.value
        colorPalette.style.display = 'none';

        // Save note data including the new color
        if (titleArea.value.trim() !== '' || textArea.value.trim() !== '') {
            saveNote(titleArea, textArea, noteDiv, noteDiv.getBoundingClientRect(), noteDiv.style.backgroundColor, isAnchored);
        };
    }

    // This is the delete button now instead
    deleteNote.onclick = function () {
        titleArea.value = '';
        textArea.value = '';

        // Check if note is empty after clearing (probably could have written elsehow but this works as well idc I'm lazy)
        const noteId = Number(noteDiv.id.split('-')[1]); // Extract note ID
        if (titleArea.value.trim() === '' && textArea.value.trim() === '') {
            shadowHost.remove(); // Remove note from the page
            deleteNoteFromDB(noteId); // Remove note from database
        }
    };

    console.log(noteDiv.getClientRects());
}

// MORE INDEXEDDB

async function saveNote(
    titleArea: HTMLTextAreaElement, 
    textArea: HTMLTextAreaElement, 
    noteDiv: HTMLElement, 
    position: { x: number; y: number }, 
    color: string,
    isAnchored: boolean,
) {
    // Get the note data from the title, text, color, and position
    const noteData = {
        id: parseInt(noteDiv.id.split('-')[1], 10),
        title: titleArea.value,
        text: textArea.value,
        color: color,
        position: position,
        isAnchored: isAnchored, // Új állapot
    };
    
    const url = window.location.href;
    await createOrUpdateNote(url, noteData);
}

async function createOrUpdateNote(url: string, noteData: { id: number; title: string; text: string; color: string; position: { x: number; y: number }; isAnchored: boolean }) {
    const note = {
        id: noteData.id || Date.now(),
        title: noteData.title,
        text: noteData.text,
        color: noteData.color,
        position: noteData.position,
        timestamp: {
            created: noteData.id ? undefined : new Date().toISOString(),
            modified: new Date().toISOString(),
        },
        url: url,
        isAnchored: noteData.isAnchored || false,
    };

    await saveNoteData(STORE_NOTES, note);
}

async function updateNoteInDB(
    noteId: number,
    updatedData: {
        title: string;
        text: string;
        color: string;
        position: { x: number; y: number };
        closed?: boolean;
    }
) {
    const note = await getNoteData(noteId.toString());
    if (note) {
        note.title = updatedData.title;
        note.text = updatedData.text;
        note.color = updatedData.color;
        note.position = updatedData.position;
        note.closed = updatedData.closed || false; // Default to false if not provided
        note.timestamp.modified = new Date().toISOString();
        await saveNoteData(STORE_NOTES, note);
    }
}

// Not implemented fully rn dw
async function deleteNoteFromDB(noteId: number) {
    const db = await openNoteDatabase();
    const transaction = db.transaction(STORE_NOTES, 'readwrite');
    const store = transaction.objectStore(STORE_NOTES);
    store.delete(noteId);
}
