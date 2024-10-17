chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'addNote') {
      // This is where the note creation logic will go
      addNoteToPage();
      sendResponse({ status: 'success' });
    }
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
    noteDiv.style.bottom = '10px';
    noteDiv.style.right = '10px';
    noteDiv.style.width = '200px';
    noteDiv.style.height = '100px';
    noteDiv.style.backgroundColor = 'lightyellow';
    noteDiv.style.border = '1px solid black';
    noteDiv.style.padding = '10px';
    noteDiv.style.zIndex = '1000';

    // Append the div to the root
    shadowRoot.appendChild(noteDiv);
    console.log("Div appended");

    // Append CSS file
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('toolbar.css');
    shadowRoot.appendChild(link);

    // Create an anchor button
    const anchorButton = document.createElement('button');
    anchorButton.innerText = 'Anchor';
    anchorButton.style.position = 'absolute';
    anchorButton.style.top = '5px';
    anchorButton.style.right = '5px';
    noteDiv.appendChild(anchorButton);

    let isAnchored = false;

    // Create a text area for user notes
    const textArea = document.createElement('input');
    textArea.type = 'text';
    textArea.style.width = '50%';
    textArea.style.height = '50%';
    noteDiv.appendChild(textArea);

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
}
