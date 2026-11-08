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
    zIndex: '3'
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

    const footerTop = footer.getBoundingClientRect().top + window.scrollY;
    const height = Math.max(0, footerTop);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const mobile = width <= 650;
    const cellSize = Math.round(width * 0.026 * pixelRatio) / pixelRatio;
    const sideWidth = width * 0.14;
    const columns = Math.floor(sideWidth / cellSize);
    const rows = Math.floor(height / cellSize);
    const mobileDensity = mobile ? 0.7 : 1;
    const content = document.querySelector('#home, .about-content, .page-content');
    const contentRect = content?.getBoundingClientRect();
    const contentLeft = contentRect ? contentRect.left - 3 : width / 2;
    const contentRight = contentRect ? contentRect.right + 3 : width / 2;
    const blockedAreas = [...document.querySelectorAll('.site-nav a, .site-nav button')].map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left - 3,
        top: rect.top + window.scrollY - 3,
        right: rect.right + 3,
        bottom: rect.bottom + window.scrollY + 3
      };
    });

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.top = '0';
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.globalAlpha = 1;
    const corners = [
      { side: 'left', vertical: 'top' },
      { side: 'right', vertical: 'top' },
      { side: 'left', vertical: 'bottom' },
      { side: 'right', vertical: 'bottom' }
    ];
    const snapToPixel = (value) => Math.round(value * pixelRatio) / pixelRatio;

    for (let column = 0; column < columns; column += 1) {
      for (let distanceFromCorner = 0; distanceFromCorner < rows; distanceFromCorner += 1) {
        const dissolve = Math.max(
          0,
          1 - Math.sqrt(
            (column / Math.max(columns * 1.12, 1)) ** 2 +
            (distanceFromCorner / Math.max(rows * 0.2, 1)) ** 2
          )
        );
        const density = dissolve > 0 ? Math.pow(dissolve, 0.35) * mobileDensity : 0;

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
            ? snapToPixel(column * cellSize)
            : snapToPixel(width - (column + 1) * cellSize);
          const y = snapToPixel(vertical === 'top'
            ? row * cellSize
            : height - (distanceFromCorner + 1) * cellSize);

          if (
            x < 0 ||
            side === 'left' && x + size > sideWidth ||
            side === 'right' && x < width - sideWidth
          ) {
            continue;
          }

          if (x < contentRight && x + size > contentLeft) {
            continue;
          }

          if (
            blockedAreas.some((area) =>
              x < area.right &&
              x + size > area.left &&
              y < area.bottom &&
              y + size > area.top
            )
          ) {
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
