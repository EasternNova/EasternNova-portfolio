/*
 * EasternNova — Living Resume floral layer
 * Reversible, isolated enhancement. Existing resume content and behavior remain intact.
 */

const STYLE_ID = "living-resume-3d-styles";
const LAYER_CLASS = "living-resume-floral";
const FEATURE_KEY = "EasternNovaLivingResumeFloral";

function loadStylesheet() {
    let link = document.getElementById(STYLE_ID);

    if (link) return Promise.resolve();

    link = document.createElement("link");
    link.id = STYLE_ID;
    link.rel = "stylesheet";
    link.href = new URL("./living-resume-3d.css", import.meta.url).href;

    return new Promise((resolve, reject) => {
        link.addEventListener("load", resolve, { once: true });
        link.addEventListener("error", () => {
            reject(new Error(`Could not load floral CSS: ${link.href}`));
        }, { once: true });
        document.head.appendChild(link);
    });
}

function getTheme() {
    return document.documentElement.dataset.resumeTheme === "dark"
        ? "dark"
        : "light";
}

function preloadThemeImage(theme) {
    const imagePath = theme === "dark"
        ? "./assets/floral-dark.png"
        : "./assets/floral-light.png";

    const imageUrl = new URL(imagePath, import.meta.url).href;

    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(imageUrl);
        image.onerror = () => reject(
            new Error(`Could not load floral image: ${imageUrl}`)
        );
        image.src = imageUrl;
    });
}

function addFloralLayer(hero) {
    let layer = hero.querySelector(`:scope > .${LAYER_CLASS}`);

    if (!layer) {
        layer = document.createElement("div");
        layer.className = LAYER_CLASS;
        layer.setAttribute("aria-hidden", "true");
        hero.prepend(layer);
    }

    return layer;
}

function enableDesktopParallax(hero, layer) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const smallScreen = window.matchMedia("(max-width: 800px)");

    if (reducedMotion.matches || smallScreen.matches) return () => {};

    let frame = 0;

    const handlePointerMove = (event) => {
        if (frame) cancelAnimationFrame(frame);

        frame = requestAnimationFrame(() => {
            const bounds = hero.getBoundingClientRect();
            if (!bounds.width || !bounds.height) return;

            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;

            layer.style.setProperty("--floral-shift-x", `${x * -4}px`);
            layer.style.setProperty("--floral-shift-y", `${y * -4}px`);
        });
    };

    const reset = () => {
        layer.style.setProperty("--floral-shift-x", "0px");
        layer.style.setProperty("--floral-shift-y", "0px");
    };

    hero.addEventListener("pointermove", handlePointerMove, { passive: true });
    hero.addEventListener("pointerleave", reset, { passive: true });

    return () => {
        hero.removeEventListener("pointermove", handlePointerMove);
        hero.removeEventListener("pointerleave", reset);
        if (frame) cancelAnimationFrame(frame);
    };
}

async function initLivingResumeFloral() {
    const hero = document.querySelector("#resume-home.resume-home, .resume-home");

    if (!hero) {
        console.error(
            "[Living Resume] Hero section not found. Expected #resume-home.resume-home or .resume-home."
        );
        return;
    }

    const layer = addFloralLayer(hero);

    try {
        await loadStylesheet();
        const imageUrl = await preloadThemeImage(getTheme());

        // Ensure a useful visible background even if another CSS rule overrides background-image.
        layer.style.backgroundImage = `url("${imageUrl}")`;

        const observer = new MutationObserver(async () => {
            try {
                const nextUrl = await preloadThemeImage(getTheme());
                layer.style.backgroundImage = `url("${nextUrl}")`;
            } catch (error) {
                console.error("[Living Resume] Theme image failed to load.", error);
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-resume-theme"]
        });

        const cleanupParallax = enableDesktopParallax(hero, layer);

        window[FEATURE_KEY] = {
            destroy() {
                observer.disconnect();
                cleanupParallax();
                layer.remove();
                document.getElementById(STYLE_ID)?.remove();
                delete window[FEATURE_KEY];
            }
        };

        console.info("[Living Resume] Floral feature loaded.", {
            hero,
            layer,
            theme: getTheme(),
            imageUrl
        });
    } catch (error) {
        layer.remove();
        console.error(
            "[Living Resume] Floral feature could not load. Check the folder and asset paths.",
            error
        );
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLivingResumeFloral, { once: true });
} else {
    initLivingResumeFloral();
}
