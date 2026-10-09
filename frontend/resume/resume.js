const RESUME_THEME_KEY = "easternnova-resume-theme";


function getStoredResumeTheme() {
    const stored = localStorage.getItem(RESUME_THEME_KEY);

    return stored === "dark" || stored === "light"
        ? stored
        : "light";
}


function applyResumeTheme(theme, persist = true) {
    const safeTheme =
        theme === "dark"
            ? "dark"
            : "light";

    document.documentElement.dataset.resumeTheme = safeTheme;

    if (persist) {
        localStorage.setItem(
            RESUME_THEME_KEY,
            safeTheme
        );
    }

    const button =
        document.querySelector("#resume-theme");

    if (!button) {
        return;
    }

    button.textContent =
        safeTheme === "dark"
            ? "◐"
            : "◑";

    button.setAttribute(
        "aria-label",
        safeTheme === "dark"
            ? "Switch to light theme"
            : "Switch to dark theme"
    );

    button.setAttribute(
        "aria-pressed",
        String(safeTheme === "dark")
    );
}


function initializeResumeTheme() {

    applyResumeTheme(
        getStoredResumeTheme(),
        false
    );

    const button =
        document.querySelector("#resume-theme");

    if (!button) {
        return;
    }

    button.addEventListener("click", () => {

        const current =
            document.documentElement
                .dataset
                .resumeTheme || "light";

        applyResumeTheme(
            current === "dark"
                ? "light"
                : "dark",
            true
        );

    });
}


/* =========================================================
   PORTFOLIO THEME BRIDGE
   ========================================================= */

window.addEventListener("message", (event) => {

    if (
        event.origin !==
        window.location.origin
    ) {
        return;
    }

    if (
        !event.data ||
        event.data.type !==
            "easternnova-portfolio-theme"
    ) {
        return;
    }

    if (
        event.data.theme !== "light" &&
        event.data.theme !== "dark"
    ) {
        return;
    }

    applyResumeTheme(
        event.data.theme,
        false
    );

});


/* =========================================================
   NAVIGATION
   ========================================================= */
function initializeResumeNavigation() {

    const frame =
        document.querySelector(
            "#resume-content-frame"
        );

    const links =
        document.querySelectorAll(
            ".resume-nav-link"
        );

    const sections =
        document.querySelectorAll(
            ".resume-section"
        );

    if (
        !links.length ||
        !sections.length
    ) {
        return;
    }


    function setActiveSection(sectionId) {

        links.forEach((link) => {

            const targetId =
                link.getAttribute("href");

            link.classList.toggle(
                "is-active",
                targetId === `#${sectionId}`
            );

        });

    }


    function getScrollTop() {

        return frame
            ? frame.scrollTop
            : window.scrollY;

    }


    function updateActiveSection() {

        const scrollTop =
            getScrollTop();

        const viewportHeight =
            frame
                ? frame.clientHeight
                : window.innerHeight;


        let activeSection =
            sections[0];


        let closestDistance =
            Infinity;


        sections.forEach((section) => {

            const sectionTop =
                section.offsetTop;

            const distance =
                Math.abs(
                    sectionTop -
                    scrollTop -
                    viewportHeight * 0.12
                );


            if (
                sectionTop <=
                    scrollTop +
                    viewportHeight * 0.35
                &&
                distance < closestDistance
            ) {

                closestDistance =
                    distance;

                activeSection =
                    section;

            }

        });


        setActiveSection(
            activeSection.id
        );

    }


    /* =====================================================
       NAVIGATION CLICK
       ===================================================== */

    links.forEach((link) => {

        link.addEventListener(
            "click",
            (event) => {

                const targetId =
                    link.getAttribute("href");

                if (
                    !targetId ||
                    !targetId.startsWith("#")
                ) {
                    return;
                }


                const target =
                    document.querySelector(
                        targetId
                    );


                if (!target) {
                    return;
                }


                event.preventDefault();


                if (frame) {

                    const targetTop =
                        target.offsetTop;


                    frame.scrollTo({
                        top: targetTop,
                        behavior: "smooth"
                    });

                } else {

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }


                /*
                 * Immediately update the underline.
                 * Do not wait for IntersectionObserver.
                 */

                setActiveSection(
                    target.id
                );

            }
        );

    });


    /* =====================================================
       SCROLL TRACKING
       ===================================================== */

    const scroller =
        frame || window;


    let ticking = false;


    function handleScroll() {

        if (ticking) {
            return;
        }


        ticking = true;


        requestAnimationFrame(() => {

            updateActiveSection();

            ticking = false;

        });

    }


    scroller.addEventListener(
        "scroll",
        handleScroll,
        {
            passive: true
        }
    );


    /* =====================================================
       INITIAL STATE
       ===================================================== */

    updateActiveSection();


    /*
     * Keep the existing responsive behaviour.
     */

    const mobile =
        window.matchMedia(
            "(max-width: 800px)"
        );


    mobile.addEventListener(
        "change",
        () => {
            window.location.reload();
        }
    );

}


/* =========================================================
   SCROLL PROGRESS
   ========================================================= */

function initializeScrollProgress() {

    const frame =
        document.querySelector(
            "#resume-content-frame"
        );

    const progress =
        document.querySelector(
            ".resume-scroll-progress"
        );

    if (!progress) {
        return;
    }


    function updateProgress() {

        const scrollTop =
            frame
                ? frame.scrollTop
                : window.scrollY;

        const maxScroll =
            frame
                ? frame.scrollHeight -
                  frame.clientHeight
                : document.documentElement
                      .scrollHeight -
                  window.innerHeight;

        const amount =
            maxScroll > 0
                ? scrollTop / maxScroll
                : 0;

        progress.style.transform =
            `scaleX(${Math.min(
                1,
                Math.max(0, amount)
            )})`;

    }


    const scroller =
        frame || window;


    scroller.addEventListener(
        "scroll",
        updateProgress,
        { passive: true }
    );


    updateProgress();

    requestAnimationFrame(
        updateProgress
    );

}


/* =========================================================
   OPENING NAME ANIMATION
   ========================================================= */

function initializeOpeningAnimation() {

    const page =
        document.querySelector(
            "#resume-page"
        );

    if (!page) {
        return;
    }

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            page.classList.add(
                "resume-ready"
            );

        });

    });

}


/* =========================================================
   STATUS TICKER
   ========================================================= */

function initializeStatusTicker() {

    const rail =
        document.querySelector(
            ".resume-status-rail"
        );

    const states =
        document.querySelectorAll(
            ".resume-status-state"
        );

    const frame =
        document.querySelector(
            "#resume-content-frame"
        );

    if (
        !rail ||
        states.length < 2
    ) {
        return;
    }


    states[0].textContent =
        "Resume '26 · Freelancer · Learning · Exploring";

    states[1].textContent =
        "Resume '26 · Open to Work";


    let isOpen = false;


    function getScrollTop() {

        return frame
            ? frame.scrollTop
            : window.scrollY;

    }


    function updateStatus() {

        const shouldOpen =
            getScrollTop() > 24;

        if (
            shouldOpen === isOpen
        ) {
            return;
        }

        isOpen = shouldOpen;

        rail.classList.toggle(
            "is-open",
            isOpen
        );

    }


    const scroller =
        frame || window;


    scroller.addEventListener(
        "scroll",
        updateStatus,
        { passive: true }
    );


    updateStatus();

}


/* =========================================================
   INVERSE SECTIONS
   ========================================================= */

function initializeInverseSections() {

    const achievements =
        document.querySelector(
            ".resume-achievements"
        );

    const finalDownload =
        document.querySelector(
            ".resume-final-download"
        );


    function updateInverseTheme() {

        const theme =
            document.documentElement
                .dataset
                .resumeTheme || "light";

        const inverse =
            theme === "dark"
                ? "light"
                : "dark";


        if (achievements) {

            achievements.dataset.inverseTheme =
                inverse;

        }


        if (finalDownload) {

            finalDownload.dataset.inverseTheme =
                inverse;

        }

    }


    updateInverseTheme();


    const observer =
        new MutationObserver(
            updateInverseTheme
        );


    observer.observe(
        document.documentElement,
        {
            attributes: true,
            attributeFilter: [
                "data-resume-theme"
            ]
        }
    );

}


/* =========================================================
   FLOATING REVEALS
   ========================================================= */

function initializeRevealAnimations() {

    const targets =
        document.querySelectorAll(
            [
                ".resume-content-block",
                ".resume-side-block",
                ".resume-experience-item",
                ".resume-project-item",
                ".resume-capability-grid article",
                ".resume-impact-block",
                ".resume-achievement-grid article",
                ".resume-contact-copy",
                ".resume-contact-links",
                ".resume-final-download-wrap"
            ].join(",")
        );


    if (!targets.length) {
        return;
    }


    targets.forEach((element) => {
        element.classList.add(
            "resume-reveal"
        );
    });


    if (
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    ) {
        targets.forEach((element) => {
            element.classList.add(
                "is-visible"
            );
        });

        return;
    }


    const frame =
        document.querySelector(
            "#resume-content-frame"
        );


    const observer =
        new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add(
                        "is-visible"
                    );

                    observer.unobserve(
                        entry.target
                    );

                });

            },
            {
                root:
                    frame ||
                    null,

                threshold: 0.08
            }
        );


    targets.forEach((element) => {
        observer.observe(element);
    });

}


/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeResume() {
    initializeResumeTheme();
    initializeResumeDownloads();
    initializeResumeNavigation();
    initializeScrollProgress();
    initializeOpeningAnimation();
    initializeStatusTicker();
    initializeInverseSections();
    initializeMobileNavigation();
}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeResume
    );

} else {

    initializeResume();

}
function initializeResumeDownloads() {
    const downloads = document.querySelectorAll(
        ".resume-download, .resume-contact-download"
    );

    if (!downloads.length) {
        return;
    }

    function updateDownloads() {
        const theme =
            document.documentElement.dataset.resumeTheme || "light";

        const file =
            theme === "dark"
                ? "./Rassets/PrachiShawResumeDark.pdf"
                : "./Rassets/PrachiShawResumeLight.pdf";

        const filename =
            theme === "dark"
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

function initializeMobileNavigation() {
    const navigation = document.querySelector(".resume-navigation");
    const button = document.querySelector("#resume-mobile-menu");
    const links = document.querySelectorAll(".resume-nav-link");

    if (!navigation || !button) {
        return;
    }

    function closeMenu() {
        navigation.classList.remove("is-menu-open");
        button.textContent = "=";
        button.setAttribute("aria-label", "Open resume navigation");
        button.setAttribute("aria-expanded", "false");
    }

    function toggleMenu() {
        const isOpen =
            navigation.classList.toggle("is-menu-open");

        button.textContent = isOpen ? ">" : "=";

        button.setAttribute(
            "aria-label",
            isOpen
                ? "Close resume navigation"
                : "Open resume navigation"
        );

        button.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    }

    button.addEventListener("click", toggleMenu);

    links.forEach((link) => {
        link.addEventListener("click", () => {
            closeMenu();
        });
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 700) {
            closeMenu();
        }
    });
}