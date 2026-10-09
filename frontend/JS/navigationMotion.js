export function initializeNavigationMotion() {
    const nav = document.querySelector(".portfolio-nav");
    const linksContainer = nav?.querySelector(".nav-section-links");

    if (!nav || !linksContainer) {
        return;
    }

    const links = [
        ...linksContainer.querySelectorAll(".nav-link")
    ];

    if (!links.length) {
        return;
    }

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const finePointer = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    );

    let activeLink = links.find(
        (link) => link.getAttribute("aria-current") === "true"
    ) || links[0];

    let hoveredLink = null;
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let shiftX = 0;
    let shiftY = 0;

    const highlight = document.createElement("span");

    highlight.className = "nav-link-highlight";
    highlight.setAttribute("aria-hidden", "true");

    linksContainer.prepend(highlight);

    function moveHighlight(link, animate = true) {
        if (!link) {
            return;
        }

        const containerRect =
            linksContainer.getBoundingClientRect();

        const linkRect =
            link.getBoundingClientRect();

        if (!containerRect.width || !linkRect.width) {
            return;
        }

        if (!animate || reducedMotion.matches) {
            highlight.style.transition = "none";
        } else {
            highlight.style.removeProperty("transition");
        }

        highlight.style.width = `${linkRect.width}px`;
        highlight.style.height = `${linkRect.height}px`;

        highlight.style.transform =
            `translate(${linkRect.left - containerRect.left}px, ` +
            `${linkRect.top - containerRect.top}px)`;

        if (!animate || reducedMotion.matches) {
            requestAnimationFrame(() => {
                highlight.style.removeProperty("transition");
            });
        }
    }

    function setActiveLink(link) {
        if (!link) {
            return;
        }

        activeLink = link;

        links.forEach((item) => {
            if (item === link) {
                item.setAttribute("aria-current", "true");
            } else {
                item.removeAttribute("aria-current");
            }
        });

        moveHighlight(hoveredLink || activeLink);
    }

    links.forEach((link) => {
        link.addEventListener("pointerenter", () => {
            hoveredLink = link;
            moveHighlight(link);
        });

        link.addEventListener("pointerleave", () => {
            hoveredLink = null;
            moveHighlight(activeLink);
        });

        link.addEventListener("focus", () => {
            moveHighlight(link);
        });

        link.addEventListener("blur", () => {
            moveHighlight(activeLink);
        });

        link.addEventListener("click", () => {
            setActiveLink(link);
        });
    });

    function syncFromHash() {
        const hash = window.location.hash || "#hero";

        const matchingLink = links.find(
            (link) => link.getAttribute("href") === hash
        );

        if (matchingLink) {
            setActiveLink(matchingLink);
        }
    }

    window.addEventListener("hashchange", syncFromHash);

    const sections = links
        .map((link) => {
            const id = link.getAttribute("href");

            return id?.startsWith("#")
                ? document.querySelector(id)
                : null;
        })
        .filter(Boolean);

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                const visibleSections = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            b.intersectionRatio -
                            a.intersectionRatio
                    );

                if (!visibleSections.length) {
                    return;
                }

                const visibleId =
                    `#${visibleSections[0].target.id}`;

                const matchingLink = links.find(
                    (link) =>
                        link.getAttribute("href") === visibleId
                );

                if (matchingLink) {
                    setActiveLink(matchingLink);
                }
            },
            {
                rootMargin: "-25% 0px -45% 0px",
                threshold: [0, 0.15, 0.35, 0.6]
            }
        );

        sections.forEach((section) => {
            observer.observe(section);
        });
    }

    function resetPanelMotion() {
        pointerX = 0;
        pointerY = 0;
        shiftX = 0;
        shiftY = 0;

        nav.style.setProperty("--nav-shift-x", "0px");
        nav.style.setProperty("--nav-shift-y", "0px");
    }

    function animatePanel() {
        frame = 0;

        const easing = 0.075;

        shiftX += (pointerX - shiftX) * easing;
        shiftY += (pointerY - shiftY) * easing;

        nav.style.setProperty(
            "--nav-shift-x",
            `${shiftX.toFixed(2)}px`
        );

        nav.style.setProperty(
            "--nav-shift-y",
            `${shiftY.toFixed(2)}px`
        );

        const stillMoving =
            Math.abs(pointerX - shiftX) > 0.05 ||
            Math.abs(pointerY - shiftY) > 0.05;

        if (stillMoving) {
            frame = requestAnimationFrame(animatePanel);
        }
    }

    function handlePointerMove(event) {
        if (
            reducedMotion.matches ||
            !finePointer.matches
        ) {
            return;
        }

        const rect = nav.getBoundingClientRect();

        const relativeX =
            (event.clientX - (rect.left + rect.width / 2)) /
            Math.max(rect.width / 2, 1);

        const relativeY =
            (event.clientY - (rect.top + rect.height / 2)) /
            Math.max(rect.height / 2, 1);

        pointerX = Math.max(-4, Math.min(4, relativeX * 4));
        pointerY = Math.max(-3, Math.min(3, relativeY * 3));

        if (!frame) {
            frame = requestAnimationFrame(animatePanel);
        }
    }

    if (finePointer.matches && !reducedMotion.matches) {
        window.addEventListener(
            "pointermove",
            handlePointerMove,
            { passive: true }
        );

        nav.addEventListener("pointerleave", resetPanelMotion);
    }

    function refreshHighlight() {
        moveHighlight(hoveredLink || activeLink, false);
    }

    window.addEventListener("resize", refreshHighlight);

    syncFromHash();

    requestAnimationFrame(refreshHighlight);
}