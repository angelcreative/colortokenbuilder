// Variables globales
let colorWheel;
let colorWheelContainer;
let hexInput;
let currentPalettes = [];
let debounceTimer;

// Funciones de utilidad
function getRGBValues(hex) {
    const rgb = chroma(hex).rgb();
    return `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`;
}

// Funciones de UI
function applyDynamicStyles(colorPalette) {
    const root = document.documentElement;

    function getRGBValues(hex) {
        const rgb = chroma(hex).rgb();
        return `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`;
    }

    Object.keys(colorPalette).forEach((colorKey, index) => {
        if (index >= 4) return;

        const palette = colorPalette[colorKey];
        const colorName = `color-${index + 1}`;

        // Establecer variables RGB para usar con opacidad
        root.style.setProperty(`--${colorName}-rgb`, getRGBValues(palette["500"]));
        
        // Establecer variables de color
        root.style.setProperty(`--background-${colorName}-50`, palette["50"]);
        root.style.setProperty(`--background-${colorName}-100`, palette["100"]);
        root.style.setProperty(`--color-${colorName}`, palette["800"]);
        root.style.setProperty(`--button-${colorName}`, palette["600"]);

        // Variables para estados
        root.style.setProperty(`--${colorName}-hover`, palette["700"]);
        root.style.setProperty(`--${colorName}-disabled`, palette["300"]);
    });

    updateUIComponents(colorPalette);
}

function updateUIComponents(colorPalette) {
    updateButtons(colorPalette);
    updateInputs(colorPalette);
    updateCards(colorPalette);
}

function updateButtons(colorPalette) {
    const primaryButtons = document.querySelectorAll('#uiPreview .primary-button');
    const secondaryButtons = document.querySelectorAll('#uiPreview .secondary-button');
    const tertiaryButtons = document.querySelectorAll('#uiPreview .tertiary-button');
    
    if (Object.keys(colorPalette).length > 0) {
        const primaryColor = colorPalette[Object.keys(colorPalette)[0]];
        const secondaryColor = colorPalette[Object.keys(colorPalette)[1]] || primaryColor;
        
        primaryButtons.forEach(button => {
            button.style.backgroundColor = primaryColor["600"];
            button.style.color = primaryColor["50"];
        });
        
        secondaryButtons.forEach(button => {
            button.style.backgroundColor = 'transparent';
            button.style.color = secondaryColor["600"];
            button.style.border = `2px solid ${secondaryColor["600"]}`;
        });

        tertiaryButtons.forEach(button => {
            button.style.backgroundColor = 'transparent';
            button.style.color = primaryColor["600"];
            button.style.border = `1px solid ${primaryColor["200"]}`;
        });
    }
}

function updateInputs(colorPalette) {
    const inputs = document.querySelectorAll('#uiPreview .input-field');
    
    if (Object.keys(colorPalette).length > 0) {
        const primaryColor = colorPalette[Object.keys(colorPalette)[0]];
        
        inputs.forEach(input => {
            input.style.borderColor = primaryColor["200"];
            input.style.backgroundColor = primaryColor["50"];
            input.style.color = primaryColor["900"];
            input.style.setProperty('--placeholder-color', primaryColor["400"]);
        });
    }
}


function updateCards(colorPalette) {
    const cards = document.querySelectorAll('#uiPreview .card');
    
    if (Object.keys(colorPalette).length > 0) {
        const primaryColor = colorPalette[Object.keys(colorPalette)[0]];
        
        cards.forEach(card => {
            card.style.backgroundColor = primaryColor["50"];
            card.style.borderColor = primaryColor["200"];
            card.style.color = primaryColor["900"];
            card.style.boxShadow = `0 4px 6px rgba(${getRGBValues(primaryColor["900"])}, 0.1)`;
        });
    }
}

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

function showAlert(message) {
    const alertBox = document.getElementById('custom-alert');
    const alertMessage = document.getElementById('alert-message');

    alertMessage.textContent = message;
    alertBox.style.display = 'flex';
    alertBox.style.flexDirection = 'column';
    alertBox.style.alignItems = 'center';
    alertBox.style.gap = '24px';

    const alertOkButton = document.getElementById('alert-ok');
    alertOkButton.onclick = function() {
        alertBox.style.display = 'none';
    };
}

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

    baseColors.forEach(color => {
        let colorName = ntc.name(color)[1];
        colorName = colorName.replace(/-color.*$/i, '').trim();

        const palette = document.createElement('div');
        palette.style.display = 'flex';
        palette.style.flexDirection = 'row';
        palette.style.gap = '10px';
        palette.style.flexWrap = 'wrap';

        let paletteColor = chroma(color).set('hsl.l', 0.95).hex();
        let hexColor = paletteColor.toUpperCase();
        let card = createColorCard('50', hexColor, paletteColor, selectedColor);
        palette.appendChild(card);

        for (let i = 1; i <= 9; i++) {
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

    if (chroma.valid(selectedColor) && chroma(paletteColor).hex() === chroma(selectedColor).hex()) {
        card.style.border = '3px solid #000000';
    }

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

function generatePaletteJSON(baseColors) {
    const palettes = {};

    baseColors.forEach(color => {
        let colorName = ntc.name(color)[1];
        colorName = colorName.replace(/-color.*$/i, '').trim().toLowerCase().replace(/\s+/g, '-');

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

// Evento principal
document.addEventListener('DOMContentLoaded', function() {
    colorWheelContainer = document.getElementById('colorWheelContainer');
    hexInput = document.getElementById('hexInput');
    
    const toggleSwitch = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            toggleSwitch.checked = true;
        }
    }

    toggleSwitch.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    colorWheel = new iro.ColorPicker(colorWheelContainer, {
        width: 200,
        color: "#a2c299"
    });

    colorWheel.on(['color:init', 'color:change'], function(color) {
        updateHarmonyColors(color.hexString);
        hexInput.value = color.hexString;
        
        const colors = getHarmonyColors(color.hexString, document.getElementById('harmonyType').value);
        const colorPalette = generatePaletteJSON(colors);
        applyDynamicStyles(colorPalette);
    });

    document.getElementById('harmonyType').addEventListener('change', function() {
        updateHarmonyColors(colorWheel.color.hexString);
    });

    hexInput.addEventListener('input', function() {
        const hexValue = hexInput.value.trim();
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (chroma.valid(hexValue)) {
                colorWheel.color.hexString = hexValue;
            }
        }, 300);
    });

    document.getElementById('exportSvgButton').addEventListener('click', exportPalettesAsSVG);
    document.getElementById('exportJsonButton').addEventListener('click', exportPalettesAsJSON);

    updateHarmonyColors(colorWheel.color.hexString);
});


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
    const totalHeight = Object.keys(currentPalettes).length * 120 + 20;
    svg.setAttribute("width", "810");
    svg.setAttribute("height", `${totalHeight}`);

    Object.keys(currentPalettes).forEach((colorName, index) => {
        const palette = currentPalettes[colorName];

        const group = document.createElementNS(svgNS, "g");
        group.setAttribute("transform", `translate(0, ${index * 120 + 20})`);

        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", "10");
        text.setAttribute("y", "30");
        text.setAttribute("font-size", "20");
        text.setAttribute("font-family", "Arial");
        text.textContent = colorName.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
        group.appendChild(text);

        Object.keys(palette).forEach((shade, i) => {
            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("x", `${80 * i + 10}`);
            rect.setAttribute("y", "40");
            rect.setAttribute("width", "70");
            rect.setAttribute("height", "70");
            rect.setAttribute("fill", palette[shade]);
            group.appendChild(rect);

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
