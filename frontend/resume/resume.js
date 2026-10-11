const RESUME_THEME_KEY = "easternnova-resume-theme";

/* Theme management */
function getStoredResumeTheme() {
    const stored = localStorage.getItem(RESUME_THEME_KEY);
    return stored === "dark" || stored === "light" ? stored : "light";
}

function applyResumeTheme(theme, persist = true) {
    const safeTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.resumeTheme = safeTheme;

    if (persist) {
        localStorage.setItem(RESUME_THEME_KEY, safeTheme);
    }

    const button = document.querySelector("#resume-theme");
    if (!button) return;

    button.textContent = safeTheme === "dark" ? "◐" : "◑";
    button.setAttribute("aria-label", safeTheme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    button.setAttribute("aria-pressed", String(safeTheme === "dark"));
}

function initializeResumeTheme() {
    applyResumeTheme(getStoredResumeTheme(), false);

    const button = document.querySelector("#resume-theme");
    if (!button) return;

    button.addEventListener("click", () => {
        const current = document.documentElement.dataset.resumeTheme || "light";
        applyResumeTheme(current === "dark" ? "light" : "dark");
    });
}

window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    if (!event.data || event.data.type !== "easternnova-portfolio-theme") return;
    if (event.data.theme !== "light" && event.data.theme !== "dark") return;

    applyResumeTheme(event.data.theme, false);
});

/* Navigation and active section */
function initializeResumeNavigation() {
    const frame = document.querySelector("#resume-content-frame");
    const links = document.querySelectorAll(".resume-nav-link");
    const sections = document.querySelectorAll(".resume-section");

    if (!links.length || !sections.length) return;

    function setActiveSection(sectionId) {
        links.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${sectionId}`);
        });
    }

    function updateActiveSection() {
        const scrollTop = frame ? frame.scrollTop : window.scrollY;
        const viewportHeight = frame ? frame.clientHeight : window.innerHeight;
        let activeSection = sections[0];
        let closestDistance = Infinity;

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const distance = Math.abs(sectionTop - scrollTop - viewportHeight * 0.12);

            if (sectionTop <= scrollTop + viewportHeight * 0.35 && distance < closestDistance) {
                closestDistance = distance;
                activeSection = section;
            }
        });

        setActiveSection(activeSection.id);
    }

    links.forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");
            if (!targetId || !targetId.startsWith("#")) return;

            const target = document.querySelector(targetId);
            if (!target) return;

            event.preventDefault();

            if (frame) {
                frame.scrollTo({ top: target.offsetTop, behavior: "smooth" });
            } else {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }

            setActiveSection(target.id);
        });
    });

    const scroller = frame || window;
    let ticking = false;

    scroller.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;

        requestAnimationFrame(() => {
            updateActiveSection();
            ticking = false;
        });
    }, { passive: true });

    updateActiveSection();

    window.matchMedia("(max-width: 800px)").addEventListener("change", () => {
        window.location.reload();
    });
}

/* Scroll progress indicator */
function initializeScrollProgress() {
    const frame = document.querySelector("#resume-content-frame");
    const progress = document.querySelector(".resume-scroll-progress");

    if (!progress) return;

    function updateProgress() {
        const scrollTop = frame ? frame.scrollTop : window.scrollY;
        const maxScroll = frame
            ? frame.scrollHeight - frame.clientHeight
            : document.documentElement.scrollHeight - window.innerHeight;
        const amount = maxScroll > 0 ? scrollTop / maxScroll : 0;

        progress.style.transform = `scaleX(${Math.min(1, Math.max(0, amount))})`;
    }

    (frame || window).addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    requestAnimationFrame(updateProgress);
}
/* Prepare the name for letter-by-letter animation */
function initializeNameCharacterReveal() {
    const nameLines = document.querySelectorAll(
        ".resume-name-line"
    );

    let characterIndex = 0;

    nameLines.forEach((line) => {
        line.querySelectorAll(
            ":scope > span:not(.resume-name-exclamation)"
        ).forEach((character) => {
            character.style.setProperty(
                "--name-char-index",
                characterIndex
            );

            characterIndex++;
        });
    });
}

/* Prepare tagline phrases for staggered entrance */
function initializeTaglineReveal() {
    document.querySelectorAll(".resume-home-role > span").forEach((phrase, index) => {
        phrase.style.setProperty("--role-index", index);
    });
}

/* Home entrance sequence */
function initializeOpeningAnimation() {
    const page = document.querySelector("#resume-page");

    if (!page) {
        return;
    }

    initializeNameCharacterReveal();

    requestAnimationFrame(() => {
        page.classList.add("resume-ready");
    });
}

/* Status ticker */
function initializeStatusTicker() {
    const rail = document.querySelector(".resume-status-rail");
    const states = document.querySelectorAll(".resume-status-state");
    const frame = document.querySelector("#resume-content-frame");

    if (!rail || states.length < 2) return;

    let isOpen = false;

    function updateStatus() {
        const shouldOpen = (frame ? frame.scrollTop : window.scrollY) > 24;
        if (shouldOpen === isOpen) return;

        isOpen = shouldOpen;
        rail.classList.toggle("is-open", isOpen);
    }

    (frame || window).addEventListener("scroll", updateStatus, { passive: true });
    updateStatus();
}

/* Inverse theme sections */
function initializeInverseSections() {
    const achievements = document.querySelector(".resume-achievements");
    const finalDownload = document.querySelector(".resume-final-download");

    function updateInverseTheme() {
        const theme = document.documentElement.dataset.resumeTheme || "light";
        const inverse = theme === "dark" ? "light" : "dark";

        if (achievements) achievements.dataset.inverseTheme = inverse;
        if (finalDownload) finalDownload.dataset.inverseTheme = inverse;
    }

    updateInverseTheme();

    const observer = new MutationObserver(updateInverseTheme);
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-resume-theme"]
    });
}

/* Theme-aware resume downloads */
function initializeResumeDownloads() {
    const downloads = document.querySelectorAll(".resume-download, .resume-contact-download");
    if (!downloads.length) return;

    function updateDownloads() {
        const theme = document.documentElement.dataset.resumeTheme || "light";
        const file = theme === "dark"
            ? "./Rassets/PrachiShawResumeDark.pdf"
            : "./Rassets/PrachiShawResumeLight.pdf";
        const filename = theme === "dark"
            ? "PrachiShawResumeDark.pdf"
            : "PrachiShawResumeLight.pdf";

        downloads.forEach((download) => {
            download.href = file;
            download.download = filename;
        });
    }

    updateDownloads();

    const observer = new MutationObserver(updateDownloads);
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-resume-theme"]
    });
}

/* Mobile navigation */
function initializeMobileNavigation() {
    const navigation = document.querySelector(".resume-navigation");
    const button = document.querySelector("#resume-mobile-menu");
    const links = document.querySelectorAll(".resume-nav-link");

    if (!navigation || !button) return;

    function closeMenu() {
        navigation.classList.remove("is-menu-open");
        button.textContent = "=";
        button.setAttribute("aria-label", "Open resume navigation");
        button.setAttribute("aria-expanded", "false");
    }

    function toggleMenu() {
        const isOpen = navigation.classList.toggle("is-menu-open");
        button.textContent = isOpen ? ">" : "=";
        button.setAttribute("aria-label", isOpen ? "Close resume navigation" : "Open resume navigation");
        button.setAttribute("aria-expanded", String(isOpen));
    }

    button.addEventListener("click", toggleMenu);
    links.forEach((link) => link.addEventListener("click", closeMenu));

    window.addEventListener("resize", () => {
        if (window.innerWidth > 700) closeMenu();
    });
}

/* Prepare status text for the existing Home animation */
function initializeStatusCharacterReveal() {
    document.querySelectorAll(".resume-status-state").forEach((state) => {
        if (state.dataset.charactersPrepared === "true") return;

        const text = state.textContent;
        const fragment = document.createDocumentFragment();

        [...text].forEach((character, index) => {
            const span = document.createElement("span");
            span.textContent = character === " " ? "\u00A0" : character;
            span.style.setProperty("--char-index", index);
            span.setAttribute("aria-hidden", "true");
            fragment.appendChild(span);
        });

        state.textContent = "";
        state.appendChild(fragment);
        state.setAttribute("aria-label", text.trim());
        state.dataset.charactersPrepared = "true";
    });
}

/* Stage 6: reveal content blocks as they enter the viewport */
function initializeScrollReveal() {
    const targets = document.querySelectorAll([
        ".resume-section:not(.resume-home) .resume-page-content > h2",
        ".resume-section:not(.resume-home) .resume-content-block",
        ".resume-section:not(.resume-home) .resume-side-block",
        ".resume-section:not(.resume-home) .resume-experience-item",
        ".resume-section:not(.resume-home) .resume-project-item",
        ".resume-section:not(.resume-home) .resume-capability-grid article",
        ".resume-section:not(.resume-home) .resume-education-item",
        ".resume-section:not(.resume-home) .resume-skill-group",
        ".resume-section:not(.resume-home) .resume-achievement-grid article",
        ".resume-section:not(.resume-home) .resume-impact-list > div",
        ".resume-section:not(.resume-home) .resume-impact-block",
        ".resume-section:not(.resume-home) .resume-contact-layout",
        ".resume-section:not(.resume-home) .resume-contact-copy",
        ".resume-section:not(.resume-home) .resume-contact-links",
        ".resume-section:not(.resume-home) .resume-final-download-wrap"
    ].join(","));

    if (!targets.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
        targets.forEach((element) => element.classList.add("is-scroll-visible"));
        return;
    }

    const frame = document.querySelector("#resume-content-frame");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add("is-scroll-visible");
            observer.unobserve(entry.target);
        });
    }, {
        root: frame || null,
        threshold: 0.08,
        rootMargin: "0px 0px -4% 0px"
    });

    targets.forEach((element) => {
        element.classList.add("resume-scroll-reveal");
        observer.observe(element);
    });
}

/* Initialize resume features once */
function initializeResume() {
    initializeResumeTheme();
    initializeResumeDownloads();
    initializeResumeNavigation();
    initializeScrollProgress();
    initializeStatusCharacterReveal();
    initializeNameCharacterReveal()
    initializeOpeningAnimation();
    initializeStatusTicker();
    initializeInverseSections();
    initializeMobileNavigation();
    initializeScrollReveal();
    initializeTaglineReveal();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeResume);
} else {
    initializeResume();
}
