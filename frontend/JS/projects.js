/* =========================================================
   EasternNova
   Project Interface Interaction
   ========================================================= */

export function initializeProjects() {
    const projects = document.querySelectorAll(".project-card");

    if (!projects.length) return;

    projects.forEach((project) => {

        project.addEventListener("dblclick", () => {
            const url = project.dataset.projectUrl;

            if (!url || url === "#") return;

            window.open(url, "_blank", "noopener,noreferrer");
        });

        project.addEventListener("keydown", (event) => {
            if (event.key !== "Enter") return;

            const url = project.dataset.projectUrl;

            if (!url || url === "#") return;

            window.open(url, "_blank", "noopener,noreferrer");
        });
    });
}