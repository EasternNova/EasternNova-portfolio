/* EasternNova Portfolio
   Application Entry Point */

import { initializeBackground } from "./background.js";
import { initializeCursor } from "./cursor.js";
import { initializeProjects } from "./projects.js";


/* Theme */

const THEME_STORAGE_KEY = "easternnova-theme";


function getSystemTheme() {
    return window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches
        ? "dark"
        : "light";
}


function getInitialTheme() {
    const savedTheme =
        localStorage.getItem(THEME_STORAGE_KEY);

    if (
        savedTheme === "light" ||
        savedTheme === "dark"
    ) {
        return savedTheme;
    }

    return getSystemTheme();
}


function applyTheme(theme) {

    document.documentElement.dataset.theme =
        theme;

    const toggle =
        document.querySelector("#theme-toggle");

    if (!toggle) {
        return;
    }

    const isDark =
        theme === "dark";

    toggle.setAttribute(
        "aria-pressed",
        String(isDark)
    );

    toggle.setAttribute(
        "aria-label",
        isDark
            ? "Switch to light theme"
            : "Switch to dark theme"
    );

    const icon =
        toggle.querySelector(
            ".theme-toggle-icon"
        );

    if (icon) {
        icon.textContent =
            isDark ? "🌚" : "🌞";
    }
}


function initializeTheme() {

    const initialTheme =
        getInitialTheme();

    applyTheme(initialTheme);

    const toggle =
        document.querySelector("#theme-toggle");

    if (!toggle) {
        return;
    }

    toggle.addEventListener(
        "click",
        () => {

            const currentTheme =
                document.documentElement
                    .dataset
                    .theme;

            const nextTheme =
                currentTheme === "dark"
                    ? "light"
                    : "dark";

            applyTheme(nextTheme);

            localStorage.setItem(
                THEME_STORAGE_KEY,
                nextTheme
            );
        }
    );
}


/* Loader */

function initializeLoader() {

    const loader =
        document.querySelector("#app-loader");

    if (!loader) {
        return;
    }

    requestAnimationFrame(() => {

        loader.classList.add(
            "is-hidden"
        );

    });
}


/* Current Year */

function initializeCurrentYear() {

    const yearElement =
        document.querySelector(
            "#current-year"
        );

    if (!yearElement) {
        return;
    }

    yearElement.textContent =
        new Date().getFullYear();
}

function initializeResumePanel() {
    const resumeButton =
        document.querySelector("#resume-button");

    const resumePanel =
        document.querySelector("#resume-panel");

    const resumeWindow =
        document.querySelector(".resume-window");

    const resumeLinks =
        document.querySelectorAll(".resume-nav-link");

    if (!resumeButton || !resumePanel || !resumeWindow) {
        return;
    }


    function openResume() {
        resumePanel.classList.add("is-open");

        resumePanel.setAttribute(
            "aria-hidden",
            "false"
        );
    }


    function closeResume() {
        resumePanel.classList.remove("is-open");

        resumePanel.setAttribute(
            "aria-hidden",
            "true"
        );
    }


    resumeButton.addEventListener(
        "click",
        openResume
    );


    /* Click outside resume window */

    resumePanel.addEventListener(
        "click",
        (event) => {

            if (
                !resumeWindow.contains(
                    event.target
                )
            ) {
                closeResume();
            }

        }
    );


    /* Escape */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                resumePanel.classList.contains(
                    "is-open"
                )
            ) {
                closeResume();
            }

        }
    );


    /* Resume navigation */

    const resumeTheme =
    document.querySelector("#resume-theme");

    if (resumeTheme) {
        resumeTheme.addEventListener("click", () => {
            const current =
                document.documentElement.dataset.theme;

            const next =
                current === "dark"
                    ? "light"
                    : "dark";

            document.documentElement.dataset.theme = next;

            localStorage.setItem(
                THEME_STORAGE_KEY,
                next
            );
        });
    }

    const contentFrame =
        resumePanel.querySelector(".resume-content-frame");

    resumeLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();

            const target =
                link.dataset.resumeView;

            const targetView =
                resumePanel.querySelector(
                    `[data-resume-section="${target}"]`
                );

            if (!targetView || !contentFrame) {
                return;
            }

            targetView.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });
}

/* Application */

function initializeApp() {

    initializeTheme();

    initializeBackground();

    initializeCursor();

    initializeCurrentYear();

    initializeLoader();

    initializeProjects();

    initializeResumePanel()
}


/* Start */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);