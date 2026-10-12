const RESUME_THEME_KEY = "easternnova-resume-theme";
const THEME_MESSAGE_TYPE = "easternnova-portfolio-theme";

const SELECTORS = {
    page: "#resume-page",
    frame: "#resume-content-frame",
    themeButton: "#resume-theme",
    nav: ".resume-navigation",
    navLinks: ".resume-nav-link",
    mobileMenu: "#resume-mobile-menu",
    sections: ".resume-section",
    progress: ".resume-scroll-progress",
    statusRail: ".resume-status-rail",
    statusStates: ".resume-status-state",
    nameLines: ".resume-name-line",
    taglinePhrases: ".resume-home-role > span",
};

/* =========================================================
   Theme
   ========================================================= */

function getStoredResumeTheme() {
    try {
        const storedTheme = localStorage.getItem(RESUME_THEME_KEY);
        return storedTheme === "dark" || storedTheme === "light"
            ? storedTheme
            : "light";
    } catch {
        return "light";
    }
}

function applyResumeTheme(theme, persist = true) {
    const safeTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.resumeTheme = safeTheme;

    if (persist) {
        try {
            localStorage.setItem(RESUME_THEME_KEY, safeTheme);
        } catch {
            // The theme still works when storage is unavailable.
        }
    }

    const button = document.querySelector(SELECTORS.themeButton);
    if (!button) return;

    button.textContent = safeTheme === "dark" ? "◐" : "◑";
    button.setAttribute(
        "aria-label",
        safeTheme === "dark" ? "Switch to light theme" : "Switch to dark theme",
    );
    button.setAttribute("aria-pressed", String(safeTheme === "dark"));
}

function initializeResumeTheme() {
    applyResumeTheme(getStoredResumeTheme(), false);

    const button = document.querySelector(SELECTORS.themeButton);
    button?.addEventListener("click", () => {
        const currentTheme =
            document.documentElement.dataset.resumeTheme || "light";

        applyResumeTheme(currentTheme === "dark" ? "light" : "dark");
    });

    window.addEventListener("message", (event) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type !== THEME_MESSAGE_TYPE) return;
        if (!["light", "dark"].includes(event.data.theme)) return;

        applyResumeTheme(event.data.theme, false);
    });
}

/* =========================================================
   Downloads
   ========================================================= */

function initializeResumeDownloads() {
    const downloadLinks = document.querySelectorAll(
        ".resume-download, .resume-contact-download",
    );

    if (!downloadLinks.length) return;

    function updateDownloadLinks() {
        const theme = document.documentElement.dataset.resumeTheme || "light";
        const isDark = theme === "dark";
        const file = isDark
            ? "./Rassets/PrachiShawResumeDark.pdf"
            : "./Rassets/PrachiShawResumeLight.pdf";
        const filename = isDark
            ? "PrachiShawResumeDark.pdf"
            : "PrachiShawResumeLight.pdf";

        downloadLinks.forEach((link) => {
            link.href = file;
            link.download = filename;
        });
    }

    updateDownloadLinks();

    const observer = new MutationObserver(updateDownloadLinks);
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-resume-theme"],
    });
}

/* =========================================================
   Navigation and mobile menu
   ========================================================= */


function initializeResumeNavigation() {
    const frame = document.querySelector(SELECTORS.frame);
    const links = [...document.querySelectorAll(SELECTORS.navLinks)];
    const sections = [...document.querySelectorAll(SELECTORS.sections)];

    if (!links.length || !sections.length) return;

    function setActiveSection(sectionId) {
        const matchingLink = links.find(
            (link) => link.getAttribute("href") === `#${sectionId}`,
        );

        // Some content sections intentionally have no top-level nav link.
        if (!matchingLink) return;

        links.forEach((link) => {
            link.classList.toggle("is-active", link === matchingLink);
        });
    }

    function updateActiveSection() {
        const frameTop = frame?.getBoundingClientRect().top ?? 0;
        const activationLine =
            frameTop + (frame?.clientHeight ?? window.innerHeight) * 0.28;

        let currentSection = null;
        let closestDistance = Number.POSITIVE_INFINITY;

        sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            if (rect.top > activationLine) return;

            const distance = Math.abs(activationLine - rect.top);

            if (distance < closestDistance) {
                closestDistance = distance;
                currentSection = section;
            }
        });

        if (currentSection) setActiveSection(currentSection.id);
    }

    links.forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");
            if (!targetId?.startsWith("#")) return;

            const target = document.querySelector(targetId);
            if (!target) return;

            event.preventDefault();

            if (frame) {
                const frameRect = frame.getBoundingClientRect();
                const targetRect = target.getBoundingClientRect();

                const targetTop =
                    frame.scrollTop + targetRect.top - frameRect.top;

                const isHome = target.id === "resume-home";
                const navigationOffset = isHome ? 0 : 32;

                frame.scrollTo({
                    top: Math.max(0, targetTop - navigationOffset),
                    behavior: "smooth",
                });
            } else {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }

            setActiveSection(target.id);
        });
    });

    const scroller = frame || window;
    let frameRequested = false;

    scroller.addEventListener(
        "scroll",
        () => {
            if (frameRequested) return;
            frameRequested = true;

            requestAnimationFrame(() => {
                updateActiveSection();
                frameRequested = false;
            });
        },
        { passive: true },
    );

    window.addEventListener("resize", updateActiveSection, {
        passive: true,
    });

    updateActiveSection();
}

function initializeMobileNavigation() {
    const navigation = document.querySelector(SELECTORS.nav);
    const button = document.querySelector(SELECTORS.mobileMenu);
    const links = document.querySelectorAll(SELECTORS.navLinks);

    if (!navigation || !button) return;

    function closeMenu() {
        navigation.classList.remove("is-menu-open");
        button.textContent = "=";
        button.setAttribute("aria-label", "Open resume navigation");
        button.setAttribute("aria-expanded", "false");
    }

    button.addEventListener("click", () => {
        const isOpen = navigation.classList.toggle("is-menu-open");

        button.textContent = isOpen ? ">" : "=";
        button.setAttribute(
            "aria-label",
            isOpen ? "Close resume navigation" : "Open resume navigation",
        );
        button.setAttribute("aria-expanded", String(isOpen));
    });

    links.forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });

    window.addEventListener(
        "resize",
        () => {
            if (window.innerWidth > 700) closeMenu();
        },
        { passive: true },
    );
}

/* =========================================================
   Scroll progress
   ========================================================= */

function initializeScrollProgress() {
    const frame = document.querySelector(SELECTORS.frame);
    const progress = document.querySelector(SELECTORS.progress);

    if (!progress) return;

    function updateProgress() {
        const scrollTop = frame ? frame.scrollTop : window.scrollY;
        const maxScroll = frame
            ? frame.scrollHeight - frame.clientHeight
            : document.documentElement.scrollHeight - window.innerHeight;

        const amount =
            maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;

        progress.style.transform = `scaleX(${amount})`;
    }

    (frame || window).addEventListener("scroll", updateProgress, {
        passive: true,
    });
    window.addEventListener("resize", updateProgress, { passive: true });

    updateProgress();
    requestAnimationFrame(updateProgress);
}

/* =========================================================
   Entrance animation preparation
   ========================================================= */

function initializeNameCharacterReveal() {
    let characterIndex = 0;

    document.querySelectorAll(SELECTORS.nameLines).forEach((line) => {
        line
            .querySelectorAll(":scope > span:not(.resume-name-exclamation)")
            .forEach((character) => {
                character.style.setProperty(
                    "--name-char-index",
                    characterIndex,
                );
                characterIndex += 1;
            });
    });
}

function initializeTaglineReveal() {
    document.querySelectorAll(SELECTORS.taglinePhrases).forEach((phrase, index) => {
        phrase.style.setProperty("--role-index", index);
    });
}

function initializeStatusCharacterReveal() {
    document.querySelectorAll(SELECTORS.statusStates).forEach((state) => {
        if (state.dataset.charactersPrepared === "true") return;

        const originalText = state.textContent.trim();
        const fragment = document.createDocumentFragment();

        [...originalText].forEach((character, index) => {
            const span = document.createElement("span");
            span.textContent = character === " " ? "\u00A0" : character;
            span.style.setProperty("--char-index", index);
            span.setAttribute("aria-hidden", "true");
            fragment.appendChild(span);
        });

        state.replaceChildren(fragment);
        state.setAttribute("aria-label", originalText);
        state.dataset.charactersPrepared = "true";
    });
}

function initializeOpeningAnimation() {
    const page = document.querySelector(SELECTORS.page);
    if (!page) return;

    initializeNameCharacterReveal();

    requestAnimationFrame(() => {
        page.classList.add("resume-ready");
    });
}

/* =========================================================
   Status rail
   ========================================================= */

function initializeStatusTicker() {
    const rail = document.querySelector(SELECTORS.statusRail);
    const states = document.querySelectorAll(SELECTORS.statusStates);
    const frame = document.querySelector(SELECTORS.frame);

    if (!rail || states.length < 2) return;

    function updateStatus() {
        const scrollTop = frame ? frame.scrollTop : window.scrollY;
        rail.classList.toggle("is-open", scrollTop > 24);
    }

    (frame || window).addEventListener("scroll", updateStatus, {
        passive: true,
    });
    updateStatus();
}

/* =========================================================
   Scroll reveal
   ========================================================= */

function initializeScrollReveal() {
    const selectors = [
        ".resume-section:not(.resume-home) .resume-page-content > h2",
        ".resume-section:not(.resume-home) .resume-about-column-title",
        ".resume-section:not(.resume-home) .resume-content-block",
        ".resume-section:not(.resume-home) .resume-side-block",
        ".resume-section:not(.resume-home) .resume-experience-item",
        ".resume-section:not(.resume-home) .resume-capability",
        ".resume-section:not(.resume-home) .resume-domain-list > li",
        ".resume-section:not(.resume-home) .resume-impact-item",
        ".resume-section:not(.resume-home) .resume-achievement",
        ".resume-section:not(.resume-home) .resume-award",
        ".resume-section:not(.resume-home) .resume-contact-heading",
        ".resume-section:not(.resume-home) .resume-contact-bottom",
    ];

    const targets = document.querySelectorAll(selectors.join(","));
    if (!targets.length) return;

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) return;

    const frame = document.querySelector(SELECTORS.frame);
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("is-scroll-visible");
                observer.unobserve(entry.target);
            });
        },
        {
            root: frame || null,
            threshold: 0.08,
            rootMargin: "0px 0px -4% 0px",
        },
    );

    targets.forEach((element) => {
        element.classList.add("resume-scroll-reveal");
        observer.observe(element);
    });
}

/* =========================================================
   Initialize once
   ========================================================= */

function initializeResume() {
    initializeResumeTheme();
    initializeResumeDownloads();
    initializeResumeNavigation();
    initializeMobileNavigation();
    initializeScrollProgress();
    initializeStatusCharacterReveal();
    initializeOpeningAnimation();
    initializeStatusTicker();
    initializeScrollReveal();
    initializeTaglineReveal();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeResume, {
        once: true,
    });
} else {
    initializeResume();
}
