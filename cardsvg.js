document.addEventListener('DOMContentLoaded', function () {
  console.log('CardSVG script loaded, initializing...');

  function createCopyButton() {
    const button = document.createElement('button');
    button.className = 'copy-svg-btn';
    button.style.cssText = `
            position: absolute;
            bottom: -25px;
            left: 50%;
            transform: translateX(-50%) translateY(-10px);
            opacity: 0;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: var(--color-primary-50);
            color: var(--color-primary-600);
            border: none;
            border-radius: 100px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;

    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.textContent = 'content_copy';
    icon.style.fontSize = '16px';

    const text = document.createTextNode('Copy SVG Card');

    button.appendChild(icon);
    button.appendChild(text);

    return button;
  }

  function initializeSVGCopyButtons() {
    const cards = document.querySelectorAll('.base-card');
    console.log('Found cards:', cards.length);

    cards.forEach((card) => {
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      wrapper.style.marginBottom = '30px';

      // Envolver la card
      card.parentNode.insertBefore(wrapper, card);
      wrapper.appendChild(card);

      const copyButton = createCopyButton();
      wrapper.appendChild(copyButton);

      let hideTimeout;

      // Eventos de hover
      function showButton() {
        clearTimeout(hideTimeout);
        copyButton.style.opacity = '1';
        copyButton.style.transform = 'translateX(-50%) translateY(0)';
      }

      function hideButton() {
        hideTimeout = setTimeout(() => {
          copyButton.style.opacity = '0';
          copyButton.style.transform = 'translateX(-50%) translateY(-10px)';
        }, 500);
      }

      card.addEventListener('mouseenter', showButton);
      copyButton.addEventListener('mouseenter', showButton);
      card.addEventListener('mouseleave', (e) => {
        if (!e.relatedTarget?.classList.contains('copy-svg-btn')) {
          hideButton();
        }
      });
      copyButton.addEventListener('mouseleave', (e) => {
        if (!e.relatedTarget?.classList.contains('base-card')) {
          hideButton();
        }
      });

      // Manejo de la copia
      copyButton.addEventListener('click', async function (e) {
        e.stopPropagation();
        try {
          // Verificar que dom-to-svg está disponible
          if (typeof elementToSVG === 'undefined') {
            throw new Error('SVG conversion library not loaded');
          }

          // Clonar la card para mantener los estilos
          const clonedCard = card.cloneNode(true);

          // Asegurar que el clon tenga las dimensiones correctas
          clonedCard.style.width = card.offsetWidth + 'px';
          clonedCard.style.height = card.offsetHeight + 'px';

          // Convertir a SVG manteniendo los estilos
          const svgString = elementToSVG(card, {
            width: card.offsetWidth,
            height: card.offsetHeight,
            style: true,
            computedStyle: true,
            filter: (node) => {
              // Solo incluir elementos de la card
              return (
                node.nodeType === 1 &&
                (node.classList.contains('base-card') || node.closest('.base-card'))
              );
            },
          });

          // Copiar al portapapeles
          await navigator.clipboard.writeText(svgString);

          // Notificar éxito
          showCustomAlert('SVG Card copied!');

          // Log para debug
          console.log('SVG copied successfully');
        } catch (error) {
          console.error('Error copying SVG Card:', error);
          showCustomAlert('Error copying SVG Card: ' + error.message);
        }
      });
    });
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSVGCopyButtons);
  } else {
    initializeSVGCopyButtons();
  }
});
