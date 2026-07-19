const REACTIVE_SELECTOR = [
  'a',
  'button',
  '.project-card',
  '.skill-card',
  '.skill-row',
  '.contact-item',
  '.stat-card',
].join(', ');

const DISABLE_QUERY = '(pointer: coarse), (prefers-reduced-motion: reduce)';

function isDisabled() {
  return window.matchMedia(DISABLE_QUERY).matches;
}

function closestReactiveElement(target) {
  return target instanceof Element ? target.closest(REACTIVE_SELECTOR) : null;
}

function setHoverPosition(element, event) {
  const rect = element.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  element.style.setProperty('--cursor-x', `${x.toFixed(2)}%`);
  element.style.setProperty('--cursor-y', `${y.toFixed(2)}%`);
}

function createRipple(event) {
  const ripple = document.createElement('span');
  ripple.className = 'cursor-click-ripple';
  ripple.style.left = `${event.clientX}px`;
  ripple.style.top = `${event.clientY}px`;
  ripple.setAttribute('aria-hidden', 'true');

  document.body.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
}

export function initCursorFeedback() {
  if (isDisabled()) return;

  let activeElement = null;
  let frame = 0;
  let lastEvent = null;

  document.addEventListener('pointerover', (event) => {
    const nextElement = closestReactiveElement(event.target);
    if (!nextElement || nextElement === activeElement) return;

    activeElement?.classList.remove('cursor-reactive-active');
    activeElement = nextElement;
    activeElement.classList.add('cursor-reactive', 'cursor-reactive-active');
    setHoverPosition(activeElement, event);
  }, { passive: true });

  document.addEventListener('pointermove', (event) => {
    if (!activeElement) return;

    lastEvent = event;
    if (frame) return;

    frame = requestAnimationFrame(() => {
      frame = 0;
      if (activeElement && lastEvent) {
        setHoverPosition(activeElement, lastEvent);
      }
    });
  }, { passive: true });

  document.addEventListener('pointerout', (event) => {
    if (!activeElement) return;
    if (event.relatedTarget instanceof Node && activeElement.contains(event.relatedTarget)) return;

    activeElement.classList.remove('cursor-reactive-active');
    activeElement = null;
  }, { passive: true });

  document.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    createRipple(event);
  }, { passive: true });
}
