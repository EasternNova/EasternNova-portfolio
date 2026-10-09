import { WORK_PROJECTS } from "./workData.js";

function createProjectCard(project) {
    const article = document.createElement("article");

    article.className = "work-project";
    article.tabIndex = 0;
    article.dataset.projectId = project.id;
    article.dataset.projectUrl = project.link || "#";

    const skills = project.skills
        .map(
            (skill) => `
                <span class="work-project-skill">${skill}</span>
            `
        )
        .join("");

    article.innerHTML = `
        <div class="work-project-visual">
            <img
                class="work-project-image"
                src="${project.image}"
                alt="${project.title} project preview"
                loading="lazy"
            />
        </div>

        <div class="work-project-content">

            <div class="work-project-title-row">
                <h3>${project.title}</h3>

                <span
                    class="work-project-arrow"
                    aria-hidden="true"
                >
                    ↗
                </span>
            </div>

            <p class="work-project-description">
                ${project.description}
            </p>

            <div class="work-project-skills">
                ${skills}
            </div>

        </div>
    `;

    return article;
}

export function initializeWork() {
    const rail = document.querySelector("#work-project-rail");

    if (!rail) {
        return;
    }

    rail.replaceChildren(
        ...WORK_PROJECTS.map(createProjectCard)
    );
}