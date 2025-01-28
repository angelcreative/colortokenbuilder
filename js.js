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

  // Actualizar el drawer si está abierto
  const drawer = document.getElementById('designTokensDrawer');
  if (drawer && drawer.classList.contains('open')) {
    updateTokenViewer();
  }

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

    colors.forEach((color, index) => {
      if (!color) return;
      const colorName = ntc
        .name(color)[1]
        .replace(/-color.*$/i, '')
        .trim();
      const rgbColor = chroma(color).rgb();

      const cardHTML = `
                    <div class="color-card">
          <div class="color-preview" style="background-color: ${color}; height: 160px; border-radius: 12px;"></div>
          <div class="color-info" style="padding: 16px;">
            <h3 class="color-name" style="font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">${colorName}</h3>
            <div class="color-rgb" style="font-size: 14px; opacity: 0.8; margin-bottom: 4px;">RGB ${rgbColor.join(' ')}</div>
            <div class="color-hex" style="font-size: 14px; opacity: 0.8; margin-bottom: 4px;">${color.toUpperCase()}</div>
            <div class="color-value" style="font-size: 14px; opacity: 0.8;">600</div>
                        </div>
                    </div>
                `;
      harmonyColors.innerHTML += cardHTML;
    });

    // Actualizar los swatches en el drawer
    updateTokenViewer();
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

// Mover la función displayColorCards fuera del DOMContentLoaded
function displayColorCards(colors) {
  const colorCardsContainer = document.getElementById('colorCards');
  if (!colorCardsContainer) return;

  // Limpiar solo el contenedor de paletas si existe
  const existingPaletteContainer = document.getElementById('paletteContainer');
  if (existingPaletteContainer) {
    existingPaletteContainer.remove();
  }

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

  // Actualizar los swatches en el drawer
  updateTokenViewer();

  // Actualizar las paletas mostradas
  currentPalettes = generatePaletteJSON(colors);
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
  topContent.style.display = 'flex';
  topContent.style.flexDirection = 'column';
  topContent.style.gap = '4px';

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

  // RGB value
  const rgbValue = document.createElement('span');
  const rgb = chroma(color).rgb();
  rgbValue.textContent = `RGB ${rgb.join(' ')}`;
  rgbValue.style.fontSize = '10px';
  rgbValue.style.opacity = '0.6';

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

  bottomContent.appendChild(hexValue);
  bottomContent.appendChild(rgbValue);
  bottomContent.appendChild(copyButton);

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

// Función para copiar la card como PNG
async function copyCardAsPNG(card) {
  try {
    const canvas = await html2canvas(card, {
      backgroundColor: null,
      scale: 2, // Mayor calidad
      logging: false,
      useCORS: true,
    });

    canvas.toBlob(async (blob) => {
      try {
        const data = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([data]);
        showCustomAlert('Card copied as PNG', 'code');
      } catch (error) {
        console.error('Error copying PNG to clipboard:', error);
        showCustomAlert('Error copying PNG', 'error');
      }
    }, 'image/png');
  } catch (error) {
    console.error('Error generating PNG:', error);
    showCustomAlert('Error generating PNG', 'error');
  }
}

// Event listener para Alt + Click
document.addEventListener('click', (event) => {
  const card = event.target.closest('.base-card');
  if (card && event.altKey) {
    event.preventDefault();
    copyCardAsPNG(card);
  }
});

// Función para crear y mostrar el tooltip personalizado
function createCustomTooltip(card) {
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

    Object.assign(tooltip.style, {
      position: 'fixed',
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
    tooltip.style.visibility = 'visible';
    tooltip.style.opacity = '1';

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
    600: getComputedStyle(root).getPropertyValue('--color-primary-600').trim(),
  };

  // Aplicar contraste a elementos con fondo primary-600
  document
    .querySelectorAll(
      'button.primary, .ui-button.primary, .cta-button, #exportSvgButton, #exportJsonButton, .tag.primary'
    )
    .forEach((element) => {
      element.style.color = getTextColor(colors[600]);
    });

  // Aplicar contraste a elementos con fondo primary-200
  document
    .querySelectorAll('button.secondary, .ui-button.secondary, .copyButton, .tag.secondary')
    .forEach((element) => {
      element.style.color = getTextColor(colors[200]);
    });

  // Aplicar contraste a icon buttons
  document.querySelectorAll('.icon-button').forEach((element) => {
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
  document.querySelectorAll('.tag.light').forEach((element) => {
    element.style.color = getTextColor(colors[50]);
  });

  // Aplicar contraste a color cards
  document.querySelectorAll('.color-preview').forEach((preview) => {
    const bgColor = window.getComputedStyle(preview).backgroundColor;
    if (bgColor) {
      const textColor = getTextColor(bgColor);
      preview.style.color = textColor;
      preview.querySelectorAll('*').forEach((child) => {
        child.style.color = textColor;
      });
    }
  });
}

// Design Tokens System
function generateDesignTokens() {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  const currentColor = colorWheel.color.hexString;
  const harmonyColors = getHarmonyColors(
    currentColor,
    document.getElementById('harmonyType')?.value || 'square'
  );
  const colorName = ntc.name(currentColor)[1].toLowerCase().replace(/\s+/g, '-');

  return {
    primitive: {
      colors: {
        [`${colorName}-50`]: computedStyle.getPropertyValue('--color-primary-50').trim(),
        [`${colorName}-100`]: computedStyle.getPropertyValue('--color-primary-100').trim(),
        [`${colorName}-200`]: computedStyle.getPropertyValue('--color-primary-200').trim(),
        [`${colorName}-300`]: computedStyle.getPropertyValue('--color-primary-300').trim(),
        [`${colorName}-400`]: computedStyle.getPropertyValue('--color-primary-400').trim(),
        [`${colorName}-500`]: computedStyle.getPropertyValue('--color-primary-500').trim(),
        [`${colorName}-600`]: computedStyle.getPropertyValue('--color-primary-600').trim(),
        [`${colorName}-700`]: computedStyle.getPropertyValue('--color-primary-700').trim(),
        [`${colorName}-800`]: computedStyle.getPropertyValue('--color-primary-800').trim(),
        [`${colorName}-900`]: computedStyle.getPropertyValue('--color-primary-900').trim(),
      },
      typography: {
        'font-family': {
          'font-primary': 'Inter',
          'font-secondary': 'Roboto',
          'font-mono': 'Space Mono',
          'font-display': 'Lexend',
        },
        'font-weight': {
          'weight-regular': '400',
          'weight-medium': '500',
          'weight-semibold': '600',
          'weight-bold': '700',
        },
        'font-size': {
          'size-xs': '12px',
          'size-sm': '14px',
          'size-md': '16px',
          'size-lg': '18px',
          'size-xl': '20px',
          'size-2xl': '24px',
        },
      },
      spacing: {
        'space-xs': '4px',
        'space-sm': '8px',
        'space-md': '16px',
        'space-lg': '24px',
        'space-xl': '32px',
      },
      radius: {
        'radius-none': '0px',
        'radius-sm': '4px',
        'radius-md': '8px',
        'radius-lg': '12px',
        'radius-xl': '16px',
        'radius-full': '9999px',
      },
      shadows: {
        'shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'shadow-md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'shadow-card': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'shadow-card-hover': '0 4px 8px rgba(0, 0, 0, 0.15)',
      },
    },
    semantic: {
      colors: {
        background: '--color-primary-50',
        surface: '#FFFFFF',
        text: '--color-primary-900',
        'text-secondary': '--color-primary-700',
        border: '--color-primary-200',
        'border-hover': '--color-primary-300',
        'focus-ring': 'rgba(var(--color-primary-500), 0.2)',
      },
    },
    component: {
      button: {
        primary: {
          background: '--color-primary-600',
          color: '#FFFFFF',
          padding: '8px 16px',
          radius: '8px',
          border: 'none',
          shadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          hover: {
            background: '--color-primary-700',
            shadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
          },
          active: {
            background: '--color-primary-800',
            transform: 'translateY(1px)',
          },
          disabled: {
            background: '--color-primary-200',
            color: '--color-primary-400',
            shadow: 'none',
          },
        },
        secondary: {
          background: '--color-primary-100',
          color: '--color-primary-900',
          padding: '8px 16px',
          radius: '8px',
          border: '1px solid --color-primary-200',
          hover: {
            background: '--color-primary-200',
          },
          active: {
            background: '--color-primary-300',
          },
          disabled: {
            background: '#F5F5F5',
            color: '#A1A1AA',
            border: '1px solid #E4E4E7',
          },
        },
        icon: {
          size: '36px',
          padding: '8px',
          radius: '8px',
          color: '--color-primary-600',
          background: 'transparent',
          hover: {
            background: '--color-primary-50',
            color: '--color-primary-700',
          },
          active: {
            background: '--color-primary-100',
            color: '--color-primary-800',
          },
        },
      },
      input: {
        text: {
          background: '#FFFFFF',
          color: '--color-primary-900',
          padding: '8px 16px',
          radius: '8px',
          border: '1px solid --color-primary-200',
          'font-size': '14px',
          shadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
          placeholder: {
            color: '--color-primary-400',
          },
          hover: {
            border: '1px solid --color-primary-300',
          },
          focus: {
            border: '1px solid --color-primary-500',
            shadow: '0 0 0 3px var(--focus-ring)',
          },
          error: {
            border: '1px solid #EF4444',
            shadow: '0 0 0 3px rgba(239, 68, 68, 0.2)',
          },
          disabled: {
            background: '#F5F5F5',
            color: '#A1A1AA',
            border: '1px solid #E4E4E7',
          },
        },
      },
      select: {
        background: '#FFFFFF',
        color: '--color-primary-900',
        padding: '8px 16px',
        radius: '8px',
        border: '1px solid --color-primary-200',
        'icon-size': '20px',
        'icon-color': '--color-primary-500',
        hover: {
          border: '1px solid --color-primary-300',
        },
        focus: {
          border: '1px solid --color-primary-500',
          shadow: '0 0 0 3px var(--focus-ring)',
        },
        options: {
          background: '#FFFFFF',
          shadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          radius: '8px',
          'option-hover': '--color-primary-50',
        },
      },
      checkbox: {
        size: '18px',
        radius: '4px',
        border: '2px solid --color-primary-300',
        background: '#FFFFFF',
        'icon-size': '14px',
        'icon-color': '#FFFFFF',
        checked: {
          background: '--color-primary-600',
          border: '2px solid --color-primary-600',
        },
        hover: {
          border: '2px solid --color-primary-400',
        },
        disabled: {
          background: '#F5F5F5',
          border: '2px solid #E4E4E7',
        },
      },
      radio: {
        size: '18px',
        border: '2px solid --color-primary-300',
        background: '#FFFFFF',
        'dot-size': '10px',
        'dot-color': '#FFFFFF',
        checked: {
          background: '--color-primary-600',
          border: '2px solid --color-primary-600',
        },
        hover: {
          border: '2px solid --color-primary-400',
        },
        disabled: {
          background: '#F5F5F5',
          border: '2px solid #E4E4E7',
        },
      },
      switch: {
        width: '36px',
        height: '20px',
        radius: '10px',
        background: '--color-primary-200',
        'thumb-size': '16px',
        'thumb-color': '#FFFFFF',
        'thumb-shadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
        checked: {
          background: '--color-primary-600',
        },
        hover: {
          background: '--color-primary-300',
        },
        disabled: {
          background: '#E4E4E7',
          'thumb-color': '#F5F5F5',
        },
      },
      dropdown: {
        background: '#FFFFFF',
        radius: '8px',
        shadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid --color-primary-200',
        item: {
          padding: '8px 16px',
          color: '--color-primary-900',
          hover: {
            background: '--color-primary-50',
          },
          active: {
            background: '--color-primary-100',
          },
          disabled: {
            color: '#A1A1AA',
          },
        },
      },
      card: {
        background: '#FFFFFF',
        radius: '12px',
        padding: '24px',
        border: '1px solid --color-primary-100',
        shadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        hover: {
          shadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-2px)',
        },
      },
    },
  };
}

function renderTokenValue(value, indent = 0, key = '') {
  if (value === undefined || value === null) {
    return '<span class="token-value">-</span>';
  }

  if (typeof value === 'object') {
    return `<div class="token-object">
      ${Object.entries(value)
        .map(
          ([k, v]) => `
        <div class="token-item">
          <h4 class="token-key">${k}</h4>
          ${renderTokenValue(v, indent + 1, k)}
          ${k === 'primary' || k === 'secondary' ? renderHTMLExample(k) : ''}
          ${k === 'card' ? renderHTMLExample('card') : ''}
        </div>
      `
        )
        .join('')}
    </div>`;
  }

  const stringValue = String(value);

  if (
    stringValue.startsWith('#') ||
    stringValue.startsWith('var(--color') ||
    stringValue.startsWith('rgb') ||
    stringValue.includes('rgba')
  ) {
    return `<div class="token-color">
      <div class="color-preview" style="background-color: ${stringValue}; width: 24px; height: 24px; border-radius: var(--button-radius);"></div>
      <span class="token-value">${stringValue}</span>
    </div>`;
  }

  if (stringValue.includes('shadow')) {
    return `<div class="token-shadow">
      <div class="shadow-preview" style="box-shadow: ${stringValue}"></div>
      <span class="token-value">${stringValue}</span>
    </div>`;
  }

  return `<span class="token-value">${stringValue}</span>`;
}

function renderHTMLExample(componentType) {
  const examples = {
    radio: `
      <div class="html-example">
        <div class="code-preview">
          <label class="ui-radio">
            <input type="radio" name="radio">
            <span class="radiomark"></span>
            Radio label
          </label>
        </div>
        <pre><code>
<!-- HTML -->
<label class="ui-radio">
  <input type="radio" name="radio">
  <span class="radiomark"></span>
  Radio label
</label>
        </code></pre>
        <div class="tokens-docs">
          <h5 style="font-size: 16px; margin-bottom: 16px;">Applied Tokens</h5>
          <ul>
            <li><strong>Size:</strong> --size-md (18px)</li>
            <li><strong>Border:</strong> 2px solid --color-primary-300</li>
            <li><strong>Background:</strong> #FFFFFF</li>
            <li><strong>Inner dot:</strong> --dot-size (10px)</li>
            <li><strong>Dot color:</strong> #FFFFFF when checked</li>
          </ul>
        </div>
      </div>`,
    checkbox: `
      <div class="html-example">
        <div class="code-preview">
          <label class="ui-checkbox">
            <input type="checkbox">
            <span class="checkmark"></span>
            Checkbox label
          </label>
        </div>
        <pre><code>
<!-- HTML -->
<label class="ui-checkbox">
  <input type="checkbox">
  <span class="checkmark"></span>
  Checkbox label
</label>
        </code></pre>
        <div class="tokens-docs">
          <h5 style="font-size: 16px; margin-bottom: 16px;">Applied Tokens</h5>
          <ul>
            <li><strong>Size:</strong> --size-md (18px)</li>
            <li><strong>Border:</strong> 2px solid --color-primary-300</li>
            <li><strong>Radius:</strong> --radius-sm (4px)</li>
            <li><strong>Background checked:</strong> --color-primary-600</li>
            <li><strong>Icon checked:</strong> #FFFFFF</li>
          </ul>
        </div>
      </div>`,
    switch: `
      <div class="html-example">
        <div class="code-preview">
          <label class="ui-switch">
            <input type="checkbox">
            <span class="slider"></span>
          </label>
        </div>
        <pre><code>
<!-- HTML -->
<label class="ui-switch">
  <input type="checkbox">
  <span class="slider"></span>
</label>
        </code></pre>
        <div class="tokens-docs">
          <h5 style="font-size: 16px; margin-bottom: 16px;">Applied Tokens</h5>
          <ul>
            <li><strong>Width:</strong> 36px</li>
            <li><strong>Height:</strong> 20px</li>
            <li><strong>Radius:</strong> 10px</li>
            <li><strong>Background:</strong> --color-primary-200</li>
            <li><strong>Thumb size:</strong> 16px</li>
            <li><strong>Thumb color:</strong> #FFFFFF</li>
          </ul>
        </div>
      </div>`,
    dropdown: `
      <div class="html-example">
        <div class="code-preview">
          <div class="ui-dropdown">
            <button class="ui-dropdown-toggle">Dropdown</button>
            <div class="ui-dropdown-menu">
              <div class="ui-dropdown-item">Option 1</div>
              <div class="ui-dropdown-item">Option 2</div>
              <div class="ui-dropdown-item">Option 3</div>
            </div>
          </div>
        </div>
        <pre><code>
<!-- HTML -->
<div class="ui-dropdown">
  <button class="ui-dropdown-toggle">Dropdown</button>
  <div class="ui-dropdown-menu">
    <div class="ui-dropdown-item">Option 1</div>
    <div class="ui-dropdown-item">Option 2</div>
    <div class="ui-dropdown-item">Option 3</div>
  </div>
</div>
        </code></pre>
        <div class="tokens-docs">
          <h5 style="font-size: 16px; margin-bottom: 16px;">Applied Tokens</h5>
          <ul>
            <li><strong>Background:</strong> #FFFFFF</li>
            <li><strong>Radius:</strong> --radius-md (8px)</li>
            <li><strong>Border:</strong> 1px solid --color-primary-200</li>
            <li><strong>Shadow:</strong> 0 4px 6px rgba(0, 0, 0, 0.1)</li>
            <li><strong>Item padding:</strong> 8px 16px</li>
          </ul>
        </div>
      </div>`,
    select: `
      <div class="html-example">
        <div class="code-preview">
          <div class="ui-select-wrapper">
            <select class="ui-select">
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>
        </div>
        <pre><code>
<!-- HTML -->
<div class="ui-select-wrapper">
  <select class="ui-select">
    <option>Option 1</option>
    <option>Option 2</option>
    <option>Option 3</option>
  </select>
</div>
        </code></pre>
        <div class="tokens-docs">
          <h5 style="font-size: 16px; margin-bottom: 16px;">Applied Tokens</h5>
          <ul>
            <li><strong>Background:</strong> #FFFFFF</li>
            <li><strong>Radius:</strong> --radius-md (8px)</li>
            <li><strong>Border:</strong> 1px solid --color-primary-200</li>
            <li><strong>Padding:</strong> 8px 16px</li>
            <li><strong>Icon:</strong> --icon-size (20px)</li>
          </ul>
        </div>
      </div>`,
    button: `
      <div class="html-example">
        <div class="code-preview">
          <button class="ui-button primary">Primary Button</button>
        </div>
        <pre><code>
<!-- HTML -->
<button class="ui-button primary">Primary Button</button>
        </code></pre>
        <div class="tokens-docs">
          <h5 style="font-size: 16px; margin-bottom: 16px;">Applied Tokens</h5>
          <ul>
            <li><strong>Background:</strong> --color-primary-600</li>
            <li><strong>Text color:</strong> --color-background</li>
            <li><strong>Padding:</strong> --space-md</li>
            <li><strong>Radius:</strong> --radius-md</li>
            <li><strong>Border:</strong> none</li>
            <li><strong>Shadow:</strong> --shadow-sm</li>
          </ul>
        </div>
      </div>`,
    input: `
      <div class="html-example">
        <div class="code-preview">
          <div class="ui-input-group">
            <label>Label</label>
            <input type="text" class="ui-input" placeholder="Placeholder">
          </div>
        </div>
        <pre><code>
<!-- HTML -->
<div class="ui-input-group">
  <label>Label</label>
  <input type="text" class="ui-input" placeholder="Placeholder">
</div>
        </code></pre>
        <div class="tokens-docs">
          <h5 style="font-size: 16px; margin-bottom: 16px;">Applied Tokens</h5>
          <ul>
            <li><strong>Background:</strong> --color-background</li>
            <li><strong>Text color:</strong> --color-text</li>
            <li><strong>Padding:</strong> --space-md</li>
            <li><strong>Radius:</strong> --radius-md</li>
            <li><strong>Border:</strong> --border-xs / --color-primary-200</li>
            <li><strong>Font size:</strong> --font-size-sm</li>
          </ul>
        </div>
      </div>`,
  };

  return examples[componentType] || '';
}

function updateTokenViewer() {
  const drawer = document.querySelector('.drawer-content');
  const currentColor = document.querySelector('.color-preview').style.backgroundColor;
  const colorName = document
    .querySelector('.color-name')
    .textContent.toLowerCase()
    .replace(/\s+/g, '-');
  const selectedRadius = document.querySelector('.radius-card.active')?.dataset.radius || 'md';
  const color = chroma(currentColor);
  const textColor = color.luminance() > 0.5 ? chroma('black') : chroma('white');
  const baseColor = color.hex();

  drawer.innerHTML = `
    <div class="token-section">
      <div class="section-header">
        <span class="material-symbols-outlined" style="color: ${color.alpha(0.7)}">palette</span>
        <h3>Raw Value</h3>
      </div>
      <p class="token-description" style="color: #4c5d6b">The pure hexadecimal value of the color, the most basic form of representing a color in digital design.</p>
      <div class="token-card" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px;">
        <div class="token-preview" style="background: ${baseColor}; border-radius: 8px; height: 64px; margin-bottom: 12px;"></div>
        <code style="color: #334155; font-family: 'Roboto Mono', monospace; font-size: 14px;">${baseColor}</code>
      </div>
    </div>

    <div class="token-section">
      <div class="section-header">
        <span class="material-symbols-outlined" style="color: ${color.alpha(0.7)}">token</span>
        <h3>Primitive Token</h3>
      </div>
      <p class="token-description" style="color: #4c5d6b">The primitive token is the first layer of abstraction, representing the base color in our design system.</p>
      <div class="token-card" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px;">
        <div class="token-preview" style="background: ${baseColor}; border-radius: 8px; height: 64px; margin-bottom: 12px;"></div>
        <code style="color: #334155; font-family: 'Roboto Mono', monospace; font-size: 14px;">color-${colorName}-600</code>
      </div>
    </div>

    <div class="token-section">
      <div class="section-header">
        <span class="material-symbols-outlined" style="color: ${color.alpha(0.7)}">smart_button</span>
        <h3>Button Anatomy</h3>
      </div>
      <p class="token-description" style="color: #4c5d6b">A comprehensive breakdown of how design tokens create our button component.</p>
      
      <div class="interactive-preview" style="background: ${color.alpha(0.05)}; padding: 24px; border-radius: 12px; margin: 16px 0;">
        <button class="ui-button primary">Primary Button</button>
      </div>

      <div class="token-categories">
        <div class="token-category">
          <div class="category-header">
            <span class="material-symbols-outlined" style="color: ${color.alpha(0.7)}">palette</span>
            <h4>Color Tokens</h4>
          </div>
          <div class="token-mapping" style="background: ${color.alpha(0.03)};">
            <div class="token-item">
              <div class="token-label">Background</div>
              <div class="token-flow">
                <code class="token primitive">color-primary-600</code>
                <span class="arrow">→</span>
                <code class="token semantic">button-background-primary</code>
              </div>
            </div>
            <div class="token-item">
              <div class="token-label">Text</div>
              <div class="token-flow">
                <code class="token primitive">color-white</code>
                <span class="arrow">→</span>
                <code class="token semantic">button-text-primary</code>
              </div>
            </div>
          </div>
        </div>

        <div class="token-category">
          <div class="category-header">
            <span class="material-symbols-outlined" style="color: ${color.alpha(0.7)}">text_fields</span>
            <h4>Typography Tokens</h4>
          </div>
          <div class="token-mapping" style="background: ${color.alpha(0.03)};">
            <div class="token-item">
              <div class="token-label">Font Family</div>
              <div class="token-flow">
                <code class="token primitive">font-family-primary</code>
                <span class="arrow">→</span>
                <code class="token semantic">button-font-family</code>
              </div>
            </div>
          </div>
        </div>

        <div class="token-category">
          <div class="category-header">
            <span class="material-symbols-outlined" style="color: ${color.alpha(0.7)}">space_bar</span>
            <h4>Spacing Tokens</h4>
          </div>
          <div class="token-mapping" style="background: ${color.alpha(0.03)};">
            <div class="token-item">
              <div class="token-label">Padding X</div>
              <div class="token-flow">
                <code class="token primitive">spacing-3</code>
                <span class="arrow">→</span>
                <code class="token semantic">button-padding-x</code>
              </div>
            </div>
          </div>
        </div>

        <div class="token-category">
          <div class="category-header">
            <span class="material-symbols-outlined" style="color: ${color.alpha(0.7)}">rounded_corner</span>
            <h4>Shape Tokens</h4>
          </div>
          <div class="token-mapping" style="background: ${color.alpha(0.03)};">
            <div class="token-item">
              <div class="token-label">Border Radius</div>
              <div class="token-flow">
                <code class="token semantic">button-radius</code>
                <span class="arrow">→</span>
                <code class="token primitive">radius-${selectedRadius}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Añadir estilos dinámicos
  const style = document.createElement('style');
  style.textContent = `
    .drawer-content {
      padding: 32px;
      height: 100vh;
      overflow-y: auto;
    }

    .token-section {
      margin-bottom: 48px;
    }

    .token-section:last-child {
      margin-bottom: 0;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .section-header h3 {
      text-align: left;
      font-size: 24px;
      font-weight: 600;
      color: #1a202c;
      margin: 0;
    }

    .token-description {
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 24px;
      text-align: left;
      color: #4c5d6b;
    }

    .token-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 16px;
      margin-top: 16px;
    }

    .token-preview {
      border-radius: 8px;
      height: 80px;
      margin-bottom: 12px;
    }

    .category-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .category-header h4 {
      text-align: left;
      font-size: 16px;
      font-weight: 600;
      color: #1a202c;
      margin: 0;
    }

    .token-categories {
      display: flex;
      flex-direction: column;
      gap: 32px;
      margin-top: 32px;
    }

    .token-category {
      margin-bottom: 24px;
    }

    .token-category:last-child {
      margin-bottom: 0;
    }

    .token-mapping {
      padding: 16px;
      border-radius: 8px;
      margin-top: 8px;
    }

    .token-item {
      margin-bottom: 16px;
    }

    .token-item:last-child {
      margin-bottom: 0;
    }

    .token-label {
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 8px;
      text-align: left;
    }

    .token-flow {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
    }

    .token {
      font-family: 'Roboto Mono', monospace;
      padding: 4px 8px;
      border-radius: 4px;
      background: ${color.alpha(0.05)};
      color: ${color.saturate(1)};
      border: 1px solid ${color.alpha(0.1)};
    }

    .token.semantic {
      color: ${color.saturate(1.5)};
    }

    .arrow {
      color: ${color.alpha(0.4)};
      font-size: 16px;
    }

    .interactive-preview {
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${color.alpha(0.05)};
      padding: 32px;
      border-radius: 12px;
      margin: 24px 0;
    }

    /* Estilos para el drawer y los botones */
    #designTokensDrawer {
      position: fixed;
      top: 0;
      left: 0;
      width: 400px;
      height: 100vh;
      background: white;
      box-shadow: 4px 0 16px rgba(0, 0, 0, 0.1);
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      z-index: 1001;
    }

    #designTokensDrawer.open {
      transform: translateX(0);
    }

    /* Botón Design Tokens */
    #designTokensButton {
      position: fixed;
      top: 16px;
      left: 16px;
      z-index: 1000;
      transition: transform 0.3s ease;
      display: inline-flex;
      align-items: center;
      padding: 8px 16px;
      border-radius: 8px;
      background: var(--color-primary-600);
      color: var(--color-primary-50) !important;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      gap: 8px;
    }

    #designTokensDrawer.open ~ #designTokensButton {
      transform: translateX(400px);
    }

    /* Botón cerrar drawer */
    .close-drawer {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: var(--color-primary-50);
      color: var(--color-primary-900);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;
      z-index: 1002;
    }

    .close-drawer:hover {
      background: var(--color-primary-100);
    }

    .close-drawer .material-symbols-outlined {
      font-size: 20px;
    }

    /* Sidebar (derecha) */
    .sidebar {
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      height: 100vh;
      background: white;
      box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
      transform: translateX(100%);
      transition: transform 0.3s ease;
      z-index: 1001;
    }

    .sidebar.open {
      transform: translateX(0);
    }

    /* Botón Customize */
    #customizeButton {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 1000;
      transition: transform 0.3s ease;
    }

    .sidebar.open ~ #customizeButton {
      transform: translateX(-416px);
    }

    // ... rest of the styles ...
  `;

  document.head.appendChild(style);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function () {
  // Design Tokens Drawer
  const designTokensButton = document.getElementById('designTokensButton');
  const closeDrawerButton = document.querySelector('.close-drawer');
  const drawer = document.getElementById('designTokensDrawer');

  if (designTokensButton && drawer) {
    designTokensButton.addEventListener('click', () => {
      drawer.classList.add('open');
      updateTokenViewer();
    });
  }

  if (closeDrawerButton && drawer) {
    closeDrawerButton.addEventListener('click', () => {
      drawer.classList.remove('open');
    });
  }

  // Sidebar
  const customizeButton = document.getElementById('customizeButton');
  const sidebar = document.querySelector('.sidebar');

  if (customizeButton && sidebar) {
    customizeButton.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // ... rest of the event listeners ...
});
