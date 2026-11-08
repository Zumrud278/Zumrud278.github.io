(() => {
  const colors = ['#4A7C59', '#F5D547', '#F28C7A', '#D9CCF5'];
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
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '3'
  });
  document.body.append(canvas);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let squares = [];
  let blockedAreas = [];
  let lastBlockedAreaUpdate = 0;
  let pixelRatio = 1;

  function random() {
    return Math.random();
  }

  function createSquares() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const mobile = width <= 650;
    const cellSize = mobile ? 32 : 26;
    const sideWidth = width * 0.14;
    const columns = Math.ceil(sideWidth / cellSize);
    const rows = Math.ceil(height / cellSize);
    const mobileDensity = mobile ? 0.22 : 1;
    squares = [];

    for (let column = 0; column < columns; column += 1) {
      for (let row = 0; row < rows; row += 1) {
        const edgeDistance = column / Math.max(columns - 1, 1);
        const cornerDistance = Math.min(row, rows - 1 - row) / Math.max(rows / 2, 1);
        const density =
          Math.exp(-edgeDistance * 2.8) *
          (0.12 + 0.88 * Math.exp(-cornerDistance * 5)) *
          mobileDensity;

        for (const side of ['left', 'right']) {
          if (random() >= density) {
            continue;
          }

          const size = mobile ? 6 + random() * 5 : 8 + random() * 9;
          const offsetX = random() * (cellSize - size);
          const offsetY = random() * (cellSize - size);
          const x = side === 'left'
            ? column * cellSize + offsetX
            : width - column * cellSize - offsetX - size;

          if (
            x < 0 ||
            side === 'left' && x + size > sideWidth ||
            side === 'right' && x < width - sideWidth
          ) {
            continue;
          }

          squares.push({
            x,
            y: row * cellSize + offsetY,
            size,
            color: colors[Math.floor(random() * colors.length)],
            phase: random() * Math.PI * 2
          });
        }
      }
    }
  }

  function resizeCanvas() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * pixelRatio);
    canvas.height = Math.round(window.innerHeight * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    createSquares();
  }

  function updateBlockedAreas(now) {
    if (now - lastBlockedAreaUpdate < 200) {
      return;
    }

    const padding = 3;
    blockedAreas = [...document.querySelectorAll(blockedSelectors)].map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left - padding,
        top: rect.top - padding,
        right: rect.right + padding,
        bottom: rect.bottom + padding
      };
    });
    lastBlockedAreaUpdate = now;
  }

  function draw(now) {
    const width = window.innerWidth;
    updateBlockedAreas(now);
    context.clearRect(0, 0, width, window.innerHeight);

    for (const square of squares) {
      if (
        blockedAreas.some((area) =>
          square.x < area.right &&
          square.x + square.size > area.left &&
          square.y < area.bottom &&
          square.y + square.size > area.top
        )
      ) {
        continue;
      }

      const pulse = reducedMotion.matches
        ? 0.75
        : (Math.sin(now * 0.001 + square.phase) + 1) / 2;
      if (pulse < 0.12) {
        continue;
      }

      context.globalAlpha = 0.25 + pulse * 0.55;
      context.fillStyle = square.color;
      context.fillRect(square.x, square.y, square.size, square.size);
    }

    context.globalAlpha = 1;
    window.requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('scroll', () => {
    lastBlockedAreaUpdate = 0;
  }, { passive: true });

  resizeCanvas();
  window.requestAnimationFrame(draw);
})();
