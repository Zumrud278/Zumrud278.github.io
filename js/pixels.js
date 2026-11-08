(() => {
  const colors = ['#2E7D4F', '#FFC93C', '#FF6B57', '#8E6BFF'];
  const blockedSelectors = [
    '.site-nav',
    '#home',
    '.about-content',
    '.page-content',
    '.footer-inner',
    '.about-tile',
    '.project-card',
    '.contact-card',
    '.contact-social-tile',
    'h1',
    'h2',
    'h3',
    'p',
    'a',
    'button',
    'label',
    'input',
    'textarea',
    'img',
    'svg'
  ].join(',');
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    console.error('Unable to create the pixel background canvas.');
    return;
  }

  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    pointerEvents: 'none',
    zIndex: '3'
  });
  document.body.append(canvas);

  function valueFor(row, column, side, salt = 0) {
    let value = Math.imul(row + 1, 374761393);
    value = Math.imul(value ^ (column + 1), 668265263);
    value = Math.imul(value ^ (side === 'left' ? 1013904223 : 1664525), 2246822519);
    value = Math.imul(value ^ salt, 3266489917);
    value ^= value >>> 13;
    return (value >>> 0) / 4294967296;
  }

  function drawBackground() {
    const width = document.documentElement.clientWidth;
    const height = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const mobile = width <= 650;
    const cellSize = mobile ? 20 : 26;
    const sideWidth = width * 0.14;
    const columns = Math.ceil(sideWidth / cellSize);
    const rows = Math.ceil(height / cellSize);
    const mobileDensity = mobile ? 0.4 : 1;
    const blockedAreas = [...document.querySelectorAll(blockedSelectors)].map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left + window.scrollX - 3,
        top: rect.top + window.scrollY - 3,
        right: rect.right + window.scrollX + 3,
        bottom: rect.bottom + window.scrollY + 3
      };
    });

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.globalAlpha = 1;
    const snapToPixel = (value) => Math.round(value * pixelRatio) / pixelRatio;

    for (let column = 0; column < columns; column += 1) {
      for (let row = 0; row < rows; row += 1) {
        const edgeDistance = column / Math.max(columns - 1, 1);
        const cornerDistance = Math.min(row, rows - 1 - row) / Math.max(rows / 2, 1);
        const density =
          Math.exp(-edgeDistance * 2.8) *
          (0.12 + 0.88 * Math.exp(-cornerDistance * 5)) *
          mobileDensity;

        for (const side of ['left', 'right']) {
          if (valueFor(row, column, side) >= density) {
            continue;
          }

          const size = snapToPixel(mobile
            ? 6 + valueFor(row, column, side, 1) * 5
            : 8 + valueFor(row, column, side, 1) * 9);
          const offsetX = snapToPixel(valueFor(row, column, side, 2) * (cellSize - size));
          const offsetY = snapToPixel(valueFor(row, column, side, 3) * (cellSize - size));
          const x = side === 'left'
            ? snapToPixel(column * cellSize + offsetX)
            : snapToPixel(width - column * cellSize - offsetX - size);
          const y = snapToPixel(row * cellSize + offsetY);

          if (
            x < 0 ||
            side === 'left' && x + size > sideWidth ||
            side === 'right' && x < width - sideWidth
          ) {
            continue;
          }

          const overlapsContent = blockedAreas.some((area) =>
            x < area.right &&
            x + size > area.left &&
            y < area.bottom &&
            y + size > area.top
          );
          if (overlapsContent) {
            continue;
          }

          context.fillStyle = colors[Math.floor(valueFor(row, column, side, 4) * colors.length)];
          context.fillRect(x, y, size, size);
        }
      }
    }
  }

  function initialize() {
    drawBackground();
    window.addEventListener('resize', drawBackground);
  }

  if (document.readyState === 'complete') {
    initialize();
  } else {
    window.addEventListener('load', initialize, { once: true });
  }
})();
