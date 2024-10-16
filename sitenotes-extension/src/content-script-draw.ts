// ide kerül a rajzoló kódja, ami rajzol a weboldalra.
let isPencilModeActive = false; // Ceruza mód állapota
let isDrawing = false;
let isErasing = false;
let isEraserModeActive = false; // Radír mód állapota

let lastX = 0;
let lastY = 0;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

// let eraserButton: HTMLImageElement | null = null;
// let pencilButton: HTMLImageElement | null = null;


const setupCanvas = () => {
    canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = document.body.scrollHeight; // a canvas magassága megegyezik az oldal hosszával
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '9000';
    canvas.style.backgroundColor = 'transparent'; // Átlátszó hátterű vászon
    canvas.style.pointerEvents = 'auto';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
}

const addPencilEventListeners = () => {
  canvas!.addEventListener('mousedown', startDrawing);
  canvas!.addEventListener('mousemove', draw);
  canvas!.addEventListener('mouseup', stopDrawing);
  canvas!.addEventListener('mouseout', stopDrawing);

  canvas!.addEventListener('touchstart', startDrawing);
  canvas!.addEventListener('touchmove', draw);
  canvas!.addEventListener('touchend', stopDrawing);
  canvas!.addEventListener('touchcancel', stopDrawing);
}
const removePencilEventlisteners = () => {
  canvas!.removeEventListener('mousedown', startDrawing);
  canvas!.removeEventListener('mousemove', draw);
  canvas!.removeEventListener('mouseup', stopDrawing);
  canvas!.removeEventListener('mouseout', stopDrawing);

  canvas!.removeEventListener('touchstart', startDrawing);
  canvas!.removeEventListener('touchmove', draw);
  canvas!.removeEventListener('touchend', stopDrawing);
  canvas!.removeEventListener('touchcancel', stopDrawing);
  
}
const addEraserEventListeners = () => {
    canvas!.addEventListener('mousedown', startErasing);
    canvas!.addEventListener('mousemove', erase);
    canvas!.addEventListener('mouseup', stopErasing);
    canvas!.addEventListener('mouseout', stopErasing);

    canvas!.addEventListener('touchstart', startErasing);
    canvas!.addEventListener('touchmove', erase);
    canvas!.addEventListener('touchend', stopErasing);
    canvas!.addEventListener('touchcancel', stopErasing);
}
const removeEraserEventlisteners = () => {
  canvas!.removeEventListener('mousedown', startErasing);
  canvas!.removeEventListener('mousemove', erase);
  canvas!.removeEventListener('mouseup', stopErasing);
  canvas!.removeEventListener('mouseout', stopErasing);

  canvas!.removeEventListener('touchstart', startErasing);
  canvas!.removeEventListener('touchmove', erase);
  canvas!.removeEventListener('touchend', stopErasing);
  canvas!.removeEventListener('touchcancel', stopErasing);

}



// ERASER FUNCTIONALITY
const toggleEraserMode = () => {

    if (isEraserModeActive) {
      // Ha a radír mód aktív, akkor visszaállítjuk az egérkurzort és deaktiváljuk a radírozást
      canvas!.style.cursor = 'default';
      removeEraserEventlisteners();
      isEraserModeActive = false;
    //   if (eraserButton) {
    //     eraserButton.style.opacity = '1';
    //   }
      canvas!.style.pointerEvents = 'none'; // A vászonon lévő események letiltása
    } else {
      // Ha a radír mód inaktív, akkor aktiváljuk
      activateEraserMode();
      removePencilEventlisteners();
      canvas!.style.cursor = 'crosshair';
    //   if (eraserButton) {
    //     eraserButton.style.opacity = '0.5';
    //   }
    //   if (pencilButton) {
    //     pencilButton.style.opacity = '1';
    //   }
      isEraserModeActive = true;
      isPencilModeActive = false;
      canvas!.style.pointerEvents = 'auto'; // A vászonon lévő események engedélyezése
    }
  };
  
  const activateEraserMode = () => {
    if (!canvas) {setupCanvas();}
    addEraserEventListeners();
  };
  
  const startErasing = () => {
    isErasing = true;
  };
  
  const stopErasing = () => {
    isErasing = false;
  };
  
  const erase = (e: MouseEvent | TouchEvent) => {
    e.preventDefault(); // Az alapértelmezett viselkedés letiltása (pl. görgetés)
    if (ctx && canvas && isErasing) {
      let x = 0;
      let y = 0;
      const eraseSize = 20; // A radír mérete
  
      if (e instanceof MouseEvent) {
        // Egér esemény esetén
        x = e.clientX - canvas.offsetLeft;
        y = e.clientY - canvas.offsetTop;
      } else if (e instanceof TouchEvent) {
        // Érintés esemény esetén
        const touch = e.touches[0] || e.changedTouches[0];
        x = (touch?.clientX ?? 0) - canvas.offsetLeft;
        y = (touch?.clientY ?? 0) - canvas.offsetTop;
      }
  
      // A radírozás megkezdése
      ctx.save(); // Elmentjük a jelenlegi állapotot
      ctx.globalCompositeOperation = 'destination-out'; // Beállítjuk a törlés módját
  
      ctx.beginPath();
      ctx.arc(x, y, eraseSize / 2, 0, Math.PI * 2, false); // Egy kör rajzolása a megadott koordinátákon
      ctx.fill(); // Kitöltjük a kört, ez törlésként működik
  
      ctx.restore(); // Visszaállítjuk az eredeti állapotot
    }
  };
  
  
  // PENCIL FUNCTIONALITY
  const activatePencilMode = () => {
    if (!canvas) {
      setupCanvas();
      if (ctx) {
        ctx.strokeStyle = '#1974D2';
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = 5;
      }
    }
    addPencilEventListeners();
  };
  
  const draw = (e: MouseEvent | TouchEvent) => {
    e.preventDefault(); // Az alapértelmezett viselkedés letiltása (pl. görgetés)
    if (!isDrawing || !ctx) return; // Ha nem rajzolunk, lépjünk ki
  
        let offsetX = 0;
        let offsetY = 0;
  
        // Egér esemény esetén
        if (e instanceof MouseEvent) {
            offsetX = e.offsetX;
            offsetY = e.offsetY;
        }
          // Érintés esemény esetén
        else if (e instanceof TouchEvent) {
        const touch = e.touches[0] || e.changedTouches[0];
        offsetX = touch.clientX - canvas!.offsetLeft;
        offsetY = touch.clientY - canvas!.offsetTop;
    }
        ctx.beginPath();             // Kezdünk egy új útvonalat
        ctx.moveTo(lastX, lastY);     // Rajzolás a korábbi pozícióból
        ctx.lineTo(offsetX, offsetY); // Rajzolás az új pozícióig
        ctx.stroke();                 // Vonal megjelenítése
        [lastX, lastY] = [offsetX, offsetY]; // Frissítjük az utolsó pozíciót
  };
  
  const startDrawing = (e: MouseEvent | TouchEvent) => {
    isDrawing = true;
  
    if (e instanceof MouseEvent) {
      // Egér esemény esetén
      [lastX, lastY] = [e.offsetX, e.offsetY];
    } else if (e instanceof TouchEvent) {
      // Érintés esemény esetén
      const touch = e.touches[0] || e.changedTouches[0];
      [lastX, lastY] = [
        (touch?.clientX ?? 0) - canvas!.offsetLeft,
        (touch?.clientY ?? 0) - canvas!.offsetTop
      ];
    }
  };
  
  const stopDrawing = () => {
    isDrawing = false;
  };
  
  
  // Funkció a ceruza ikonhoz
  const togglePencilMode = () => {
    if (isPencilModeActive) {
      // Ha a ceruza mód aktív, akkor visszaállítjuk az egérkurzort és deaktiváljuk a rajzolást
      canvas!.style.cursor = 'default'; // Alapértelmezett egérkurzor
      removePencilEventlisteners();
    //   if (pencilButton) {
    //     pencilButton.style.opacity = '1';
    //   }
      isPencilModeActive = false;
      canvas!.style.pointerEvents = 'none'; // A vászonon lévő események letiltása
    } else {
      // Ha a ceruza mód inaktív, akkor aktiváljuk
      activatePencilMode();
      removeEraserEventlisteners();
    //   if (pencilButton) {
    //     pencilButton.style.opacity = '0.5';
    //   }
    //   if (eraserButton) {
    //     eraserButton.style.opacity = '1';
    //   }
      canvas!.style.cursor = 'crosshair'; // Ceruza kurzor
      isPencilModeActive = true;
      isEraserModeActive = false;
      canvas!.style.pointerEvents = 'auto'; // A vászonon lévő események engedélyezése
    }
  };
  
  export { togglePencilMode, toggleEraserMode };
  
  