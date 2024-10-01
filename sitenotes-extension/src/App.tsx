import { useState } from 'react'
import './App.css'

function App() {
  const [Notes, setNotes] = useState(false); /* ha true akkor megjelenítettek azaz áthúzott, ha false akkor nem */
  const [Tools, setTools] = useState(false); /* ha false, akkor megjeleníthető, ha true akkor teljesen eltűnik */

   async function showNotes(){
    Notes ? setNotes(false) : setNotes(true);
    /* ide kód (pl oldal megjelenítése másik scriptnél), lehet nem async */
  }

  async function showTools(){
    Tools ? setTools(false) : setTools(true);
    /* ide kód (pl oldal megjelenítése másik scriptnél), lehet nem async */
  }

  return (
  <>
    <table className='buttons'>
      <tr>
        <td>
          <button><img src="/popup-icons/note-sticky-solid.svg" alt="Add Note"></img></button>
        </td>
        <td>
          <button onClick={showNotes}><img src={Notes ? "/popup-icons/pen-solid.svg" : "/popup-icons/message-solid.svg"} alt={Notes ? "Hide Notes" : "Show Notes"}/** jelenleg nincs hamis kép(azaz eltakaró) */></img></button>
        </td>
        <td>
          <button><img src="/popup-icons/compress-solid.svg" alt="Iconizer"></img></button>
        </td>
        <td>
          <button><img src="/popup-icons/list-solid.svg" alt="Tools"></img></button>
        </td>
        <td>
          <button onClick={showTools}><img src={Tools ? "/popup-icons/message-solid.svg": "/popup-icons/pen-solid.svg"} alt={Tools ? "Hide Tools": "Show Tools"}/** Nincs itt se másik kép (lehet rossz a kép jelenleg) */></img></button>
        </td>
      </tr>
      <tr>
        <td>
          <p>Add Notes</p>
        </td>
        <td>
          <p>{Notes ? "Hide Notes": "Show Notes"}</p>
        </td>
        <td>
          <p>Iconizer</p>
        </td>
        <td>
          <p>All Notes</p>
        </td>
        <td>
          <p>{Tools ? "Show Tools" : "Hide Tools"}</p>
        </td>
      </tr>
    </table>
  </>
  )
}

export default App
