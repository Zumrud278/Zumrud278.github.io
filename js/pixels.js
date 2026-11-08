(() => {
  const colors = ['#2E7D4F', '#FFC93C', '#FF6B57', '#8E6BFF'];
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
    zIndex: '1'
  });
  document.body.append(canvas);

  function valueFor(row, column, side, corner, salt = 0) {
    let value = Math.imul(row + 1, 374761393);
    value = Math.imul(value ^ (column + 1), 668265263);
    value = Math.imul(value ^ (side === 'left' ? 1013904223 : 1664525), 2246822519);
    value = Math.imul(value ^ (corner === 'top' ? 0x9e3779b9 : 0x85ebca6b), 3266489917);
    value = Math.imul(value ^ salt, 668265263);
    value ^= value >>> 13;
    return (value >>> 0) / 4294967296;
  }

  function drawBackground() {
    const width = document.documentElement.clientWidth;
    const header = document.querySelector('.site-header');
    const footer = document.querySelector('.site-footer');
    if (!header || !footer) {
      console.error('Unable to find the page header and footer for the pixel background.');
      return;
    }

    const headerBottom = header.getBoundingClientRect().bottom + window.scrollY;
    const footerTop = footer.getBoundingClientRect().top + window.scrollY;
    const height = Math.max(0, footerTop - headerBottom);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const mobile = width <= 650;
    const cellSize = 16;
    const sideWidth = width * 0.14;
    const columns = Math.ceil(sideWidth / cellSize);
    const rows = Math.ceil(height / cellSize);
    const mobileDensity = mobile ? 0.7 : 1;
    const contentInset = Math.max(24, (width - 1100) / 2);

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.top = `${headerBottom}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.globalAlpha = 1;
    const corners = [
      { side: 'left', vertical: 'top' },
      { side: 'right', vertical: 'top' },
      { side: 'left', vertical: 'bottom' },
      { side: 'right', vertical: 'bottom' }
    ];

    for (let column = 0; column < columns; column += 1) {
      for (let distanceFromCorner = 0; distanceFromCorner < rows; distanceFromCorner += 1) {
        const dissolve = Math.max(
          0,
          1 - Math.sqrt((column / 7) ** 2 + (distanceFromCorner / 16) ** 2)
        );
        const density = dissolve * mobileDensity;

        for (let cornerIndex = 0; cornerIndex < corners.length; cornerIndex += 1) {
          const { side, vertical } = corners[cornerIndex];
          const row = vertical === 'top'
            ? distanceFromCorner
            : rows - distanceFromCorner - 1;

          const denseCorner = column < 2 && distanceFromCorner < 2;
          if (row < 0 || !denseCorner && valueFor(row, column, side, vertical) >= density) {
            continue;
          }

          const size = cellSize;
          const x = side === 'left'
            ? column * cellSize
            : width - (column + 1) * cellSize;
          const y = row * cellSize;

          if (
            x < 0 ||
            side === 'left' && x + size > sideWidth ||
            side === 'right' && x < width - sideWidth
          ) {
            continue;
          }

          if (x < width - contentInset && x + size > contentInset) {
            continue;
          }

          context.fillStyle = colors[
            Math.floor(valueFor(row, column, side, vertical, cornerIndex + 1) * colors.length)
          ];
          context.fillRect(x, y, size, size);
        }
      }
    }
  }

  function initialize() {
    document.fonts.ready.then(() => {
      drawBackground();
      window.addEventListener('resize', drawBackground);
    });
  }

  if (document.readyState === 'complete') {
    initialize();
  } else {
    window.addEventListener('load', initialize, { once: true });
  }
})();
