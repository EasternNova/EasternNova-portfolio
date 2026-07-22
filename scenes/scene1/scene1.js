import { onScroll, localProgress } from '../../JS/utils/scrollProgress.js';
import { getSequence } from '../../JS/utils/assetLoader.js';
import { lerp, easeInOut } from '../../JS/utils/lerp.js';

const ring = document.getElementById('portal-ring');
const heroCopy = document.getElementById('hero-copy');
const scrollHint = document.getElementById('scroll-hint');

const avatarVideo = document.getElementById('avatar-hero-video');
const avatarImage = document.getElementById('avatar-hero-image');
const avatarNavButtons = document.querySelectorAll('[data-avatar-step]');

const widget = document.getElementById('avatar-360-widget');
const widgetCanvas = document.getElementById('avatar-360-widget-canvas');

const avatarModes = ['video', 'image'];
const SPIN_DRAG_PIXELS_PER_FRAME = 8.5;
const SPIN_AUTO_DURATION = 3400;
const IDLE_TURN_FRAME_DELTA = 7;
const IDLE_TURN_DURATION = 1500;
const IDLE_TURN_INTERVAL = 6800;
const frameBoundsCache = new WeakMap();

let currentAvatarMode = 0;

let spinFrames = [];
let spinCtx = null;
let spinFrameIndex = 0;
let spinSequenceBounds = null;

let isDraggingSpin = false;
let dragStartX = 0;
let dragStartFrame = 0;

let autoSpinId = null;
let idleTurnTimerId = null;
let idleTurnAnimationId = null;
let idleTurnDirection = 1;

export function initScene1(range) {
  initAvatarToggle();
  initSpinWidget();

  onScroll(({ progress }) => {
    const local = localProgress(progress, range.start, range.end);
    updateScene1(local);
  });
}

function initAvatarToggle() {
  if (!avatarVideo || !avatarImage || avatarNavButtons.length === 0) return;

  avatarNavButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const step = Number(button.dataset.avatarStep || 1);

      currentAvatarMode =
        (currentAvatarMode + step + avatarModes.length) %
        avatarModes.length;

      setAvatarMode(avatarModes[currentAvatarMode]);
    });
  });
}

function setAvatarMode(mode) {
  const showVideo = mode === 'video';

  avatarVideo.classList.toggle('is-active', showVideo);
  avatarImage.classList.toggle('is-active', !showVideo);

  if (showVideo) {
    avatarVideo.play().catch(() => {});
  } else {
    avatarVideo.pause();
  }
}

function initSpinWidget() {
  if (!widget || !widgetCanvas) return;

  spinFrames = getSequence('idle');
  spinCtx = widgetCanvas.getContext('2d');
  spinSequenceBounds = getSequenceFrameBounds(spinFrames);

  resizeSpinWidget();
  drawSpinFrame(0);

  window.addEventListener('resize', () => {
    resizeSpinWidget();
    drawSpinFrame(spinFrameIndex);
  });

  widgetCanvas.addEventListener('pointerdown', (event) => {
    cancelAutoSpin();
    cancelIdleTurn();

    isDraggingSpin = true;

    dragStartX = event.clientX;
    dragStartFrame = spinFrameIndex;

    widgetCanvas.classList.add('is-dragging');
    widgetCanvas.setPointerCapture(event.pointerId);
  });

  widgetCanvas.addEventListener('pointermove', (event) => {
    if (!isDraggingSpin || spinFrames.length === 0) return;

    const deltaX = event.clientX - dragStartX;

    drawSpinFrame(
      wrapFrame(dragStartFrame + Math.round(deltaX / SPIN_DRAG_PIXELS_PER_FRAME))
    );
  });

  widgetCanvas.addEventListener('pointerup', endSpinDrag);
  widgetCanvas.addEventListener('pointercancel', endSpinDrag);
  widgetCanvas.addEventListener('lostpointercapture', endSpinDrag);

  startAutoSpinOnce();
}

function startAutoSpinOnce() {
  if (!spinFrames.length) return;

  cancelAutoSpin();

  const start = performance.now();
  const duration = SPIN_AUTO_DURATION;
  const startFrame = spinFrameIndex;

  function tick(now) {
    const progress = Math.min(1, (now - start) / duration);

    drawSpinFrame(
      startFrame + Math.round(progress * spinFrames.length)
    );

    if (progress < 1) {
      autoSpinId = requestAnimationFrame(tick);
    } else {
      autoSpinId = null;
      scheduleIdleTurn();
    }
  }

  autoSpinId = requestAnimationFrame(tick);
}

function cancelAutoSpin() {
  if (!autoSpinId) return;

  cancelAnimationFrame(autoSpinId);
  autoSpinId = null;
}

function scheduleIdleTurn() {
  if (idleTurnTimerId || isDraggingSpin) return;

  idleTurnTimerId = window.setTimeout(() => {
    idleTurnTimerId = null;

    if (document.hidden || isDraggingSpin) {
      scheduleIdleTurn();
      return;
    }

    animateIdleTurn(idleTurnDirection);
    idleTurnDirection *= -1;
  }, IDLE_TURN_INTERVAL);
}

function animateIdleTurn(direction) {
  const start = performance.now();
  const restingFrame = spinFrameIndex;

  function tick(now) {
    if (isDraggingSpin) return;

    const progress = Math.min(1, (now - start) / IDLE_TURN_DURATION);
    const turnProgress = Math.sin(progress * Math.PI);

    drawSpinFrame(
      restingFrame + Math.round(IDLE_TURN_FRAME_DELTA * direction * turnProgress)
    );

    if (progress < 1) {
      idleTurnAnimationId = requestAnimationFrame(tick);
    } else {
      idleTurnAnimationId = null;
      scheduleIdleTurn();
    }
  }

  idleTurnAnimationId = requestAnimationFrame(tick);
}

function cancelIdleTurn() {
  if (idleTurnTimerId) {
    clearTimeout(idleTurnTimerId);
    idleTurnTimerId = null;
  }

  if (idleTurnAnimationId) {
    cancelAnimationFrame(idleTurnAnimationId);
    idleTurnAnimationId = null;
  }
}

function endSpinDrag() {
  isDraggingSpin = false;

  widgetCanvas?.classList.remove('is-dragging');
  scheduleIdleTurn();
}

function resizeSpinWidget() {
  if (!widgetCanvas) return;

  const rect = widgetCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  widgetCanvas.width = Math.round(rect.width * dpr);
  widgetCanvas.height = Math.round(rect.height * dpr);

  widgetCanvas.style.width = `${rect.width}px`;
  widgetCanvas.style.height = `${rect.height}px`;

  if (spinCtx) {
    spinCtx.setTransform(1, 0, 0, 1, 0, 0);
    spinCtx.scale(dpr, dpr);
  }
}

function drawSpinFrame(index) {
  if (!spinCtx || !widgetCanvas || spinFrames.length === 0) return;

  spinFrameIndex = wrapFrame(index);

  const frame = spinFrames[spinFrameIndex];

  const canvasWidth = widgetCanvas.clientWidth;
  const canvasHeight = widgetCanvas.clientHeight;

  const source = spinSequenceBounds || getVisibleFrameBounds(frame);
  const frameRatio = source.width / source.height;

  const paddingX = Math.max(16, canvasWidth * 0.06);
  const paddingTop = Math.max(18, canvasHeight * 0.025);
  const paddingBottom = Math.max(10, canvasHeight * 0.012);
  const maxHeight = canvasHeight - paddingTop - paddingBottom;
  const maxWidth = canvasWidth - paddingX * 2;
  const maxDrawableHeight = Math.min(maxHeight, maxWidth / frameRatio);
  const baseHeight = maxDrawableHeight * 0.96;
  const targetHeight = Math.min(baseHeight, maxDrawableHeight);
  const targetWidth = targetHeight * frameRatio;

  const x = (canvasWidth - targetWidth) / 2;
  const y = canvasHeight - targetHeight - paddingBottom;

  spinCtx.clearRect(0, 0, canvasWidth, canvasHeight);

  spinCtx.drawImage(
    frame,
    source.x,
    source.y,
    source.width,
    source.height,
    x,
    y,
    targetWidth,
    targetHeight
  );
}

function getVisibleFrameBounds(frame) {
  if (frameBoundsCache.has(frame)) {
    return frameBoundsCache.get(frame);
  }

  const width = frame.naturalWidth;
  const height = frame.naturalHeight;
  const fallback = { x: 0, y: 0, width, height };

  if (!width || !height) return fallback;

  const boundsCanvas = document.createElement('canvas');
  const boundsCtx = boundsCanvas.getContext('2d', { willReadFrequently: true });

  if (!boundsCtx) return fallback;

  boundsCanvas.width = width;
  boundsCanvas.height = height;
  boundsCtx.drawImage(frame, 0, 0);

  const pixels = boundsCtx.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = pixels[(y * width + x) * 4 + 3];

      if (alpha <= 8) continue;

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < minX || maxY < minY) {
    frameBoundsCache.set(frame, fallback);
    return fallback;
  }

  const bleed = 8;
  const sourceX = Math.max(0, minX - bleed);
  const sourceY = Math.max(0, minY - bleed);
  const sourceRight = Math.min(width - 1, maxX + bleed);
  const sourceBottom = Math.min(height - 1, maxY + bleed);
  const bounds = {
    x: sourceX,
    y: sourceY,
    width: sourceRight - sourceX + 1,
    height: sourceBottom - sourceY + 1,
  };

  frameBoundsCache.set(frame, bounds);
  return bounds;
}

function getSequenceFrameBounds(frames) {
  if (!frames.length) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let frameWidth = 0;
  let frameHeight = 0;

  frames.forEach((frame) => {
    const bounds = getVisibleFrameBounds(frame);

    frameWidth = frame.naturalWidth || frameWidth;
    frameHeight = frame.naturalHeight || frameHeight;

    minX = Math.min(minX, bounds.x);
    minY = Math.min(minY, bounds.y);
    maxX = Math.max(maxX, bounds.x + bounds.width);
    maxY = Math.max(maxY, bounds.y + bounds.height);
  });

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) {
    return null;
  }

  const sourceX = Math.max(0, minX);
  const sourceY = Math.max(0, minY);
  const sourceRight = Math.min(frameWidth, maxX);
  const sourceBottom = Math.min(frameHeight, maxY);

  return {
    x: sourceX,
    y: sourceY,
    width: sourceRight - sourceX,
    height: sourceBottom - sourceY,
  };
}

function wrapFrame(index) {
  if (spinFrames.length === 0) return 0;

  return (
    ((index % spinFrames.length) + spinFrames.length) %
    spinFrames.length
  );
}

function updateScene1(local) {
  const ringProgress = localProgress(local, 0.6, 1.0);

  const ringScale = lerp(
    1,
    0,
    easeInOut(ringProgress)
  );

  const ringOpacity = lerp(
    1,
    0,
    easeInOut(ringProgress)
  );

  const heroVisual = ring?.parentElement;

  if (heroVisual) {
    heroVisual.style.setProperty(
      '--ring-scale',
      ringScale
    );

    heroVisual.style.setProperty(
      '--hero-ring-opacity',
      ringOpacity
    );

    heroVisual.style.setProperty(
      '--hero-ring-y',
      `${lerp(0, 34, easeInOut(ringProgress))}px`
    );
  }

  if (widget) {
    widget.style.setProperty(
      '--widget-opacity',
      ringOpacity
    );
  }

  const textProgress = localProgress(local, 0.4, 0.9);

  const textOpacity = lerp(
    1,
    0,
    easeInOut(textProgress)
  );

  if (heroCopy) {
    heroCopy.style.setProperty(
      '--hero-text-opacity',
      textOpacity
    );

    heroCopy.style.setProperty(
      '--hero-copy-y',
      `${lerp(0, -24, easeInOut(textProgress))}px`
    );
  }

  const hintProgress = localProgress(local, 0.0, 0.3);

  if (scrollHint) {
    scrollHint.style.setProperty(
      '--scroll-hint-opacity',
      lerp(1, 0, hintProgress)
    );
  }

}
