
const FRAME_COUNT = 98;

const FRAME_DIRECTORY = new URL(
    "./about-assets/AVATAR_360_FRAME/",
    import.meta.url
);

function createAvatar(canvas, status) {
    const context = canvas.getContext("2d");

    if (!context) {
        status.textContent = "Canvas is not supported by this browser.";
        return;
    }

    const frames = new Array(FRAME_COUNT);
    const loading = new Map();

    let frameIndex = 0;
    let destroyed = false;
    let dragging = false;
    let dragStartX = 0;
    let dragStartFrame = 0;
    let animationId = 0;
    let lastTime = 0;
    let idleTime = 0;
    let resizeObserver;

    const pixelsPerFrame = 8.5;
    const idleFrameInterval = 125;
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    function urlFor(index) {
        const safeIndex =
            ((index % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT;

        const filename =
            `frame_${String(safeIndex).padStart(3, "0")}.png`;

        return new URL(filename, FRAME_DIRECTORY).href;
    }

    function loadFrame(index) {
        index = ((index % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT;

        if (frames[index]) {
            return Promise.resolve(frames[index]);
        }

        if (loading.has(index)) {
            return loading.get(index);
        }

        const promise = new Promise((resolve) => {
            const image = new Image();

            image.onload = () => {
                frames[index] = image;
                resolve(image);
            };

            image.onerror = () => {
                console.error(
                    "[About Avatar] Failed to load:",
                    urlFor(index)
                );
                resolve(null);
            };

            image.src = urlFor(index);
        }).finally(() => {
            loading.delete(index);
        });

        loading.set(index, promise);
        return promise;
    }

    function draw() {
        if (destroyed) return;

        const rect = canvas.getBoundingClientRect();

        if (!rect.width || !rect.height) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.round(rect.width * dpr);
        const height = Math.round(rect.height * dpr);

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }

        context.clearRect(0, 0, width, height);

        const image = frames[frameIndex];

        if (!image) return;

        const scale = Math.min(
            width / image.naturalWidth,
            height / image.naturalHeight
        );

        const drawWidth = image.naturalWidth * scale;
        const drawHeight = image.naturalHeight * scale;

        context.drawImage(
            image,
            (width - drawWidth) / 2,
            (height - drawHeight) / 2,
            drawWidth,
            drawHeight
        );
    }

    function showFrame(index) {
        frameIndex = ((index % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT;

        draw();

        loadFrame(frameIndex).then((image) => {
            if (image && !destroyed) draw();
        });

        loadFrame(frameIndex + 1);
        loadFrame(frameIndex - 1);
    }

    function onPointerDown(event) {
        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }

        dragging = true;
        dragStartX = event.clientX;
        dragStartFrame = frameIndex;

        canvas.classList.add("is-dragging");
        canvas.setPointerCapture(event.pointerId);
    }

    function onPointerMove(event) {
        if (!dragging) return;

        const distance = event.clientX - dragStartX;

        showFrame(
            dragStartFrame - Math.round(distance / pixelsPerFrame)
        );
    }

    function stopDragging() {
        dragging = false;
        canvas.classList.remove("is-dragging");
    }

    function animate(time) {
        if (destroyed) return;

        const delta = lastTime
            ? Math.min(time - lastTime, 50)
            : 0;

        lastTime = time;

        if (
            !dragging &&
            !reducedMotion.matches &&
            !document.hidden
        ) {
            idleTime += delta;

            if (idleTime >= idleFrameInterval) {
                idleTime = 0;
                showFrame(frameIndex + 1);
            }
        }

        animationId = requestAnimationFrame(animate);
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", stopDragging);
    canvas.addEventListener("pointercancel", stopDragging);
    canvas.addEventListener("lostpointercapture", stopDragging);

    resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(canvas);

    status.textContent = "Loading first avatar frame…";

    loadFrame(0).then((image) => {
        if (destroyed) return;

        if (!image) {
            status.textContent =
                "Could not load frame_000.png. Check the image URL in Network.";
            return;
        }

        showFrame(0);
        status.textContent = "Drag horizontally to rotate";

        // Load the remaining frames progressively.
        let nextIndex = 1;

        function preloadNext() {
            if (destroyed || nextIndex >= FRAME_COUNT) return;

            const current = nextIndex++;

            loadFrame(current).finally(() => {
                if (destroyed) return;

                if ("requestIdleCallback" in window) {
                    window.requestIdleCallback(preloadNext, {
                        timeout: 300
                    });
                } else {
                    window.setTimeout(preloadNext, 20);
                }
            });
        }

        preloadNext();
    });

    animationId = requestAnimationFrame(animate);

    return function destroyAvatar() {
        destroyed = true;

        cancelAnimationFrame(animationId);
        resizeObserver.disconnect();

        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", stopDragging);
        canvas.removeEventListener("pointercancel", stopDragging);
        canvas.removeEventListener("lostpointercapture", stopDragging);

        loading.clear();
    };
}

export function initializeAboutAvatarTest() {
    const root = document.querySelector("[data-about-avatar]");

    if (!root) {
        console.error("[About Avatar] Container not found.");
        return;
    }

    const canvas = root.querySelector("[data-about-avatar-canvas]");
    const status = root.querySelector("[data-about-avatar-status]");

    if (!canvas || !status) {
        console.error("[About Avatar] Canvas or status element not found.");
        return;
    }

    if (canvas.dataset.initialized === "true") return;

    canvas.dataset.initialized = "true";
    createAvatar(canvas, status);
}
