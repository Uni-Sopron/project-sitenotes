// ide kerül a colorpicker kódja

const createColorSpectrum = (
    rows: number = 4,
    cols: number = 10,
    onColorChange?: (color: string) => void
  ): HTMLElement => {
    // Konténer létrehozása
    const container = document.createElement('div');
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    container.style.gap = '2px';
  
    // Színek generálása
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const hue = Math.round((360 / cols) * col); // Árnyalat
        const lightness = 50 + row * (50 / rows); // Világosság
        const color = `hsl(${hue}, 100%, ${lightness}%)`;
  
        // Téglák létrehozása
        const colorBox = document.createElement('div');
        colorBox.style.width = '20px';
        colorBox.style.height = '20px';
        colorBox.style.backgroundColor = color;
        colorBox.style.cursor = 'pointer';
        colorBox.style.border = '1px solid #000';

        if (onColorChange) {
            colorBox.onclick = () => onColorChange(color);
          }
  
        container.appendChild(colorBox);
      }
    }
  
    return container;
  };

  export {
    createColorSpectrum
  };
