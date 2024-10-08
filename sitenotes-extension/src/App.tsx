import React, { useState, useEffect } from 'react';
import './App.css';

const App: React.FC = () => {
  const [notesVisible, setNotesVisible] = useState<boolean>(false);
  const [toolsVisible, setToolsVisible] = useState<boolean>(false);
  const [rectangleVisible, setRectangleVisible] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rectanglePosition, setRectanglePosition] = useState<{ top: number; left: number }>({
    top: 100,
    left: 100,
  });
  const [isVertical, setIsVertical] = useState<boolean>(false); // Új állapot

  const showNotes = () => {
    setNotesVisible((prev) => !prev);
  };

  const showTools = () => {
    setToolsVisible((prev) => !prev);
    setRectangleVisible((prev) => !prev);
  };

  const openManageNotesPage = () => {
    window.open('manage-notes.html', '_blank');
  };

  const handleMouseDown = (e: React.MouseEvent, isMoveButton: boolean) => {
    if (isMoveButton) {
      setIsDragging(true);
      setDragOffset({ x: e.clientX - rectanglePosition.left, y: e.clientY - rectanglePosition.top });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setRectanglePosition({
        top: e.clientY - dragOffset.y,
        left: e.clientX - dragOffset.x,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <>
      {/* Lekerekített téglalap gombokkal */}
      {rectangleVisible && (
        <div
          className={`rounded-rectangle ${isVertical ? 'vertical' : 'horizontal'}`}
          style={{ top: rectanglePosition.top, left: rectanglePosition.left }}
        >
          <div className={`button-container ${isVertical ? 'vertical' : 'horizontal'}`}>
            {/* Feltételes megjelenítés horizontális vagy vertikális gombsorrend alapján */}
            {isVertical ? (
              <>

                <button className="icon-button" onClick={() => setIsVertical((prev) => !prev)}>
                  <img src="toolbar-icons/circle.svg" alt="Circle" />
                </button>

                <button className="icon-button" onMouseDown={(e) => handleMouseDown(e, true)}>
                  <img src="toolbar-icons/pen-solid.svg" alt="Move" />
                </button>
                <button className="icon-button">
                  <img src="toolbar-icons/upload.svg" alt="Upload" />
                </button>
                <button className="icon-button">
                  <img src="toolbar-icons/pencil_with_line.svg" alt="Pencil" />
                </button>
                <button className="icon-button">
                  <img src="toolbar-icons/highlighter.svg" alt="Highlighter" />
                </button>
                <button className="icon-button">
                  <img src="toolbar-icons/pen-solid.svg" alt="Color 1" />
                </button>
                <button className="icon-button">
                  <img src="toolbar-icons/pen-solid.svg" alt="Color 2" />
                </button>
                <button className="icon-button">
                  <img src="toolbar-icons/pen-solid.svg" alt="Color 3" />
                </button>
                <button className="icon-button">
                  <img src="toolbar-icons/eraser.svg" alt="Eraser" />
                </button>
              </>
            ) : (
              <>
                <button className="icon-button">
                  <img src="toolbar-icons/upload.svg" alt="Upload" />
                </button>
                <button className="icon-button">
                  <img src="toolbar-icons/pencil_with_line.svg" alt="Pencil" />
                </button>
                <button className="icon-button">
                  <img src="toolbar-icons/highlighter.svg" alt="Highlighter" />
                </button>
                <button className="icon-button">
                  <img src="toolbar-icons/pen-solid.svg" alt="Color 1" />
                </button>
                <button className="icon-button">
                  <img src="toolbar-icons/pen-solid.svg" alt="Color 2" />
                </button>
                <button className="icon-button">
                  <img src="toolbar-icons/pen-solid.svg" alt="Color 3" />
                </button>
                <button className="icon-button">
                  <img src="toolbar-icons/eraser.svg" alt="Eraser" />
                </button>
                <button className="icon-button" onMouseDown={(e) => handleMouseDown(e, true)}>
                  <img src="toolbar-icons/pen-solid.svg" alt="Move" />
                </button>
                <button className="icon-button" onClick={() => setIsVertical((prev) => !prev)}>
                  <img src="toolbar-icons/circle.svg" alt="Circle" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
      <div className="popup-content">
        <table className='buttons'>
          <tbody>
            <tr>
              <td>
                <button><img src="/popup-icons/note-sticky-solid.svg" alt="Add Note" /></button>
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
                <p>{toolsVisible ? "Show Tools" : "Hide Tools"}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default App;
