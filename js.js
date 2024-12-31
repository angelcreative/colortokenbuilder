// Declarar colorWheel globalmente
let colorWheel;

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
    
        // Inicializar colorWheel
        colorWheel = new iro.ColorPicker(colorWheelContainer, {
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
                const colorName = ntc.name(color)[1].replace(/-color.*$/i, '').trim();
                const rgbColor = chroma(color).rgb();
                const cardHTML = `
                    <div class="color-card">
                        <div class="color-preview" style="background-color: ${color};"></div>
                        <div class="color-info">
                            <div class="color-name">${colorName}</div>
                            <div class="color-rgb">RGB ${rgbColor.join(' ')}</div>
                            <div class="color-hex">${color.toUpperCase()}</div>
                            <div class="color-value">600</div>
                        </div>
                    </div>
                `;
                harmonyColors.innerHTML += cardHTML;
            });
        }
    
        function updateColorIndicators(colors) {
            // Primero eliminar los indicadores existentes
            colorWheelContainer.querySelectorAll('.colorIndicator').forEach(indicator => indicator.remove());

            // Obtener las dimensiones del color wheel
            const wheelSize = colorWheel.props.width; // Usar el tamaño del colorWheel
            const wheelRadius = wheelSize / 2;
            const centerX = wheelRadius;
            const centerY = wheelRadius;

            // Crear indicadores para todos los colores excepto el principal
            colors.forEach((color, index) => {
                if (index === 0) return; // Saltar el color principal

                const hue = chroma(color).get('hsl.h');
                const angleRadians = (hue * Math.PI / 180);
                
                // Calcular la posición en el círculo
                const indicatorX = centerX + (wheelRadius - 15) * Math.cos(angleRadians);
                const indicatorY = centerY - (wheelRadius - 15) * Math.sin(angleRadians);

                // Crear el indicador
                const indicator = document.createElement('div');
                indicator.classList.add('colorIndicator');
                indicator.style.position = 'absolute';
                indicator.style.left = `${indicatorX}px`;
                indicator.style.top = `${indicatorY}px`;
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
        
        function generateShades(baseColor) {
            const color = chroma(baseColor);
            const shades = {};
            
            // Generar tonos desde 300 hasta 900 (más oscuros)
            for(let i = 3; i <= 9; i++) {
                const shade = i * 100;
                shades[shade] = color.darken((i-3) * 0.3).hex();
            }
            
            // Generar tonos más claros (50, 100, 200) con una degradación extremadamente sutil hacia blanco
            const baseLight = chroma(shades[300]);
            shades[200] = baseLight.luminance(0.95).hex();  // Muy cercano al blanco pero mantiene un toque del color
            shades[100] = baseLight.luminance(0.97).hex();  // Aún más cercano al blanco
            shades[50] = baseLight.luminance(0.98).hex();   // Prácticamente blanco con un toque imperceptible del color
            
            return shades;
        }
    
        function applyDynamicStyles(colorPalette) {
            const root = document.documentElement;
            
            if (!colorWheel) {
                console.warn('ColorWheel no está inicializado');
                return;
            }

            const selectedColor = colorWheel.color.hexString;
            // Usar generateShades en lugar de la escala manual
            const shades = generateShades(selectedColor);

            // Establecer variables del color primario
            root.style.setProperty('--color-primary-50', shades[50]);
            root.style.setProperty('--color-primary-100', shades[100]);
            root.style.setProperty('--color-primary-200', shades[200]);
            root.style.setProperty('--color-primary-300', shades[300]);
            root.style.setProperty('--color-primary-400', shades[400]);
            root.style.setProperty('--color-primary-500', shades[500]);
            root.style.setProperty('--color-primary-600', selectedColor);
            root.style.setProperty('--color-primary-700', shades[700]);
            root.style.setProperty('--color-primary-800', shades[800]);
            root.style.setProperty('--color-primary-900', shades[900]);

            // Asignar las variables CSS dinámicamente para los otros colores
            Object.keys(colorPalette).forEach((colorKey, index) => {
                if (index >= 4) return;

                const palette = colorPalette[colorKey];
                const colorName = `color-${index + 1}`;

                root.style.setProperty(`--background-${colorName}-50`, palette["50"]);
                root.style.setProperty(`--background-${colorName}-100`, palette["100"]);
                root.style.setProperty(`--color-${colorName}`, palette["800"]);
                root.style.setProperty(`--button-${colorName}`, index === 0 ? selectedColor : palette["600"]);
            });

            // Asignar las variables CSS estáticas
            root.style.setProperty('--background-primary', 'var(--background-color-1-50)');
            root.style.setProperty('--color-primary', 'var(--color-color-1)');
            root.style.setProperty('--button-primary', selectedColor);
        }
        
        function generateColorPalettes(colors) {
            return colors.map(color => {
                const shades = generateShades(color);
                return {
                    '50': shades[50],
                    '100': shades[100],
                    '200': shades[200],
                    '300': shades[300],
                    '400': shades[400],
                    '500': shades[500],
                    '600': color,         // Color base
                    '700': shades[700],
                    '800': shades[800],
                    '900': shades[900]
                };
            });
        }
    
        function displayColorCards(colors, baseColor) {
            const palettes = generateColorPalettes(colors);
            const container = document.getElementById('colorPalettes');
            container.innerHTML = '';

            palettes.forEach((palette, index) => {
                const colorName = ntc.name(colors[index])[1].replace(/-color.*$/i, '').trim();
                const card = createColorCard(palette, colorName);
                container.appendChild(card);
            });
        }
    
        function createColorCard(palette, colorName) {
            const card = document.createElement('div');
            card.className = 'color-card';

            // Crear el preview del color base (600)
            const colorPreview = document.createElement('div');
            colorPreview.className = 'color-preview';
            colorPreview.style.backgroundColor = palette['600'];

            // Crear el contenedor de información
            const colorInfo = document.createElement('div');
            colorInfo.className = 'color-info';

            // Añadir nombre del color
            const nameDiv = document.createElement('div');
            nameDiv.className = 'color-name';
            nameDiv.textContent = colorName;

            // Añadir valor RGB
            const rgbColor = chroma(palette['600']).rgb();
            const rgbDiv = document.createElement('div');
            rgbDiv.className = 'color-rgb';
            rgbDiv.textContent = `RGB ${rgbColor.join(' ')}`;

            // Añadir valor HEX
            const hexDiv = document.createElement('div');
            hexDiv.className = 'color-hex';
            hexDiv.textContent = palette['600'].toUpperCase();

            // Añadir valor 600
            const valueDiv = document.createElement('div');
            valueDiv.className = 'color-value';
            valueDiv.textContent = '600';

            // Ensamblar la tarjeta
            colorInfo.appendChild(nameDiv);
            colorInfo.appendChild(rgbDiv);
            colorInfo.appendChild(hexDiv);
            colorInfo.appendChild(valueDiv);

            card.appendChild(colorPreview);
            card.appendChild(colorInfo);

            // Añadir los shades
            const shadesContainer = document.createElement('div');
            shadesContainer.className = 'shades-container';

            // Crear elementos para cada shade
            ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'].forEach(shade => {
                const shadeElement = document.createElement('div');
                shadeElement.className = 'shade-item';
                shadeElement.style.backgroundColor = palette[shade];
                
                const shadeLabel = document.createElement('div');
                shadeLabel.className = 'shade-label';
                shadeLabel.textContent = shade;
                
                const shadeHex = document.createElement('div');
                shadeHex.className = 'shade-hex';
                shadeHex.textContent = palette[shade].toUpperCase();

                shadeElement.appendChild(shadeLabel);
                shadeElement.appendChild(shadeHex);
                shadesContainer.appendChild(shadeElement);

                // Añadir funcionalidad de copia al hacer clic
                shadeElement.addEventListener('click', () => {
                    copyToClipboard(palette[shade].toUpperCase());
                });
            });

            card.appendChild(shadesContainer);
            return card;
        }
        
      
          function updateDisplayedPalettes(baseColors) {
            const colorPalette = generatePaletteJSON(baseColors); // Genera el colorPalette
    
            applyDynamicStyles(colorPalette); // Aplica los estilos dinámicos utilizando el colorPalette generado
        }
    
    
    
        function displayColorCards(colors) {
            const colorCardsContainer = document.getElementById('colorCards');
            
            // Limpiar solo el contenedor de paletas si existe
            const existingPaletteContainer = document.getElementById('paletteContainer');
            if (existingPaletteContainer) {
                existingPaletteContainer.remove();
            }

            // Generar las nuevas paletas
            generateColorPalettes(colors);
            
            // Actualizar los estilos dinámicos
            updateDisplayedPalettes(colors);
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
    
        hexInput.addEventListener('input', function(e) {
            const hexValue = this.value.trim();
            
            // Permitir pegar y editar
            if (e.inputType === 'insertFromPaste') {
                setTimeout(() => {
                    if (chroma.valid(hexValue)) {
                        colorWheel.color.hexString = hexValue;
                        this.value = hexValue;
                    }
                }, 0);
                return;
            }

            // Validar entrada manual
            if (hexValue.length === 7 && chroma.valid(hexValue)) {
                colorWheel.color.hexString = hexValue;
            }
        });

        // Agregar evento de pegado específico
        hexInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const cleanHex = pastedText.trim();
            
            if (chroma.valid(cleanHex)) {
                this.value = cleanHex;
                colorWheel.color.hexString = cleanHex;
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
        
        if (!colorWheel) {
            console.warn('ColorWheel no está inicializado');
            return;
        }

        const selectedColor = colorWheel.color.hexString;
        // Usar generateShades en lugar de la escala manual
        const shades = generateShades(selectedColor);

        // Establecer variables del color primario
        root.style.setProperty('--color-primary-50', shades[50]);
        root.style.setProperty('--color-primary-100', shades[100]);
        root.style.setProperty('--color-primary-200', shades[200]);
        root.style.setProperty('--color-primary-300', shades[300]);
        root.style.setProperty('--color-primary-400', shades[400]);
        root.style.setProperty('--color-primary-500', shades[500]);
        root.style.setProperty('--color-primary-600', selectedColor);
        root.style.setProperty('--color-primary-700', shades[700]);
        root.style.setProperty('--color-primary-800', shades[800]);
        root.style.setProperty('--color-primary-900', shades[900]);

        // Asignar las variables CSS dinámicamente para los otros colores
        Object.keys(colorPalette).forEach((colorKey, index) => {
            if (index >= 4) return;

            const palette = colorPalette[colorKey];
            const colorName = `color-${index + 1}`;

            root.style.setProperty(`--background-${colorName}-50`, palette["50"]);
            root.style.setProperty(`--background-${colorName}-100`, palette["100"]);
            root.style.setProperty(`--color-${colorName}`, palette["800"]);
            root.style.setProperty(`--button-${colorName}`, index === 0 ? selectedColor : palette["600"]);
        });

        // Asignar las variables CSS estáticas
        root.style.setProperty('--background-primary', 'var(--background-color-1-50)');
        root.style.setProperty('--color-primary', 'var(--color-color-1)');
        root.style.setProperty('--button-primary', selectedColor);
    }
    
    // Dropdown functionality
    document.querySelectorAll('.ui-dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const menu = toggle.nextElementSibling;
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.ui-dropdown-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    });
    
    // Cascade Dropdown
    document.querySelectorAll('.ui-cascade-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const menu = button.nextElementSibling;
            const isOpen = menu.style.display === 'block';
            
            // Cerrar todos los menús primero
            document.querySelectorAll('.ui-cascade-menu, .ui-cascade-submenu').forEach(m => {
                m.style.display = 'none';
            });

            // Abrir/cerrar el menú actual
            menu.style.display = isOpen ? 'none' : 'block';
        });
    });

    document.querySelectorAll('.ui-cascade-item').forEach(item => {
        const submenu = item.querySelector('.ui-cascade-submenu');
        if (submenu) {
            item.addEventListener('mouseenter', () => {
                submenu.style.display = 'block';
            });
            
            item.addEventListener('mouseleave', () => {
                submenu.style.display = 'none';
            });
        }
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', () => {
        document.querySelectorAll('.ui-cascade-menu, .ui-cascade-submenu').forEach(menu => {
            menu.style.display = 'none';
        });
    });
    
    // Custom Select
    document.querySelectorAll('.ui-select').forEach(select => {
        select.addEventListener('click', (e) => {
            const options = select.nextElementSibling;
            options.style.display = options.style.display === 'block' ? 'none' : 'block';
        });
    });
    
    
    
