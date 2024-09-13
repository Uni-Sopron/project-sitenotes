import React, { useState } from 'react';

const Popup = () => {
  const [note, setNote] = useState('');

  const saveNote = () => {
    chrome.storage.local.set({ note }, () => {
      console.log('Note saved:', note);
    });
  };

  return (
    <div style={{ padding: '10px' }}>
      <h2>My Notes Extension</h2>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write your note here..."
        rows={5}
        cols={30}
      />
      <button onClick={saveNote}>Save Note</button>
    </div>
  );
};

export default Popup;
