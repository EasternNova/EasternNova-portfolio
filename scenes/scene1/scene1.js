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
const SPIN_ZOOM_MIN = 0.62;
const SPIN_ZOOM_MAX = 1.18;
const SPIN_DRAG_PIXELS_PER_FRAME = 8.5;
const SPIN_AUTO_DURATION = 3400;
const SPIN_ATTENTION_FRAME_DELTA = 4;
const SPIN_ATTENTION_DURATION = 1050;
const ATTENTION_INTERVAL = 28000;
const frameBoundsCache = new WeakMap();

let currentAvatarMode = 0;

let spinFrames = [];
let spinCtx = null;
let spinFrameIndex = 0;

let spinZoom = 1;
let targetZoom = 1;
let animationFrame = null;

let isDraggingSpin = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartFrame = 0;
let dragStartZoom = 1;

let autoSpinId = null;
let attentionTimerId = null;
let attentionCount = 0;

export function initScene1(range) {
  initAvatarToggle();
  initSpinWidget();

  widgetCanvas?.addEventListener('mouseleave', resetAvatarWidget);

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

  resizeSpinWidget();
  drawSpinFrame(0);

  window.addEventListener('resize', () => {
    resizeSpinWidget();
    drawSpinFrame(spinFrameIndex);
  });

  widgetCanvas.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();

      setSpinZoom(
        targetZoom + (event.deltaY < 0 ? 0.10 : -0.10)
      );
    },
    { passive: false }
  );

  widgetCanvas.addEventListener('pointerdown', (event) => {
    cancelAutoSpin();

    isDraggingSpin = true;

    dragStartX = event.clientX;
    dragStartY = event.clientY;

    dragStartFrame = spinFrameIndex;
    dragStartZoom = spinZoom;

    widgetCanvas.classList.add('is-dragging');
    widget?.classList.add('is-pulled');

    widgetCanvas.setPointerCapture(event.pointerId);
  });

  widgetCanvas.addEventListener('pointermove', (event) => {
    if (!isDraggingSpin || spinFrames.length === 0) return;

    const deltaX = event.clientX - dragStartX;
    const deltaY = event.clientY - dragStartY;

    widget?.style.setProperty('--widget-x', `${deltaX}px`);
    widget?.style.setProperty('--widget-y', `${deltaY}px`);

    drawSpinFrame(
      wrapFrame(dragStartFrame + Math.round(deltaX / SPIN_DRAG_PIXELS_PER_FRAME))
    );

    const zoomDelta = -deltaY * 0.003;

    setSpinZoom(dragStartZoom + zoomDelta);
  });

  widgetCanvas.addEventListener('pointerup', endSpinDrag);
  widgetCanvas.addEventListener('pointercancel', endSpinDrag);
  widgetCanvas.addEventListener('lostpointercapture', endSpinDrag);

  startAutoSpinOnce();
  startAttentionNudges();
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
    }
  }

  autoSpinId = requestAnimationFrame(tick);
}

function cancelAutoSpin() {
  if (!autoSpinId) return;

  cancelAnimationFrame(autoSpinId);
  autoSpinId = null;
}

function startAttentionNudges() {
  if (!widget || !spinFrames.length || attentionTimerId) return;

  attentionTimerId = window.setInterval(() => {
    if (isDraggingSpin || document.hidden) return;

    attentionCount += 1;
    playAttentionNudge(attentionCount % 3 === 0);
  }, ATTENTION_INTERVAL);
}

function playAttentionNudge(showHint) {
  if (!widget || spinFrames.length === 0) return;

  widget.classList.remove('is-attention', 'is-hint-visible');

  requestAnimationFrame(() => {
    widget.classList.add('is-attention');

    if (showHint) {
      widget.classList.add('is-hint-visible');
    }
  });

  animateFrameNudge(SPIN_ATTENTION_FRAME_DELTA, SPIN_ATTENTION_DURATION);

  window.setTimeout(() => {
    widget?.classList.remove('is-attention');
  }, 1600);

  if (showHint) {
    window.setTimeout(() => {
      widget?.classList.remove('is-hint-visible');
    }, 2600);
  }
}

function animateFrameNudge(frameDelta, duration) {
  const start = performance.now();
  const startFrame = spinFrameIndex;

  function tick(now) {
    if (isDraggingSpin) return;

    const progress = Math.min(1, (now - start) / duration);
    const eased = easeInOut(progress);

    drawSpinFrame(
      startFrame + Math.round(frameDelta * eased)
    );

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

function endSpinDrag() {
  isDraggingSpin = false;

  widgetCanvas?.classList.remove('is-dragging');
  widget?.classList.remove('is-pulled', 'is-attention', 'is-hint-visible');

  widget?.style.setProperty('--widget-x', '0px');
  widget?.style.setProperty('--widget-y', '0px');
}

function resetAvatarWidget() {
  isDraggingSpin = false;

  widgetCanvas?.classList.remove('is-dragging');
  widget?.classList.remove('is-pulled', 'is-attention', 'is-hint-visible');

  widget?.style.setProperty('--widget-x', '0px');
  widget?.style.setProperty('--widget-y', '0px');

  targetZoom = 1;

  drawSpinFrame(0);
}

function setSpinZoom(value) {
  targetZoom = Math.max(SPIN_ZOOM_MIN, Math.min(SPIN_ZOOM_MAX, value));

  if (!animationFrame) {
    animateZoom();
  }
}

function animateZoom() {
  spinZoom += (targetZoom - spinZoom) * 0.22;

  drawSpinFrame(spinFrameIndex);

  if (Math.abs(targetZoom - spinZoom) > 0.001) {
    animationFrame = requestAnimationFrame(animateZoom);
  } else {
    spinZoom = targetZoom;
    animationFrame = null;
  }
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

  const source = getVisibleFrameBounds(frame);
  const frameRatio = source.width / source.height;

  const paddingX = Math.max(16, canvasWidth * 0.06);
  const paddingTop = Math.max(18, canvasHeight * 0.025);
  const paddingBottom = Math.max(10, canvasHeight * 0.012);
  const maxHeight = canvasHeight - paddingTop - paddingBottom;
  const maxWidth = canvasWidth - paddingX * 2;
  const maxDrawableHeight = Math.min(maxHeight, maxWidth / frameRatio);
  const baseHeight = maxDrawableHeight * 0.96;
  const targetHeight = Math.min(baseHeight * spinZoom, maxDrawableHeight);
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

  if (widget) {
    const widgetProgress = localProgress(local, 0.45, 1);

    widget.style.setProperty(
      '--widget-opacity',
      lerp(1, 0, widgetProgress)
    );

    widget.style.setProperty(
      '--widget-scale',
      lerp(1, 0.72, widgetProgress)
    );
  }
}
