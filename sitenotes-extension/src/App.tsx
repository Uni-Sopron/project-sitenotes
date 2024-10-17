import React, { useState } from 'react';
import './App.css';

const App: React.FC = () => {
  const [notesVisible, setNotesVisible] = useState<boolean>(false);
  const [toolsVisible, setToolsVisible] = useState<boolean>(true);

  const showNotes = () => {
    setNotesVisible((prev) => !prev);
  };

  const showTools = () => {
    setToolsVisible((prev) => !prev);

    // Send a message to the content script to toggle the toolbar
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleToolbar' }, (response) => {
          if (response?.status === 'success') {
            console.log('Toolbar toggled');
          }
        });
      }
    });
  };

  const addNote = () => {
    // Send a message to the content script to add a note
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'addNote' }, (response) => {
          if (response?.status === 'success') {
            console.log('Note added');
          }
        });
      }
    });
  }

  const openManageNotesPage = () => {
    window.open('manage-notes.html', '_blank');
  };
  
  //took out toolbar from here as you can see
  return (
    <div className="popup-content">
      <table className='buttons'>
        <tbody>
          <tr>
            <td>
              <button onClick={addNote}><img src="/popup-icons/note-sticky-solid.svg" alt="Add Note" /></button>
            </td>
            <td>
              <button onClick={showNotes}>
                <img
                  src={notesVisible ? "/popup-icons/pen-solid.svg" : "/popup-icons/message-solid.svg"}
                  alt={notesVisible ? "Hide Notes" : "Show Notes"}
                />
              </button>
            </td>
            <td>
              <button><img src="/popup-icons/compress-solid.svg" alt="Iconizer" /></button>
            </td>
            <td>
              <button onClick={openManageNotesPage}><img src="/popup-icons/list-solid.svg" alt="All Notes" /></button>
            </td>
            <td>
              <button onClick={showTools}>
                <img
                  src={toolsVisible ? "/popup-icons/message-solid.svg" : "/popup-icons/pen-solid.svg"}
                  alt={toolsVisible ? "Hide Tools" : "Show Tools"}
                />
              </button>
            </td>
          </tr>
          <tr>
            <td>
              <p>Add Notes</p>
            </td>
            <td>
              <p>{notesVisible ? "Hide Notes" : "Show Notes"}</p>
            </td>
            <td>
              <p>Iconizer</p>
            </td>
            <td>
              <p>All Notes</p>
            </td>
            <td>
              <p>{toolsVisible ? "Hide Tools" : "Show Tools"}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default App;
