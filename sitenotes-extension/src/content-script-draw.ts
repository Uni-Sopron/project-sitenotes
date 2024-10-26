// ide kerül a rajzoló kódja, ami rajzol a weboldalra.
let isPencilModeActive = false; // Ceruza mód állapota
let isDrawing = false;
let isEraserModeActive = false; // Radír mód állapota
let isErasing = false;

let lastX: number | null = null;
let lastY: number | null = null;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let eraseSize: number = 25;


const setupCanvas = () => {
    canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    // A canvas magassága a hosszabb értékre lesz beállítva (oldal hossza vagy képernyőmagasság)
    canvas.height = Math.max(window.innerHeight, document.body.scrollHeight);
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '9000';
    canvas.style.backgroundColor = 'transparent'; // Átlátszó hátterű vászon
    canvas.style.pointerEvents = 'auto';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
}

const clearCanvas = () => {
  ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
};

const addPencilEventListeners = () => {
  canvas!.addEventListener('mousedown', startDrawing);
  canvas!.addEventListener('mousemove', draw);
  canvas!.addEventListener('mouseup', stopDrawing);
  canvas!.addEventListener('mouseout', stopDrawing);

  canvas!.addEventListener('touchstart', startDrawing, { passive: true });
  canvas!.addEventListener('touchmove', draw, { passive: false });
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

    canvas!.addEventListener('touchstart', startErasing, { passive: true });
    canvas!.addEventListener('touchmove', erase, { passive: false });
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

const stopEraserMode = () => {
    canvas!.style.cursor = 'default';
    removeEraserEventlisteners();
    setEraserModeActive(false);
    canvas!.style.pointerEvents = 'none'; // A vászonon lévő események letiltása
}

// ERASER FUNCTIONALITY
const toggleEraserMode = () => {

    if (isEraserModeActive) {
      // Ha a radír mód aktív, akkor visszaállítjuk az egérkurzort és deaktiváljuk a radírozást
      stopEraserMode();
    } else {
      // Ha a radír mód inaktív, akkor aktiváljuk
      lastX = null; // felejtse el a ceruza állapotát
      lastY = null;
      activateEraserMode();
      removePencilEventlisteners();
      canvas!.style.cursor = 'crosshair';
      setEraserModeActive(true);
      setPencilModeActive(false);
      canvas!.style.pointerEvents = 'auto'; // A vászonon lévő események engedélyezése
    }
  };
  
  const activateEraserMode = () => {
    if (!canvas) {setupCanvas();}
    addEraserEventListeners();
  };

  const erase = (e: MouseEvent | TouchEvent) => {
    e.preventDefault(); // Az alapértelmezett viselkedés letiltása (pl. görgetés)

  if (ctx && canvas && isErasing) {
    let x = 0;
    let y = 0;

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

    if (lastX !== null && lastY !== null) {
      // Ha van előző pontunk, akkor vonalat húzunk
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.lineWidth = eraseSize;
      ctx.stroke(); // A vonal kirajzolása
    }

    // A jelenlegi pontot tároljuk a következő vonalhoz
    lastX = x;
    lastY = y;

    ctx.restore(); // Visszaállítjuk az eredeti állapotot
    }
  };
  
  const startErasing = () => {
    isErasing = true;
  };
  
  const stopErasing = () => {
    isErasing = false;
    lastX = null;
    lastY = null;
  };
  
 const setEraserSize = (size: number) => {
    eraseSize = size;
};


const setEraserModeActive = (value: boolean) => {
isEraserModeActive = value;
}

const getEraserModeActive = () => {
return isEraserModeActive;
}

const stopPencilMode = () => {
  canvas!.style.cursor = 'default'; // Alapértelmezett egérkurzor
  removePencilEventlisteners();
  setPencilModeActive(false);
  canvas!.style.pointerEvents = 'none'; // A vászonon lévő események letiltása
}
  
  
  // PENCIL FUNCTIONALITY
  const togglePencilMode = () => {
    if (isPencilModeActive) {
      // Ha a ceruza mód aktív, akkor visszaállítjuk az egérkurzort és deaktiváljuk a rajzolást
      stopPencilMode();
    } else {
      // Ha a ceruza mód inaktív, akkor aktiváljuk
      activatePencilMode();
      removeEraserEventlisteners();
      canvas!.style.cursor = 'crosshair'; // Ceruza kurzor
      setPencilModeActive(true);
      setEraserModeActive(false);
      canvas!.style.pointerEvents = 'auto'; // A vászonon lévő események engedélyezése
    }
  };

  const setPencilSize = (size: number) => {
    if (ctx) {
      ctx.lineWidth = size;
    }
  }
  
  const activatePencilMode = () => {
    if (!canvas) {
      setupCanvas();
    }
    if (ctx) {
      // Beállítjuk a rajzolás alapértelmezett tulajdonságait
      ctx.strokeStyle = '#1974D2';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = 30;
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
        if (lastX !== null && lastY !== null) {
            ctx.moveTo(lastX, lastY);     // Rajzolás a korábbi pozícióból
        }
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

  const setPencilModeActive = (value: boolean) => {
    isPencilModeActive = value;
  };

  const getPencilModeActive = () => {
    return isPencilModeActive;
  };

  export { 
    togglePencilMode, 
    toggleEraserMode, 
    setEraserSize, 
    getEraserModeActive, 
    setEraserModeActive, 
    setPencilModeActive, 
    getPencilModeActive, 
    stopEraserMode,
    stopPencilMode,
    clearCanvas,
    setPencilSize};
  
  