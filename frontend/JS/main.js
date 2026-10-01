/* EasternNova Portfolio
   Application Entry Point */

import { initializeBackground } from "./background.js";
import { initializeCursor } from "./cursor.js";


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
            isDark ? "☼" : "◐";
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


/* Application */

function initializeApp() {

    initializeTheme();

    initializeBackground();

    initializeCursor();

    initializeCurrentYear();

    initializeLoader();
}


/* Start */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);