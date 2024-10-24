chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    try {
      if (message.action === 'addNote') {
        addNoteToPage();
        sendResponse({ status: 'success' });
      }
    } catch (error: any) {
      console.error('Error in adding note:', error);
      sendResponse({ status: 'failure', message: error.message });
    }
    return true; // Always return true to keep the message channel open
  });

function addNoteToPage() {
    const shadowHost = document.createElement('div');
    shadowHost.id = 'shadowHost';
    document.body.appendChild(shadowHost);
    
    // Attach shadowRoot
    const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
    
    // Create a div element 
    const noteDiv = document.createElement('div');
    noteDiv.id = 'noteDiv';
    noteDiv.className = 'notes';
    noteDiv.style.position = 'fixed';
    noteDiv.style.bottom = 'auto';
    noteDiv.style.right = 'auto';
    noteDiv.style.width = 'auto';
    noteDiv.style.height = 'auto';
    noteDiv.style.backgroundColor = 'lightyellow';
    noteDiv.style.border = '1px solid black';
    noteDiv.style.padding = '10px';
    noteDiv.style.zIndex = '1000';
    noteDiv.style.boxShadow = '5px 5px 5px rgba(0, 0, 0, 0.5)';
    noteDiv.style.display = 'flex';
    noteDiv.style.flexDirection = 'column';
    
    // Append the div to the root
    shadowRoot.appendChild(noteDiv);
    console.log("Div appended");
    
    // Append CSS file
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('note.css');
    shadowRoot.appendChild(link);
    
    // the divs (they are styled in the CSS file)
    const buttonDiv = document.createElement('div');
    buttonDiv.id = 'buttonDiv';
    noteDiv.appendChild(buttonDiv);
    
    const textDiv = document.createElement('div');
    textDiv.id = 'textDiv';
    noteDiv.appendChild(textDiv);
    
    // START FOR BUTTONS
    // Create an anchor button
    const anchorButton = document.createElement('button');
    anchorButton.innerText = 'Anchor';
    anchorButton.className = 'Buttons';
    buttonDiv.appendChild(anchorButton);
    
    let isAnchored = false;
    
    // Add color button
    const colorButton = document.createElement('button');
    colorButton.innerText = 'Color';
    colorButton.className = 'Buttons';
    buttonDiv.appendChild(colorButton);
    
    //Array of colors
    let colors = ['lightyellow', 'lightblue', 'lightgreen', 'lightcoral', 'lightpink', 'lightgrey'];
    // index for the array of colors
    let colorIndex = 0;
    
    // Upload note button
    const uploadButton = document.createElement('button');
    uploadButton.innerText = 'Upload';
    uploadButton.className = 'Buttons';
    buttonDiv.appendChild(uploadButton);
    
    // Download note button
    const downloadButton = document.createElement('button');
    downloadButton.innerText = 'Download';
    downloadButton.className = 'Buttons';
    buttonDiv.appendChild(downloadButton);
    
    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'X';
    deleteButton.className = 'Buttons';
    buttonDiv.appendChild(deleteButton);
    
    // Editable button for the text area
    const editButton = document.createElement('button');
    editButton.innerText = 'Readonly';
    editButton.className = 'Buttons';
    buttonDiv.appendChild(editButton);
    
    // END OF BUTTONS
    
    // Create a text area and title area for user notes
    const titleArea = document.createElement('textarea');
    titleArea.id = 'titleArea';
    titleArea.placeholder = 'Title';
    textDiv.appendChild(titleArea);
    
    const textArea = document.createElement('textarea');
    textArea.id = 'textArea';
    textArea.placeholder = 'Enter your note here';
    textDiv.appendChild(textArea);
    
    // Make the div draggable
    noteDiv.onmousedown = function(event) {
        if (isAnchored) return;
        
        let shiftX = event.clientX - noteDiv.getBoundingClientRect().left;
        let shiftY = event.clientY - noteDiv.getBoundingClientRect().top;
        
        function moveAt(pageX: number, pageY: number) {
            noteDiv.style.left = pageX - shiftX + 'px';
            noteDiv.style.top = pageY - shiftY + 'px';
        }
        
        function onMouseMove(event: MouseEvent) {
            moveAt(event.pageX, event.pageY);
        }
        
        document.addEventListener('mousemove', onMouseMove);
        
        noteDiv.onmouseup = function() {
            document.removeEventListener('mousemove', onMouseMove);
            noteDiv.onmouseup = null;
        };
    };
    
    noteDiv.ondragstart = function() {
        return false;
    };
    
    // Toggle anchoring on button click
    anchorButton.onclick = function() {
        isAnchored = !isAnchored;
        anchorButton.innerText = isAnchored ? 'Unanchor' : 'Anchor';
    };
    
    // Cahnge the color of the note div
    colorButton.onclick = function() {
        colorIndex = (colorIndex + 1) % colors.length;
        noteDiv.style.backgroundColor = colors[colorIndex];
    };

    // handle download button
    downloadButton.onclick = function() {
        const title = titleArea.value;
        const content = textArea.value;
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
                const [title, note] = content.split('\n\n');
                titleArea.value = title.split(': ')[1];
                textArea.value = note.split(': ')[1];
            };
            reader.readAsText(file);
        };
        fileInput.click();
    }
    
    // handle delete button
    deleteButton.onclick = function() {
        shadowHost.remove();
    };

    // handle editing button
    editButton.onclick = function() {
        const isEditable = textArea.readOnly;
        textArea.readOnly = titleArea.readOnly = !isEditable;
        editButton.innerText = isEditable ? 'Readonly' : 'Editable';
    };
}
