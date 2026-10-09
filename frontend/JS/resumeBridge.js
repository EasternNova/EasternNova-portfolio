async function initializeResumeBridge() {
    const button = document.querySelector("#resume-button");

    if (!button || document.documentElement.dataset.resumeBridgeReady === "true") {
        return;
    }

    document.documentElement.dataset.resumeBridgeReady = "true";

    const stylesheetId = "resume-panel-stylesheet";

    if (!document.getElementById(stylesheetId)) {
        const stylesheet = document.createElement("link");
        stylesheet.id = stylesheetId;
        stylesheet.rel = "stylesheet";
        stylesheet.href = "/resume/resume-panel.css";
        document.head.appendChild(stylesheet);
    }

    let panel;

    try {
        const response = await fetch("/resume/resume-panel.html");

        if (!response.ok) {
            throw new Error(`Resume panel failed to load: ${response.status}`);
        }

        const markup = await response.text();
        document.body.insertAdjacentHTML("beforeend", markup);
        panel = document.querySelector("#resume-panel");
    } catch (error) {
        document.documentElement.dataset.resumeBridgeReady = "false";
        console.error(error);
        return;
    }

    const frame = document.querySelector("#resume-frame");
    const mobilePanelClose = document.querySelector("#resume-mobile-panel-close");

    if (!panel || !frame || !mobilePanelClose) {
        console.error("Resume panel markup is missing required elements.");
        return;
    }

    function sendTheme() {
        const theme = document.documentElement.dataset.theme || "dark";

        frame.contentWindow?.postMessage(
            {
                type: "easternnova-portfolio-theme",
                theme
            },
            window.location.origin
        );
    }

    function loadResume() {
        const resumeSource = "/resume/resume.html";

        if (frame.getAttribute("src") !== resumeSource) {
            frame.setAttribute("src", resumeSource);
        }
    }

    function openResume() {
        loadResume();
        panel.hidden = false;

        requestAnimationFrame(() => {
            panel.classList.add("is-open");
            panel.setAttribute("aria-hidden", "false");
            document.body.dataset.resumeOpen = "false";
            document.body.style.overflow = "";
            sendTheme();
        });
    }

    function closeResume() {
        panel.classList.remove("is-open");
        panel.setAttribute("aria-hidden", "true");
        document.body.dataset.resumeOpen = "false";
        document.body.style.overflow = "";

        window.setTimeout(() => {
            if (!panel.classList.contains("is-open")) {
                panel.hidden = true;
            }
        }, 280);
    }

    button.addEventListener("click", openResume);
    mobilePanelClose.addEventListener("click", closeResume);

    panel.addEventListener("click", (event) => {
        if (event.target === panel) {
            closeResume();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && panel.classList.contains("is-open")) {
            closeResume();
        }
    });

    frame.addEventListener("load", sendTheme);

    const observer = new MutationObserver(() => {
        if (panel.classList.contains("is-open")) {
            sendTheme();
        }
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"]
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeResumeBridge, { once: true });
} else {
    initializeResumeBridge();
}
