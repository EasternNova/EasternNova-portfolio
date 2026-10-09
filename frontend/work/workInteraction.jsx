export function initializeWorkInteractions() {
    const viewport = document.querySelector(".work-viewport");
    const rail = document.querySelector(".work-project-rail");
    const projects = document.querySelectorAll(".work-project");

    if (!viewport || !rail || !projects.length) {
        return;
    }

    let activeIndex = 0;
    let currentX = 0;
    let targetX = 0;
    let animationFrame = null;

    function isMobile() {
        return window.matchMedia("(max-width: 700px)").matches;
    }

    function getTargetPosition(project) {
        if (isMobile()) {
            return 0;
        }

        const viewportWidth = viewport.clientWidth;
        const projectLeft = project.offsetLeft;
        const projectWidth = project.offsetWidth;

        const centeredPosition =
            projectLeft -
            (viewportWidth - projectWidth) / 2;

        const maxTranslate = Math.max(
            0,
            rail.scrollWidth - viewportWidth
        );

        return Math.max(
            0,
            Math.min(centeredPosition, maxTranslate)
        );
    }

    function animateRail() {
        currentX += (targetX - currentX) * 0.12;

        if (Math.abs(targetX - currentX) < 0.1) {
            currentX = targetX;
        }

        rail.style.transform =
            `translate3d(${-currentX}px, 0, 0)`;

        if (Math.abs(targetX - currentX) > 0.1) {
            animationFrame =
                requestAnimationFrame(animateRail);
        } else {
            animationFrame = null;
        }
    }

    function activateProject(index) {
        if (isMobile()) {
            return;
        }

        const project = projects[index];

        if (!project) {
            return;
        }

        activeIndex = index;

        projects.forEach((item, itemIndex) => {
            item.classList.toggle(
                "is-active",
                itemIndex === index
            );
        });

        targetX = getTargetPosition(project);

        if (!animationFrame) {
            animationFrame =
                requestAnimationFrame(animateRail);
        }
    }

    function openProject(project) {
        const url = project.dataset.projectUrl;

        if (!url || url === "#") {
            return;
        }

        window.location.href = url;
    }

    projects.forEach((project, index) => {
        project.addEventListener("mouseenter", () => {
            activateProject(index);
        });

        project.addEventListener("focusin", () => {
            activateProject(index);
        });

        project.addEventListener("click", () => {
            openProject(project);
        });

        project.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }

            event.preventDefault();
            openProject(project);
        });
    });

    window.addEventListener("resize", () => {
        if (isMobile()) {
            currentX = 0;
            targetX = 0;

            rail.style.transform =
                "translate3d(0, 0, 0)";

            projects.forEach((project) => {
                project.classList.remove("is-active");
            });

            return;
        }

        const activeProject = projects[activeIndex];

        if (!activeProject) {
            return;
        }

        targetX =
            getTargetPosition(activeProject);

        if (!animationFrame) {
            animationFrame =
                requestAnimationFrame(animateRail);
        }
    });

    if (!isMobile()) {
        projects[0].classList.add("is-active");
    }
}

export function initializeWorkScroll() {
    return;
}