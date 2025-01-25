// Declarar colorWheel globalmente
let colorWheel;

// Añadir esta variable global junto a las otras existentes
let currentButtonRadius = localStorage.getItem('preferredButtonRadius') || 'md';

// Añadir esta nueva función
function updateButtonRadius(radius, showToast = false) {
  currentButtonRadius = radius;
  document.documentElement.style.setProperty('--button-radius', `var(--radius-${radius})`);

  document.querySelectorAll('.radius-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.radius === radius);
  });

  localStorage.setItem('preferredButtonRadius', radius);

  // Solo mostrar el toast si showToast es true (cuando el usuario hace clic)
  if (showToast) {
    showCustomAlert(`Border radius changed to ${radius}`, 'radius');
  }
}

// Añadir esta función antes del DOMContentLoaded
function initSidebar() {
  const sidebarToggles = document.querySelectorAll('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');

  sidebarToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  });
}

// 1. Añadir la función showCustomAlert al inicio del archivo
function showCustomAlert(message, type = 'color') {
  const alertBox = document.getElementById('custom-alert');
  const alertMessage = document.getElementById('alert-message');

  if (!alertBox || !alertMessage) {
    console.warn('Custom alert elements not found, falling back to default alert');
    alert(message);
    return;
  }

  // Estilos mejorados para el toast
  Object.assign(alertBox.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#FFFFFF',
    color: '#000000',
    borderRadius: '8px',
    position: 'fixed',
    bottom: '-100px',
    left: '16px',
    transform: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: '9999',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    fontSize: '14px',
    fontWeight: '500',
    height: 'fit-content',
  });

  // Seleccionar el icono según el tipo de notificación
  let icon = '';
  switch (type) {
    case 'color':
      icon = 'palette';
      break;
    case 'typography':
      icon = 'text_fields';
      break;
    case 'radius':
      icon = 'rounded_corner';
      break;
    default:
      icon = 'info';
  }

  // Contenido del mensaje con icono contextual
  alertMessage.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span class="material-symbols-outlined" style="font-size: 16px;">
                ${icon}
            </span>
            <span>${message}</span>
        </div>
    `;

  // Mostrar el toast
  alertBox.style.display = 'flex';
  setTimeout(() => {
    alertBox.style.bottom = '16px';
  }, 100);

  // Auto-ocultar después de 3 segundos
  setTimeout(() => {
    alertBox.style.bottom = '-100px';
    setTimeout(() => {
      alertBox.style.display = 'none';
      // Limpiar el contenido después de que se oculte
      alertMessage.innerHTML = '';
    }, 300);
  }, 3000);
}

document.addEventListener('DOMContentLoaded', function () {
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
  toggleSwitch.addEventListener('change', function () {
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
  var currentPalettes = []; // Store currently displayed palettes

  // Inicializar colorWheel con Purple Heart
  colorWheel = new iro.ColorPicker(colorWheelContainer, {
    width: 200,
    color: '#5036C2',
  });

  // Establecer Square como valor por defecto
  const harmonySelect = document.getElementById('harmonyType');
  if (harmonySelect) {
    harmonySelect.value = 'square';
  }

  // Generar y mostrar los colores iniciales
  const initialColor = '#5036C2';
  const initialColors = getHarmonyColors(initialColor, 'square');

  if (initialColors) {
    // Limpiar el contenedor
    const harmonyColors = document.getElementById('harmonyColors');
    if (harmonyColors) {
      harmonyColors.innerHTML = '';
    }

    // Mostrar colores sólidos
    displayColors(initialColors);

    // Forzar la creación de gradientes inmediatamente después
    setTimeout(() => {
      displayGradientCards(initialColors);
    }, 0);

    // Mostrar paletas de color
    displayColorCards(initialColors);

    // Actualizar variables CSS
    updateCSSVariables(initialColor, initialColors);

    // Actualizar paletas mostradas
    updateDisplayedPalettes(initialColors);
  }

  function updateHarmonyColors(baseColor) {
    if (!baseColor || !chroma.valid(baseColor)) {
      console.warn('Invalid or no base color provided to updateHarmonyColors');
      baseColor = '#5036C2'; // Color por defecto
    }

    const harmonyType = document.getElementById('harmonyType')?.value || 'square';
    const colors = getHarmonyColors(baseColor, harmonyType);

    if (colors) {
      displayColors(colors);
      displayGradientCards(colors);
      updateDisplayedPalettes(colors);
      displayColorCards(colors);
      updateCSSVariables(baseColor, colors);
      updateColorIndicators(colors);
    }
  }

  function getHarmonyColors(color, type) {
    if (!color || !chroma.valid(color)) {
      console.warn('Invalid color provided to getHarmonyColors');
      return null;
    }

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
      default:
        hues = [baseHue, (baseHue + 90) % 360, (baseHue + 180) % 360, (baseHue + 270) % 360];
    }

    return hues.map((hue) => chroma.hsl(hue, baseSaturation, baseLightness).hex());
  }

  function displayColors(colors) {
    const harmonyColors = document.getElementById('harmonyColors');
    if (!harmonyColors || !colors) return;

    harmonyColors.innerHTML = '';

    colors.forEach((color) => {
      if (!color) return;
      const colorName = ntc
        .name(color)[1]
        .replace(/-color.*$/i, '')
        .trim();
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

  document.getElementById('harmonyType').value = 'square';
  updateHarmonyColors('#5036C2');

  function displayGradientCards(colors) {
    // Limpiar gradientes anteriores si existen
    const existingGradients = document.querySelector('.gradient-cards');
    if (existingGradients) {
      existingGradients.remove();
    }

    const harmonyType = document.getElementById('harmonyType').value;
    const harmonyColors = document.getElementById('harmonyColors');

    // Crear contenedor para gradientes
    const gradientContainer = document.createElement('div');
    gradientContainer.className = 'gradient-cards';

    // Definir los pares según el tipo de armonía
    let colorPairs = [];
    switch (harmonyType) {
      case 'complementary':
        colorPairs = [[colors[0], colors[1]]];
        break;
      case 'triadic':
        colorPairs = [
          [colors[0], colors[1]],
          [colors[1], colors[2]],
          [colors[2], colors[0]],
        ];
        break;
      case 'square':
        colorPairs = [
          [colors[0], colors[1]],
          [colors[1], colors[2]],
          [colors[2], colors[3]],
          [colors[3], colors[0]],
        ];
        break;
      case 'analogous':
        colorPairs = [
          [colors[0], colors[1]],
          [colors[1], colors[2]],
          [colors[2], colors[0]],
        ];
        break;
    }

    // Crear tarjetas de gradiente
    colorPairs.forEach((pair) => {
      const card = document.createElement('div');
      card.className = 'color-card';

      const preview = document.createElement('div');
      preview.className = 'color-preview';
      preview.style.backgroundImage = `linear-gradient(45deg, ${pair[0]} 0%, ${pair[1]} 100%)`;

      const info = document.createElement('div');
      info.className = 'color-info';
      info.innerHTML = `
                    <div class="color-name">Gradient</div>
                    <div class="color-hex">${pair[0]} → ${pair[1]}</div>
                `;

      card.appendChild(preview);
      card.appendChild(info);
      gradientContainer.appendChild(card);
    });

    // Añadir después de las tarjetas de colores sólidos
    harmonyColors.appendChild(gradientContainer);
  }

  function updateColorIndicators(colors) {
    const colorWheelContainer = document.getElementById('colorWheelContainer');
    if (!colorWheelContainer) return;

    // Limpiar indicadores existentes
    colorWheelContainer
      .querySelectorAll('.colorIndicator')
      .forEach((indicator) => indicator.remove());

    // Obtener dimensiones del color wheel
    const wheelSize = colorWheel.props.width;
    const wheelRadius = wheelSize / 2;
    const centerX = wheelRadius;
    const centerY = wheelRadius;

    // Crear indicadores solo para los colores armónicos (excluyendo el color base)
    colors.forEach((color, index) => {
      if (index === 0) return; // Saltar el color base
      
      const hue = chroma(color).get('hsl.h') || 0; // Asegurar que hue sea un número
      const angleRadians = ((hue + 360) % 360) * (Math.PI / 180); // Normalizar el ángulo
      
      // Calcular posición en el círculo
      const indicatorX = centerX + (wheelRadius - 15) * Math.cos(angleRadians);
      const indicatorY = centerY - (wheelRadius - 15) * Math.sin(angleRadians);

      const indicator = document.createElement('div');
      indicator.classList.add('colorIndicator');
      indicator.style.position = 'absolute';
      indicator.style.left = `${indicatorX}px`;
      indicator.style.top = `${indicatorY}px`;
      indicator.style.backgroundColor = color;
      indicator.style.transform = 'translate(-50%, -50%)';

      colorWheelContainer.appendChild(indicator);
    });
  }

  // Event listeners
  colorWheel.on(['color:init', 'color:change'], function (color) {
    const harmonyType = document.getElementById('harmonyType').value;
    const colors = getHarmonyColors(color.hexString, harmonyType);
    if (colors) {
      displayColors(colors);
      displayGradientCards(colors);
      updateDisplayedPalettes(colors);
      displayColorCards(colors);
      updateCSSVariables(color.hexString, colors);
      updateColorIndicators(colors);
    }
    hexInput.value = color.hexString;
  });

  document.getElementById('harmonyType').addEventListener('change', function () {
    const currentColor = colorWheel.color.hexString;
    const colors = getHarmonyColors(currentColor, this.value);
    if (colors) {
      displayColors(colors);
      displayGradientCards(colors);
      updateDisplayedPalettes(colors);
      displayColorCards(colors);
      updateCSSVariables(currentColor, colors);
      updateColorIndicators(colors);
    }
  });

  hexInput.addEventListener('input', function (e) {
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
  hexInput.addEventListener('paste', function (e) {
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

    baseColors.forEach((color) => {
      let colorName = ntc.name(color)[1];
      colorName = colorName
        .replace(/-color.*$/i, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');

      const palette = {};
      const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

      shades.forEach((shade, i) => {
        const lightness = 1 - i * 0.1;
        const paletteColor = chroma(color)
          .set('hsl.l', i === 0 ? 0.95 : lightness)
          .hex();
        palette[shade] = paletteColor.toLowerCase();
      });

      palettes[colorName] = palette;
    });

    return palettes;
  }

  function exportPalettesAsJSON() {
    if (!currentPalettes || Object.keys(currentPalettes).length === 0) {
      alert('No palettes to export.');
      return;
    }

    const jsonBlob = new Blob([JSON.stringify(currentPalettes, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(jsonBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'color_palettes.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function createSVGPaletteFromCurrent() {
    if (!currentPalettes || Object.keys(currentPalettes).length === 0) {
      alert('No palettes to export.');
      return null;
    }

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    const totalHeight = Object.keys(currentPalettes).length * 120 + 20; // Calculate height based on number of palettes
    svg.setAttribute('width', '810');
    svg.setAttribute('height', `${totalHeight}`);

    Object.keys(currentPalettes).forEach((colorName, index) => {
      const palette = currentPalettes[colorName];

      // Create a group element for each color's palette
      const group = document.createElementNS(svgNS, 'g');
      group.setAttribute('transform', `translate(0, ${index * 120 + 20})`);

      // Add the color name as a text element
      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', '10');
      text.setAttribute('y', '30');
      text.setAttribute('font-size', '20');
      text.setAttribute('font-family', 'Arial');
      text.textContent = colorName
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
      group.appendChild(text);

      // Create rectangles for the color shades
      Object.keys(palette).forEach((shade, i) => {
        const rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('x', `${80 * i + 10}`);
        rect.setAttribute('y', '40');
        rect.setAttribute('width', '70');
        rect.setAttribute('height', '70');
        rect.setAttribute('fill', palette[shade]);
        group.appendChild(rect);

        // Add the shade number as a text element on each rectangle
        const shadeText = document.createElementNS(svgNS, 'text');
        shadeText.setAttribute('x', `${80 * i + 45}`);
        shadeText.setAttribute('y', '90');
        shadeText.setAttribute('font-size', '14');
        shadeText.setAttribute('font-family', 'Arial');
        shadeText.setAttribute('text-anchor', 'middle');
        shadeText.setAttribute('fill', chroma(palette[shade]).luminance() > 0.5 ? '#333' : '#fff');
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

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'color_palettes.svg';
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

  // Verificar si colorWheel está definido
  if (!colorWheel) {
    console.warn('ColorWheel no está inicializado');
    return;
  }

  const selectedColor = colorWheel.color.hexString;
  const color = chroma(selectedColor);

  // Generar escala de colores desde más claro a más oscuro
  const scale = chroma
    .scale([
      color.luminance(0.95), // 50
      color.luminance(0.9), // 100
      color.luminance(0.8), // 200
      color.luminance(0.7), // 300
      color.luminance(0.6), // 400
      color.luminance(0.5), // 500
      selectedColor, // 600 (color seleccionado)
      color.luminance(0.3), // 700
      color.luminance(0.2), // 800
      color.luminance(0.1), // 900
    ])
    .colors(10);

  // Establecer variables del color primario
  root.style.setProperty('--color-primary-50', scale[0]);
  root.style.setProperty('--color-primary-100', scale[1]);
  root.style.setProperty('--color-primary-200', scale[2]);
  root.style.setProperty('--color-primary-300', scale[3]);
  root.style.setProperty('--color-primary-400', scale[4]);
  root.style.setProperty('--color-primary-500', scale[5]);
  root.style.setProperty('--color-primary-600', selectedColor);
  root.style.setProperty('--color-primary-700', scale[7]);
  root.style.setProperty('--color-primary-800', scale[8]);
  root.style.setProperty('--color-primary-900', scale[9]);

  // Asignar las variables CSS dinámicamente para los otros colores
  Object.keys(colorPalette).forEach((colorKey, index) => {
    if (index >= 4) return;

    const palette = colorPalette[colorKey];
    const colorName = `color-${index + 1}`;

    root.style.setProperty(`--background-${colorName}-50`, palette['50']);
    root.style.setProperty(`--background-${colorName}-100`, palette['100']);
    root.style.setProperty(`--color-${colorName}`, palette['800']);
    root.style.setProperty(`--button-${colorName}`, index === 0 ? selectedColor : palette['600']);
  });

  // Asignar las variables CSS estáticas
  root.style.setProperty('--background-primary', 'var(--background-color-1-50)');
  root.style.setProperty('--color-primary', 'var(--color-color-1)');
  root.style.setProperty('--button-primary', selectedColor);
}

// Dropdown functionality
document.querySelectorAll('.ui-dropdown-toggle').forEach((toggle) => {
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = toggle.nextElementSibling;
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  });
});

// Close dropdowns when clicking outside
document.addEventListener('click', () => {
  document.querySelectorAll('.ui-dropdown-menu').forEach((menu) => {
    menu.style.display = 'none';
  });
});

// Cascade Dropdown
document.querySelectorAll('.ui-cascade-button').forEach((button) => {
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = button.nextElementSibling;
    const isOpen = menu.style.display === 'block';

    // Cerrar todos los menús primero
    document.querySelectorAll('.ui-cascade-menu, .ui-cascade-submenu').forEach((m) => {
      m.style.display = 'none';
    });

    // Abrir/cerrar el menú actual
    menu.style.display = isOpen ? 'none' : 'block';
  });
});

document.querySelectorAll('.ui-cascade-item').forEach((item) => {
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
  document.querySelectorAll('.ui-cascade-menu, .ui-cascade-submenu').forEach((menu) => {
    menu.style.display = 'none';
  });
});

// Custom Select
document.querySelectorAll('.ui-select').forEach((select) => {
  select.addEventListener('click', (e) => {
    const options = select.nextElementSibling;
    options.style.display = options.style.display === 'block' ? 'none' : 'block';
  });
});

function generateShades(baseColor) {
  const color = chroma(baseColor);
  const shades = {};

  // El 600 es el color base seleccionado
  shades[600] = baseColor;

  // Generar tonos desde 700 hasta 900 (más oscuros)
  for (let i = 7; i <= 9; i++) {
    const shade = i * 100;
    shades[shade] = color.darken((i - 6) * 0.3).hex();
  }

  // Generar todos los tonos más claros desde 500 hasta 50 con una degradación constante
  const steps = [500, 400, 300, 200, 100, 50];
  const baseHue = color.get('hsl.h');
  const baseSaturation = color.get('hsl.s');
  const baseLightness = color.get('hsl.l');

  steps.forEach((step, index) => {
    // Calcular el incremento gradual de luminosidad
    const luminosityIncrease = (index + 1) * 0.08;
    // Reducir gradualmente la saturación
    const saturationDecrease = 1 - index * 0.1;

    shades[step] = chroma
      .hsl(
        baseHue,
        Math.max(0, baseSaturation * saturationDecrease),
        Math.min(0.98, baseLightness + luminosityIncrease)
      )
      .hex();
  });

  return shades;
}

// Establecer Square como valor por defecto en el select
document.addEventListener('DOMContentLoaded', function () {
  const harmonySelect = document.getElementById('harmonyType');
  harmonySelect.value = 'square';
  // Disparar el evento de cambio para actualizar los colores
  updateHarmonyColors('#5036C2');
});

function updateCSSVariables(selectedColor, colors) {
  const root = document.documentElement;

  // Generar escala para color primario
  const primaryScale = chroma
    .scale([
      chroma(selectedColor).luminance(0.95),
      chroma(selectedColor).luminance(0.9),
      chroma(selectedColor).luminance(0.8),
      chroma(selectedColor).luminance(0.7),
      chroma(selectedColor).luminance(0.6),
      chroma(selectedColor).luminance(0.5),
      selectedColor,
      chroma(selectedColor).darken(0.5),
      chroma(selectedColor).darken(1),
      chroma(selectedColor).darken(1.5),
    ])
    .colors(10);

  // Establecer variables del color primario
  root.style.setProperty('--color-primary-50', primaryScale[0]);
  root.style.setProperty('--color-primary-100', primaryScale[1]);
  root.style.setProperty('--color-primary-200', primaryScale[2]);
  root.style.setProperty('--color-primary-300', primaryScale[3]);
  root.style.setProperty('--color-primary-400', primaryScale[4]);
  root.style.setProperty('--color-primary-500', primaryScale[5]);
  root.style.setProperty('--color-primary-600', selectedColor);
  root.style.setProperty('--color-primary-700', primaryScale[7]);
  root.style.setProperty('--color-primary-800', primaryScale[8]);
  root.style.setProperty('--color-primary-900', primaryScale[9]);

  // Generar y establecer variables para los colores secundarios
  colors.forEach((color, index) => {
    if (index === 0) return; // Saltar el color primario que ya fue procesado

    const scale = chroma
      .scale([
        chroma(color).luminance(0.95),
        chroma(color).luminance(0.9),
        chroma(color).luminance(0.8),
        chroma(color).luminance(0.7),
        chroma(color).luminance(0.6),
        chroma(color).luminance(0.5),
        color,
        chroma(color).darken(0.5),
        chroma(color).darken(1),
        chroma(color).darken(1.5),
      ])
      .colors(10);

    // Establecer variables para colores secundarios
    root.style.setProperty(`--generated-secondary-50`, scale[0]);
    root.style.setProperty(`--generated-secondary-100`, scale[1]);
    root.style.setProperty(`--generated-secondary-200`, scale[2]);
    root.style.setProperty(`--generated-secondary-300`, scale[3]);
    root.style.setProperty(`--generated-secondary-400`, scale[4]);
    root.style.setProperty(`--generated-secondary-500`, scale[5]);
    root.style.setProperty(`--generated-secondary-600`, color);
    root.style.setProperty(`--generated-secondary-700`, scale[7]);
    root.style.setProperty(`--generated-secondary-800`, scale[8]);
    root.style.setProperty(`--generated-secondary-900`, scale[9]);

    // También establecer las variables de color secundario directamente
    root.style.setProperty(`--color-secondary-50`, scale[0]);
    root.style.setProperty(`--color-secondary-100`, scale[1]);
    root.style.setProperty(`--color-secondary-200`, scale[2]);
    root.style.setProperty(`--color-secondary-300`, scale[3]);
    root.style.setProperty(`--color-secondary-400`, scale[4]);
    root.style.setProperty(`--color-secondary-500`, scale[5]);
    root.style.setProperty(`--color-secondary-600`, color);
    root.style.setProperty(`--color-secondary-700`, scale[7]);
    root.style.setProperty(`--color-secondary-800`, scale[8]);
    root.style.setProperty(`--color-secondary-900`, scale[9]);
  });

  // Después de establecer todas las variables CSS, actualizar el contraste
  updateButtonsContrast();
}

// Función para cambiar la tipografía
function initTypographyCards() {
  const typographyCards = document.querySelectorAll('.typography-card');

  typographyCards.forEach((card) => {
    card.addEventListener('click', () => {
      typographyCards.forEach((c) => c.classList.remove('active'));
      card.classList.add('active');

      const fontFamily = card.getAttribute('data-font');
      document.body.style.fontFamily = fontFamily;

      const fontName = card.querySelector('.typography-name').textContent;
      showCustomAlert(`Typography changed to ${fontName}`, 'typography');
    });
  });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  initTypographyCards();
  initSidebar();
  updateHarmonyColors(); // Si es necesario
  // ... resto de inicializaciones
  updateButtonsContrast();
});

// Animación de los círculos de progreso
document.addEventListener('DOMContentLoaded', () => {
  const circles = document.querySelectorAll('.circle');
  circles.forEach((circle) => {
    const value = circle.getAttribute('stroke-dasharray').split(',')[0];
    circle.style.strokeDasharray = `0, 100`;
    setTimeout(() => {
      circle.style.strokeDasharray = `${value}, 100`;
    }, 100);
  });
});

document.addEventListener('DOMContentLoaded', function () {
  // Elementos DOM
  const recTimeEl = document.querySelector('.rec-time');
  const fpsCounter = document.querySelector('.fps-counter');
  const batteryValue = document.querySelector('.battery .value');
  const altitudeValue = document.querySelector('.altitude .value');
  const speedValue = document.querySelector('.flight-data .data-item:nth-child(1) .value');
  const distanceValue = document.querySelector('.flight-data .data-item:nth-child(2) .value');
  const flightTimeValue = document.querySelector('.flight-data .data-item:nth-child(3) .value');

  // Variables de control
  let seconds = 0;
  let distance = 0;
  let battery = 100;
  let altitude = 270;
  let speed = 20;

  // Función para números aleatorios con rango
  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Actualizar tiempo de grabación
  setInterval(() => {
    seconds++;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    recTimeEl.textContent = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, 1000);

  // Fluctuar FPS
  setInterval(() => {
    const fps = randomInRange(19.2, 20.1).toFixed(2);
    fpsCounter.textContent = `${fps} FPS`;
  }, 500);

  // Actualizar batería
  setInterval(() => {
    if (battery > 5) {
      battery -= 0.1;
      batteryValue.textContent = `${Math.round(battery)}%`;

      // Cambiar icono de batería según nivel
      const batteryIcon = document.querySelector('.battery .material-symbols-outlined');
      if (battery < 20) {
        batteryValue.style.color = '#ff4444';
        batteryIcon.textContent = 'battery_1_bar';
      }
    }
  }, 5000);

  // Simular vuelo
  setInterval(() => {
    // Altitud
    altitude += randomInRange(-5, 5);
    altitude = Math.max(0, Math.min(500, altitude));
    altitudeValue.textContent = `${Math.round(altitude)} m`;

    // Velocidad
    speed += randomInRange(-2, 2);
    speed = Math.max(0, Math.min(40, speed));
    speedValue.textContent = `${Math.round(speed)} km/h`;

    // Distancia
    distance += speed / 3600; // Convertir km/h a km por segundo
    distanceValue.textContent = `${distance.toFixed(1)} km`;
  }, 1000);

  // Actualizar tiempo de vuelo
  let flightSeconds = 0;
  setInterval(() => {
    flightSeconds++;
    const fMinutes = Math.floor(flightSeconds / 60);
    const fSecs = flightSeconds % 60;
    flightTimeValue.textContent = `${String(fMinutes).padStart(2, '0')}:${String(fSecs).padStart(2, '0')}`;
  }, 1000);
});

// Añadir al JavaScript existente:
document.querySelectorAll('.tab-btn').forEach((button) => {
  button.addEventListener('click', () => {
    // Remover active de todos los botones y contenidos
    document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));
    document
      .querySelectorAll('.tab-content')
      .forEach((content) => content.classList.remove('active'));

    // Activar el botón clickeado y su contenido
    button.classList.add('active');
    document.getElementById(button.dataset.tab).classList.add('active');
  });
});

// Dentro del addEventListener('DOMContentLoaded') existente
document.addEventListener('DOMContentLoaded', () => {
  // Añadir estos nuevos event listeners (sintaxis corregida)
  document.querySelectorAll('.radius-card').forEach((card) => {
    card.addEventListener('click', () => {
      updateButtonRadius(card.dataset.radius, true);
    });
  });

  // Aplicar el radio inicial sin mostrar toast
  updateButtonRadius(currentButtonRadius, false);
});

console.log('Script loaded!');

// Añadir esta función que falta
function updateDisplayedPalettes(baseColors) {
  const colorPalette = generatePaletteJSON(baseColors);
  applyDynamicStyles(colorPalette);
}

// Añadir la función generatePaletteJSON que es necesaria
function generatePaletteJSON(baseColors) {
  const palettes = {};

  baseColors.forEach((color) => {
    let colorName = ntc.name(color)[1];
    colorName = colorName
      .replace(/-color.*$/i, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');

    const palette = {};
    const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

    shades.forEach((shade, i) => {
      const lightness = 1 - i * 0.1;
      const paletteColor = chroma(color)
        .set('hsl.l', i === 0 ? 0.95 : lightness)
        .hex();
      palette[shade] = paletteColor.toLowerCase();
    });

    palettes[colorName] = palette;
  });

  return palettes;
}

// Mover la función updateHarmonyColors fuera del DOMContentLoaded
function updateHarmonyColors(baseColor) {
  const harmonyType = document.getElementById('harmonyType')?.value || 'square';
  const colors = getHarmonyColors(baseColor, harmonyType);
  displayColors(colors);
  updateColorIndicators(colors);
  updateDisplayedPalettes(colors);
  displayColorCards(colors);
  displayGradientCards(colors);
  updateCSSVariables(baseColor, colors);
}

// Mover la función getHarmonyColors fuera del DOMContentLoaded
function getHarmonyColors(color, type) {
  if (!color || !chroma.valid(color)) {
    console.warn('Invalid color provided to getHarmonyColors');
    return null;
  }

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
    default:
      hues = [baseHue, (baseHue + 90) % 360, (baseHue + 180) % 360, (baseHue + 270) % 360];
  }

  return hues.map((hue) => chroma.hsl(hue, baseSaturation, baseLightness).hex());
}

// Mover la función displayColors fuera del DOMContentLoaded
function displayColors(colors) {
  const harmonyColors = document.getElementById('harmonyColors');
  if (!harmonyColors || !colors) return;

  harmonyColors.innerHTML = '';

  colors.forEach((color) => {
    if (!color) return;
    const colorName = ntc
      .name(color)[1]
      .replace(/-color.*$/i, '')
      .trim();
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

// Mover la función displayColorCards fuera del DOMContentLoaded
function displayColorCards(colors) {
  const colorCardsContainer = document.getElementById('colorCards');
  if (!colorCardsContainer) return;

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

function generateColorPalettes(colors) {
  const colorCardsContainer = document.getElementById('colorCards');
  if (!colorCardsContainer) return;

  // Crear contenedor para las paletas
  const paletteContainer = document.createElement('div');
  paletteContainer.id = 'paletteContainer';
  paletteContainer.style.display = 'flex';
  paletteContainer.style.flexDirection = 'column';
  paletteContainer.style.gap = '32px';
  paletteContainer.style.padding = '24px';

  colors.forEach((baseColor, index) => {
    const shades = generateShades(baseColor);
    const colorName = ntc
      .name(baseColor)[1]
      .replace(/-color.*$/i, '')
      .trim();

    // Contenedor de la paleta
    const paletteSection = document.createElement('div');
    paletteSection.style.display = 'flex';
    paletteSection.style.flexDirection = 'column';
    paletteSection.style.gap = '16px';

    // Título de la paleta
    const paletteTitle = document.createElement('h3');
    paletteTitle.textContent = colorName;
    paletteTitle.style.fontSize = '18px';
    paletteTitle.style.fontWeight = '600';
    paletteTitle.style.margin = '0';

    // Contenedor de las tarjetas de color
    const cardsContainer = document.createElement('div');
    cardsContainer.style.display = 'flex';
    cardsContainer.style.gap = '8px';
    cardsContainer.style.flexWrap = 'wrap';

    // Crear tarjetas para cada tono
    Object.entries(shades).forEach(([shade, color]) => {
      const card = createTokenCard(shade, color, baseColor);
      cardsContainer.appendChild(card);
    });

    paletteSection.appendChild(paletteTitle);
    paletteSection.appendChild(cardsContainer);
    paletteContainer.appendChild(paletteSection);
  });

  colorCardsContainer.appendChild(paletteContainer);
}

function createTokenCard(shade, color, baseColor) {
  const card = document.createElement('div');
  const isDark = chroma(color).luminance() < 0.5;

  // Estilos base de la tarjeta
  Object.assign(card.style, {
    width: '110px',
    height: '110px',
    borderRadius: '12px',
    backgroundColor: color,
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: isDark ? '#ffffff' : '#000000',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: shade === '600' ? `2px solid ${isDark ? '#ffffff' : '#000000'}` : 'none',
  });

  // Contenido superior
  const topContent = document.createElement('div');

  // Número de shade
  const shadeNumber = document.createElement('span');
  shadeNumber.textContent = shade;
  shadeNumber.style.fontSize = '24px';
  shadeNumber.style.fontWeight = '700';

  topContent.appendChild(shadeNumber);

  // Contenido inferior
  const bottomContent = document.createElement('div');
  bottomContent.style.display = 'flex';
  bottomContent.style.flexDirection = 'column';
  bottomContent.style.gap = '4px';

  // Hex value
  const hexValue = document.createElement('span');
  hexValue.textContent = color.toUpperCase();
  hexValue.style.fontSize = '12px';
  hexValue.style.opacity = '0.8';

  // Botón de copiar
  const copyButton = document.createElement('button');
  Object.assign(copyButton.style, {
    padding: '6px 12px',
    fontSize: '12px',
    borderRadius: '6px',
    border: 'none',
    background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
    color: 'inherit',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    width: '100%',
    transition: 'all 0.2s ease',
  });

  const copyIcon = document.createElement('span');
  copyIcon.className = 'material-symbols-outlined';
  copyIcon.textContent = 'content_copy';
  copyIcon.style.fontSize = '14px';

  copyButton.appendChild(copyIcon);
  copyButton.appendChild(document.createTextNode('Copy'));

  // Eventos
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-2px)';
    card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  });

  copyButton.addEventListener('mouseenter', () => {
    copyButton.style.background = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';
  });

  copyButton.addEventListener('mouseleave', () => {
    copyButton.style.background = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
  });

  copyButton.addEventListener('click', (e) => {
    e.stopPropagation();
    copyToClipboard(color);
  });

  bottomContent.appendChild(hexValue);
  bottomContent.appendChild(copyButton);

  card.appendChild(topContent);
  card.appendChild(bottomContent);

  return card;
}

// Mejorar el manejo de errores en la copia
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showCustomAlert(`Color ${text.toUpperCase()} copied!`, 'color');
  } catch (err) {
    console.error('Error copying to clipboard:', err);
    showCustomAlert('Error copying color code', 'color');
  }
}

// Modificar el HTML inicial para que solo tenga la estructura básica
document.addEventListener('DOMContentLoaded', () => {
  const customAlert = document.getElementById('custom-alert');
  if (customAlert) {
    customAlert.style.display = 'none';
    customAlert.innerHTML = '<span id="alert-message"></span>';
  }
});

// Función para convertir una card a SVG usando Paper.js
async function cardToSVG(card) {
  try {
    // Obtener dimensiones y estilos computados
    const rect = card.getBoundingClientRect();
    const styles = window.getComputedStyle(card);

    // Crear un canvas temporal para Paper.js
    const canvas = document.createElement('canvas');
    canvas.width = rect.width;
    canvas.height = rect.height;
    paper.setup(canvas);

    // Crear el grupo principal
    const mainGroup = new paper.Group();

    // Función recursiva para procesar elementos
    async function processElement(element, parentGroup) {
      const elementRect = element.getBoundingClientRect();
      const elementStyles = window.getComputedStyle(element);
      const relativeRect = {
        left: elementRect.left - rect.left,
        top: elementRect.top - rect.top,
        width: elementRect.width,
        height: elementRect.height,
      };

      // Crear grupo para este elemento
      const elementGroup = new paper.Group({
        parent: parentGroup,
      });

      // Procesar el fondo si existe
      if (elementStyles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const background = new paper.Path.Rectangle({
          point: [relativeRect.left, relativeRect.top],
          size: [relativeRect.width, relativeRect.height],
          radius: parseInt(elementStyles.borderRadius) || 0,
          fillColor: elementStyles.backgroundColor,
          parent: elementGroup,
        });

        // Aplicar sombras si existen
        if (elementStyles.boxShadow !== 'none') {
          const shadowMatch = elementStyles.boxShadow.match(/rgba?\([^)]+\)|[0-9.]+px/g);
          if (shadowMatch) {
            background.style.shadowColor = shadowMatch[0];
            background.style.shadowBlur = parseInt(shadowMatch[1]);
            background.style.shadowOffset = new paper.Point(
              parseInt(shadowMatch[2]),
              parseInt(shadowMatch[3])
            );
          }
        }
      }

      // Procesar bordes si existen
      if (elementStyles.border !== 'none') {
        new paper.Path.Rectangle({
          point: [relativeRect.left, relativeRect.top],
          size: [relativeRect.width, relativeRect.height],
          radius: parseInt(elementStyles.borderRadius) || 0,
          strokeColor: elementStyles.borderColor,
          strokeWidth: parseInt(elementStyles.borderWidth),
          parent: elementGroup,
        });
      }

      // Procesar imágenes
      if (element.tagName === 'IMG') {
        const raster = await new Promise((resolve) => {
          const tempImage = new Image();
          tempImage.crossOrigin = 'Anonymous';
          tempImage.onload = () => {
            const raster = new paper.Raster(tempImage);
            raster.position = new paper.Point(
              relativeRect.left + relativeRect.width / 2,
              relativeRect.top + relativeRect.height / 2
            );
            raster.size = new paper.Size(relativeRect.width, relativeRect.height);

            // Aplicar máscara si tiene borde redondeado
            if (parseInt(elementStyles.borderRadius) > 0) {
              const mask = new paper.Path.Rectangle({
                point: [relativeRect.left, relativeRect.top],
                size: [relativeRect.width, relativeRect.height],
                radius: parseInt(elementStyles.borderRadius),
                fillColor: 'black',
              });
              const imageGroup = new paper.Group([raster, mask]);
              imageGroup.clipped = true;
              imageGroup.parent = elementGroup;
            } else {
              raster.parent = elementGroup;
            }
            resolve(raster);
          };
          tempImage.src = element.src;
        });
      }

      // Procesar iconos de Material Symbols
      if (element.classList.contains('material-symbols-outlined')) {
        const iconPath = await convertIconToPath(element.textContent, {
          fontSize: parseInt(elementStyles.fontSize),
          color: elementStyles.color,
          x: relativeRect.left + relativeRect.width / 2,
          y: relativeRect.top + relativeRect.height / 2,
        });
        if (iconPath) {
          iconPath.parent = elementGroup;
        }
      }
      // Procesar texto normal
      else if (element.textContent.trim() && !element.children.length) {
        new paper.PointText({
          point: [relativeRect.left, relativeRect.top + parseInt(elementStyles.fontSize)],
          content: element.textContent,
          fontSize: parseInt(elementStyles.fontSize),
          fontFamily: elementStyles.fontFamily,
          fontWeight: elementStyles.fontWeight,
          fillColor: elementStyles.color,
          opacity: elementStyles.opacity,
          parent: elementGroup,
        });
      }

      // Procesar elementos hijos
      for (const child of element.children) {
        await processElement(child, elementGroup);
      }
    }

    // Función para convertir icono a path
    async function convertIconToPath(iconName, options) {
      const iconSvgPath = await getIconSvgPath(iconName);
      if (!iconSvgPath) return null;

      const path = new paper.Path(iconSvgPath);
      path.fillColor = options.color;
      path.scale(options.fontSize / 24); // 24 es el tamaño base de los iconos
      path.position = new paper.Point(options.x, options.y);
      return path;
    }

    // Función para obtener el path SVG del icono
    async function getIconSvgPath(iconName) {
      // Mapa de paths de iconos comunes
      const iconPaths = {
        arrow_forward: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z',
        more_horiz:
          'M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
        palette:
          'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
        brush:
          'M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.22 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z',
        // Añade más paths según necesites
      };

      return iconPaths[iconName] || null;
    }

    // Procesar la card completa
    await processElement(card, mainGroup);

    // Exportar a SVG
    const svg = paper.project.exportSVG({
      asString: true,
      precision: 2,
      matchShapes: true,
      embedImages: true,
    });

    // Limpiar
    paper.project.clear();

    return svg;
  } catch (error) {
    console.error('Error converting card to SVG:', error);
    throw error;
  }
}

// Actualizar la función copySvgCard para usar la nueva conversión
async function copySvgCard(card) {
  try {
    const svgString = await cardToSVG(card);
    await navigator.clipboard.writeText(svgString);
    showCustomAlert('Card copied as PNG', 'code');
    console.log('SVG copiado:', svgString);
  } catch (error) {
    console.error('Error copying PNG:', error);
    showCustomAlert('Error copying PNG', 'error');
  }
}

// El event listener existente se mantiene igual
document.addEventListener('click', (event) => {
  const card = event.target.closest('.base-card');
  if (card && event.altKey) {
    event.preventDefault();
    copySvgCard(card);
  }
});

// Función para crear y mostrar el tooltip personalizado
function createCustomTooltip(card) {
  // Crear el tooltip solo una vez y reutilizarlo
  let tooltip = document.querySelector('.custom-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined" style="font-size: 16px;">
                    info
                </span>
                <span>Alt + Click to copy as PNG</span>
            </div>
        `;

    // Estilos mejorados del tooltip
    Object.assign(tooltip.style, {
      position: 'fixed', // Cambiado a fixed para mejor posicionamiento
      padding: '8px 16px',
      background: '#FFFFFF',
      color: '#000000',
      borderRadius: '8px',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: '9999',
      pointerEvents: 'none',
      opacity: '0',
      visibility: 'hidden',
      transition: 'opacity 0.1s ease-in-out, visibility 0.1s ease-in-out',
      whiteSpace: 'nowrap',
      transform: 'translateY(0)',
    });

    document.body.appendChild(tooltip);
  }

  let hideTimeout;

  function showTooltip(event) {
    clearTimeout(hideTimeout);
    const rect = card.getBoundingClientRect();

    // Posicionar el tooltip
    tooltip.style.visibility = 'visible';
    tooltip.style.opacity = '1';

    // Calcular posición centrada sobre la card
    const tooltipRect = tooltip.getBoundingClientRect();
    const left = rect.left + (rect.width - tooltipRect.width) / 2;
    const top = rect.top - tooltipRect.height - 8;

    tooltip.style.left = `${Math.max(8, left)}px`;
    tooltip.style.top = `${Math.max(8, top)}px`;
  }

  function hideTooltip() {
    hideTimeout = setTimeout(() => {
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
    }, 100);
  }

  // Añadir event listeners
  card.addEventListener('mouseenter', showTooltip);
  card.addEventListener('mouseleave', hideTooltip);
}

// Modificar el event listener del DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.base-card');
  cards.forEach((card) => createCustomTooltip(card));
});

function updateButtonsContrast() {
  const root = document.documentElement;
  
  function getTextColor(bgColor) {
    if (!bgColor || bgColor === 'transparent' || bgColor === 'rgba(0, 0, 0, 0)') {
      return 'var(--color-primary-900)';
    }
    const luminance = chroma(bgColor).luminance();
    return luminance > 0.5 ? 'var(--color-primary-900)' : '#FFFFFF';
  }

  // Obtener colores de las variables CSS
  const colors = {
    50: getComputedStyle(root).getPropertyValue('--color-primary-50').trim(),
    100: getComputedStyle(root).getPropertyValue('--color-primary-100').trim(),
    200: getComputedStyle(root).getPropertyValue('--color-primary-200').trim(),
    600: getComputedStyle(root).getPropertyValue('--color-primary-600').trim()
  };

  // Aplicar contraste a elementos con fondo primary-600
  document.querySelectorAll('button.primary, .ui-button.primary, .cta-button, #exportSvgButton, #exportJsonButton, .tag.primary').forEach(element => {
    element.style.color = getTextColor(colors[600]);
  });

  // Aplicar contraste a elementos con fondo primary-200
  document.querySelectorAll('button.secondary, .ui-button.secondary, .copyButton, .tag.secondary').forEach(element => {
    element.style.color = getTextColor(colors[200]);
  });

  // Aplicar contraste a icon buttons
  document.querySelectorAll('.icon-button').forEach(element => {
    element.style.color = 'var(--color-primary-600)';
    
    // Añadir event listeners para hover
    element.addEventListener('mouseenter', () => {
      element.style.color = 'var(--color-primary-100)';
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.color = 'var(--color-primary-600)';
    });
  });

  // Aplicar contraste a tags light
  document.querySelectorAll('.tag.light').forEach(element => {
    element.style.color = getTextColor(colors[50]);
  });

  // Aplicar contraste a color cards
  document.querySelectorAll('.color-preview').forEach(preview => {
    const bgColor = window.getComputedStyle(preview).backgroundColor;
    if (bgColor) {
      const textColor = getTextColor(bgColor);
      preview.style.color = textColor;
      preview.querySelectorAll('*').forEach(child => {
        child.style.color = textColor;
      });
    }
  });
}
