(() => {
  const root = document.documentElement;
  const finePointer = window.matchMedia('(pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!finePointer.matches || reducedMotion.matches) return;

  const restingPoint = () => ({
    x: window.innerWidth * 0.72,
    y: Math.min(window.innerHeight * 0.2, 180),
  });

  let current = restingPoint();
  let target = { ...current };
  let frame = 0;

  const paint = () => {
    current.x += (target.x - current.x) * 0.12;
    current.y += (target.y - current.y) * 0.12;

    root.style.setProperty('--pointer-x', `${current.x.toFixed(1)}px`);
    root.style.setProperty('--pointer-y', `${current.y.toFixed(1)}px`);

    const distance = Math.abs(target.x - current.x) + Math.abs(target.y - current.y);
    if (distance > 0.2) {
      frame = window.requestAnimationFrame(paint);
    } else {
      frame = 0;
    }
  };

  const schedulePaint = () => {
    if (!frame) frame = window.requestAnimationFrame(paint);
  };

  window.addEventListener('pointermove', (event) => {
    target.x = event.clientX;
    target.y = event.clientY;
    root.classList.add('pointer-active');
    schedulePaint();
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', () => {
    target = restingPoint();
    root.classList.remove('pointer-active');
    schedulePaint();
  });

  window.addEventListener('resize', () => {
    if (!root.classList.contains('pointer-active')) {
      target = restingPoint();
      schedulePaint();
    }
  }, { passive: true });
})();
