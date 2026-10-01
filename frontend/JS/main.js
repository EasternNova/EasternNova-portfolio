/* =========================================================
   EasternNova Portfolio
   Application Entry Point
   ========================================================= */

import { initializeBackground } from "./background.js";
import { initializeCursor } from "./cursor.js";


function initializeApp() {
    initializeBackground();
    initializeCursor();

    const yearElement = document.querySelector("#current-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}


document.addEventListener("DOMContentLoaded", initializeApp);