document.addEventListener('DOMContentLoaded', function() {

const toggleSwitch = document.getElementById('theme-toggle');

// Get the current theme from localStorage
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
  document.documentElement.setAttribute('data-theme', currentTheme);

  // If the theme is dark, mark the switch as active
  if (currentTheme === 'dark') {
    toggleSwitch.checked = true;
  }
}

// Listen for changes in the switch
toggleSwitch.addEventListener('change', function() {
  if (this.checked) {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }
});


    
    
    var colorWheelContainer = document.getElementById('colorWheelContainer');
    var hexInput = document.getElementById('hexInput');
    var currentPalettes = [];  // Store currently displayed palettes

    var colorWheel = new iro.ColorPicker(colorWheelContainer, {
        width: 200,
        color: "#a2c299"
    });

    function updateHarmonyColors(baseColor) {
        const harmonyType = document.getElementById('harmonyType').value;
        const colors = getHarmonyColors(baseColor, harmonyType);
        displayColors(colors);
        updateColorIndicators(colors);
        updateDisplayedPalettes(colors);
        displayColorCards(colors, baseColor);
    }

    function getHarmonyColors(color, type) {
        const baseColor = chroma(color);
        const baseHue = baseColor.get('hsl.h');
        const baseSaturation = baseColor.get('hsl.s');
        const baseLightness = baseColor.get('hsl.l');
        let hues;

        switch (type) {
            case 'complementary':
                hues = [baseHue, (baseHue + 180) % 360];
                break;
            case 'analogous':
                hues = [(baseHue - 30 + 360) % 360, baseHue, (baseHue + 30) % 360];
                break;
            case 'triadic':
                hues = [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];
                break;
            case 'square':
                hues = [baseHue, (baseHue + 90) % 360, (baseHue + 180) % 360, (baseHue + 270) % 360];
                break;
        }

        return hues.map(hue => chroma.hsl(hue, baseSaturation, baseLightness).hex());
    }

    function displayColors(colors) {
        const harmonyColors = document.getElementById('harmonyColors');
        harmonyColors.innerHTML = '';
        colors.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.style.backgroundColor = color;
            harmonyColors.appendChild(colorDiv);
        });
    }

    function updateColorIndicators(colors) {
        colorWheelContainer.querySelectorAll('.colorIndicator').forEach(indicator => indicator.remove());

        const wheelRadius = colorWheelContainer.offsetWidth / 2;
        const centerX = wheelRadius;
        const centerY = wheelRadius;

        colors.forEach((color, index) => {
            if (index === 0) return;

            const hue = chroma(color).get('hsl.h');
            const angleRadians = (hue * Math.PI / 180);
            const indicatorX = centerX + wheelRadius * Math.cos(angleRadians);
            const indicatorY = centerY - wheelRadius * Math.sin(angleRadians);

            const indicator = document.createElement('div');
            indicator.classList.add('colorIndicator');
            indicator.style.position = 'absolute';
            indicator.style.left = `${indicatorX}px`;
            indicator.style.top = `${indicatorY}px`;
            indicator.style.transform = 'translate(-50%, -50%)';
            indicator.style.backgroundColor = color;

            colorWheelContainer.appendChild(indicator);
        });
    }

    
    
    //COPY 
/* Function to copy the color to clipboard
function copyToClipboard(colorHex) {
    const el = document.createElement('textarea');
    el.value = colorHex;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert('Color ' + colorHex + ' copied to clipboard!');
}*/
// Function to show the custom alert
function showAlert(message) {
  const alertBox = document.getElementById('custom-alert');
  const alertMessage = document.getElementById('alert-message');

 // Set the message in the alert box
alertMessage.textContent = message;
alertBox.style.display = 'flex';  // Show the alert box
alertBox.style.flexDirection = 'column';  // Set flex direction to column
alertBox.style.alignItems = 'center';  // Align items to stretch
alertBox.style.gap = '24px';  // Set gap between elements


  // Close the alert when the user clicks the button
  const alertOkButton = document.getElementById('alert-ok');
  alertOkButton.onclick = function() {
    alertBox.style.display = 'none';  // Hide the alert box
  };
}

  // Function to copy the color to clipboard
function copyToClipboard(colorHex) {
  const el = document.createElement('textarea');
  el.value = colorHex;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  showAlert('Color ' + colorHex + ' copied to clipboard!');
}
    
    function generateColorPalettes(baseColors, selectedColor) {
        const paletteContainer = document.createElement('div');
        paletteContainer.id = 'paletteContainer';
       /* paletteContainer.style.display = 'flex';
        paletteContainer.style.flexDirection = 'column';
        paletteContainer.style.gap = '20px';
        paletteContainer.style.width = '100%';*/

        baseColors.forEach(color => {
            let colorName = ntc.name(color)[1];
            colorName = colorName.replace(/-color.*$/i, '').trim();

            const palette = document.createElement('div');
            palette.style.display = 'flex';
            palette.style.flexDirection = 'row';
            palette.style.gap = '10px';
            palette.style.flexWrap = 'wrap';

            // Create the lightest value (50)
            let paletteColor = chroma(color).set('hsl.l', 0.95).hex();
            let hexColor = paletteColor.toUpperCase();
            let card = createColorCard('50', hexColor, paletteColor, selectedColor);
            palette.appendChild(card);

            for (let i = 1; i <= 9; i++) {  // Light to dark (100 to 900)
                const lightness = 1 - (i * 0.1);
                paletteColor = chroma(color).set('hsl.l', lightness).hex();
                hexColor = paletteColor.toUpperCase();
                card = createColorCard(`${i * 100}`, hexColor, paletteColor, selectedColor);
                palette.appendChild(card);
            }

            const paletteTitle = document.createElement('h4');
            paletteTitle.textContent = colorName;
            paletteContainer.appendChild(paletteTitle);
            paletteContainer.appendChild(palette);
        });

        const colorCardsContainer = document.getElementById('colorCards');
        colorCardsContainer.appendChild(paletteContainer);
    }

    function createColorCard(tokenName, hexColor, paletteColor, selectedColor) {
    const card = document.createElement('div');
    card.classList.add('colorCard', 'gradientCard');
    card.style.backgroundColor = paletteColor;
    card.style.color = chroma(paletteColor).luminance() > 0.5 ? '#333333' : '#ffffff';
    card.style.width = '80px';
    card.style.height = '80px'; 
    card.style.borderRadius = '8px'; 
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.justifyContent = 'center';
    card.style.alignItems = 'center';
    card.style.fontFamily = 'Arial, sans-serif';
    card.style.fontSize = '14px';

    // Highlight the matching color
    if (chroma.valid(selectedColor) && chroma(paletteColor).hex() === chroma(selectedColor).hex()) {
        card.style.border = '3px solid #000000';
    }

    // Add a button to copy the hex color
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy';
    copyButton.style.marginTop = '8px';
    copyButton.style.fontSize = '10px';
    copyButton.style.padding = '4px';
    copyButton.style.borderRadius = '4px';
    copyButton.style.cursor = 'pointer';
    copyButton.style.background = '#000';
    copyButton.style.color = '#fff';
    copyButton.addEventListener('click', function() {
        copyToClipboard(hexColor);
    });

    card.innerHTML = `
        <div style="font-size: 14px; font-weight: bold;">${tokenName}</div>
        <div style="font-size: 14px; margin-top: 4px;">${hexColor}</div>
    `;
    card.appendChild(copyButton);

    return card;
}

  
      function updateDisplayedPalettes(baseColors) {
        const colorPalette = generatePaletteJSON(baseColors); // Genera el colorPalette

        applyDynamicStyles(colorPalette); // Aplica los estilos dinámicos utilizando el colorPalette generado
    }



    function displayColorCards(colors) {
        const colorCardsContainer = document.getElementById('colorCards');
        colorCardsContainer.innerHTML = '';

        colors.forEach(color => {
            const rgbColor = chroma(color).rgb();
            const [r, g, b] = rgbColor;
            let colorName = ntc.name(color)[1];

            colorName = colorName.replace(/ Color RGB.*/, '');

            const hexColor = chroma(color).hex();
            const hslColor = chroma(color).hsl().map(value => value.toFixed(2));

            const textColor = chroma(color).luminance() > 0.5 ? '#000000' : '#ffffff';

            const cardDiv = document.createElement('div');
            cardDiv.classList.add('colorCard');
            cardDiv.style.backgroundColor = color;
            cardDiv.style.color = textColor;
            cardDiv.innerHTML = `
                <p>${colorName}</p>
                <p>RGB: ${r} ${g} ${b}</p>
                <p>HEX: ${hexColor}</p>
                <p>HSL: ${hslColor[0]} ${hslColor[1]} ${hslColor[2]}</p>
            `;
            colorCardsContainer.appendChild(cardDiv);
        });

        generateColorPalettes(colors);
        updateDisplayedPalettes(colors); // Store the currently displayed palettes
    }

    function updateDisplayedPalettes(baseColors) {
    currentPalettes = generatePaletteJSON(baseColors); // Almacenar las paletas generadas para exportación
    
    applyDynamicStyles(currentPalettes); // Aplicar los estilos dinámicos utilizando el colorPalette generado
}


    colorWheel.on(['color:init', 'color:change'], function(color) {
        updateHarmonyColors(color.hexString);
        hexInput.value = color.hexString; // Update the hex input field when the color changes
    });

    document.getElementById('harmonyType').addEventListener('change', function() {
        updateHarmonyColors(colorWheel.color.hexString);
    });

    hexInput.addEventListener('input', function() {
        const hexValue = hexInput.value.trim();
        if (chroma.valid(hexValue)) {
            colorWheel.color.hexString = hexValue; // Update the color wheel's position and harmony colors
        }
    });

    updateHarmonyColors(colorWheel.color.hexString);

    // Export functions
    document.getElementById('exportSvgButton').addEventListener('click', exportPalettesAsSVG);
    document.getElementById('exportJsonButton').addEventListener('click', exportPalettesAsJSON);

    function generatePaletteJSON(baseColors) {
        const palettes = {};

        baseColors.forEach(color => {
            let colorName = ntc.name(color)[1];
            colorName = colorName.replace(/-color.*$/i, '').trim().toLowerCase().replace(/\s+/g, '-'); // Format color name for JSON key

            const palette = {};
            const shades = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

            shades.forEach((shade, i) => {
                const lightness = 1 - (i * 0.1);
                const paletteColor = chroma(color).set('hsl.l', i === 0 ? 0.95 : lightness).hex();
                palette[shade] = paletteColor.toLowerCase();
            });

            palettes[colorName] = palette;
        });

        return palettes;
    }

    function exportPalettesAsJSON() {
        if (!currentPalettes || Object.keys(currentPalettes).length === 0) {
            alert("No palettes to export.");
            return;
        }

        const jsonBlob = new Blob([JSON.stringify(currentPalettes, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(jsonBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "color_palettes.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function createSVGPaletteFromCurrent() {
        if (!currentPalettes || Object.keys(currentPalettes).length === 0) {
            alert("No palettes to export.");
            return null;
        }

        const svgNS = "http://www.w3.org/2000/svg"; 
        const svg = document.createElementNS(svgNS, "svg");
        const totalHeight = Object.keys(currentPalettes).length * 120 + 20; // Calculate height based on number of palettes
        svg.setAttribute("width", "810");
        svg.setAttribute("height", `${totalHeight}`);

        Object.keys(currentPalettes).forEach((colorName, index) => {
            const palette = currentPalettes[colorName];

            // Create a group element for each color's palette
            const group = document.createElementNS(svgNS, "g");
            group.setAttribute("transform", `translate(0, ${index * 120 + 20})`);

            // Add the color name as a text element
            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("x", "10");
            text.setAttribute("y", "30");
            text.setAttribute("font-size", "20");
            text.setAttribute("font-family", "Arial");
            text.textContent = colorName.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
            group.appendChild(text);

            // Create rectangles for the color shades
            Object.keys(palette).forEach((shade, i) => {
                const rect = document.createElementNS(svgNS, "rect");
                rect.setAttribute("x", `${80 * i + 10}`);
                rect.setAttribute("y", "40");
                rect.setAttribute("width", "70");
                rect.setAttribute("height", "70");
                rect.setAttribute("fill", palette[shade]);
                group.appendChild(rect);

                // Add the shade number as a text element on each rectangle
                const shadeText = document.createElementNS(svgNS, "text");
                shadeText.setAttribute("x", `${80 * i + 45}`);
                shadeText.setAttribute("y", "90");
                shadeText.setAttribute("font-size", "14");
                shadeText.setAttribute("font-family", "Arial");
                shadeText.setAttribute("text-anchor", "middle");
                shadeText.setAttribute("fill", chroma(palette[shade]).luminance() > 0.5 ? '#333' : '#fff');
                shadeText.textContent = shade;
                group.appendChild(shadeText);
            });

            svg.appendChild(group);
        });

        return svg;
    }

    function exportPalettesAsSVG() {
        const svg = createSVGPaletteFromCurrent();
        if (!svg) return;

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);

        const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(svgBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "color_palettes.svg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }


let debounceTimer;

hexInput.addEventListener('input', function () {
    const hexValue = hexInput.value.trim();

    // Clear previous debounce timer if still running
    clearTimeout(debounceTimer);

    // Set a debounce timer to update the color after a delay
    debounceTimer = setTimeout(() => {
        if (chroma.valid(hexValue)) {
            colorWheel.color.hexString = hexValue; // Update the color wheel
        }
    }, 300); // Delay in milliseconds (300ms)
});

    
});



function applyDynamicStyles(colorPalette) {
    const root = document.documentElement;

    Object.keys(colorPalette).forEach((colorKey, index) => {
        if (index >= 4) return;  // Solo aplica un máximo de 4 colores

        const palette = colorPalette[colorKey];
        const colorName = `color-${index + 1}`; // Crear un nombre dinámico basado en el índice

        // Asigna las variables CSS dinámicamente
        root.style.setProperty(`--background-${colorName}-50`, palette["50"]);
        root.style.setProperty(`--background-${colorName}-100`, palette["100"]);
        root.style.setProperty(`--color-${colorName}`, palette["800"]);
        root.style.setProperty(`--button-${colorName}`, palette["600"]);

        // Log para verificar que las variables están siendo asignadas
        console.log(`--background-${colorName}-50: ${palette["50"]}`);
        console.log(`--background-${colorName}-100: ${palette["100"]}`);
        console.log(`--color-${colorName}: ${palette["800"]}`);
        console.log(`--button-${colorName}: ${palette["600"]}`);
    });

    // Asignar las variables CSS estáticas a las dinámicas usando las variables con el valor de "50"
    root.style.setProperty('--background-primary', 'var(--background-color-1-50)');
    root.style.setProperty('--color-primary', 'var(--color-color-1)');
    root.style.setProperty('--button-primary', 'var(--button-color-1)');

    root.style.setProperty('--background-secondary', 'var(--background-color-2-50)');
    root.style.setProperty('--color-secondary', 'var(--color-color-2)');
    root.style.setProperty('--button-secondary', 'var(--button-color-2)');

    root.style.setProperty('--background-tertiary', 'var(--background-color-3-50)');
    root.style.setProperty('--color-tertiary', 'var(--color-color-3)');
    root.style.setProperty('--button-tertiary', 'var(--button-color-3)');

    root.style.setProperty('--background-quaternary', 'var(--background-color-4-50)');
    root.style.setProperty('--color-quaternary', 'var(--color-color-4)');
    root.style.setProperty('--button-quaternary', 'var(--button-color-4)');
}



