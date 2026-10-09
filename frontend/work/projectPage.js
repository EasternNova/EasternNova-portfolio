import { WORK_PROJECTS } from "./workData.js";
import "./projectPage.css";

function getProjectSlug() {
    const parts =
        window.location.pathname
            .split("/")
            .filter(Boolean);

    if (parts[0] !== "projects") {
        return null;
    }

    return parts[1] || null;
}

function getProjectIndex(slug) {
    return WORK_PROJECTS.findIndex(
        (project) =>
            project.link === `/projects/${slug}`
    );
}

function createTechnologyList(skills) {
    return skills
        .map(
            (skill) => `
                <span class="project-detail-tag">
                    ${skill}
                </span>
            `
        )
        .join("");
}

function createProjectPage(project, index) {
    const previousIndex =
        (index - 1 + WORK_PROJECTS.length) %
        WORK_PROJECTS.length;

    const nextIndex =
        (index + 1) %
        WORK_PROJECTS.length;

    const previousProject =
        WORK_PROJECTS[previousIndex];

    const nextProject =
        WORK_PROJECTS[nextIndex];

    const container =
        document.createElement("main");

    container.className = "project-page";

    container.innerHTML = `
        <div class="project-page-shell">

            <!-- PROJECT NAVIGATION -->

            <header class="project-page-header">

                <button
                    class="project-page-back"
                    type="button"
                    data-action="back"
                >
                    ← Back
                </button>

                <div class="project-page-navigation">

                    <button
                        class="project-page-share"
                        type="button"
                        data-action="share"
                    >
                        Share
                    </button>

                    <a
                        href="${previousProject.link}"
                        aria-label="Previous project"
                    >
                        ←
                    </a>

                    <span>
                        ${String(index + 1).padStart(2, "0")}
                        /
                        ${String(WORK_PROJECTS.length).padStart(2, "0")}
                    </span>

                    <a
                        href="${nextProject.link}"
                        aria-label="Next project"
                    >
                        →
                    </a>

                </div>

            </header>


            <!-- PROJECT HERO -->

            <section class="project-page-hero">

                <div class="project-page-hero-content">

                    <p class="project-page-label">
                        ${project.title}
                    </p>

                    <h1>
                        ${project.title}
                    </h1>

                    <h2>
                        ${project.description}
                    </h2>

                    <div class="project-page-tags">
                        ${createTechnologyList(
                            project.skills
                        )}
                    </div>

                </div>


                <div class="project-page-hero-visual">

                    <img
                        src="${project.image}"
                        alt="${project.title} project interface"
                    />

                </div>

            </section>


            <!-- OVERVIEW -->

            <section
                class="project-page-overview"
                data-project-section="overview"
            >

                <p class="project-page-label">
                    OVERVIEW
                </p>

                <p>
                    ${project.description}
                </p>

                <p>
                    This project documents the ideas,
                    technical decisions, development process,
                    and lessons behind ${project.title}.
                </p>

            </section>


            <!-- WHY IT MATTERED -->

            <section
                class="project-page-feature"
                data-project-section="why"
            >

                <p class="project-page-label">
                    WHY IT MATTERED
                </p>

                <div class="project-page-feature-box">

                    <p>
                        A project becomes more than an interface
                        when the problem, technical decisions,
                        and development process are understood
                        together.
                    </p>

                </div>

            </section>


            <!-- CHALLENGE / BREAKTHROUGH / OUTCOME -->

            <section
                class="project-page-triad"
                data-project-section="challenge"
            >

                <article>

                    <p class="project-page-label">
                        01 · CHALLENGE
                    </p>

                    <p>
                        The main problem explored by
                        this project.
                    </p>

                </article>

                <article>

                    <p class="project-page-label">
                        02 · BREAKTHROUGH
                    </p>

                    <p>
                        An important technical or design
                        discovery during development.
                    </p>

                </article>

                <article>

                    <p class="project-page-label">
                        03 · OUTCOME
                    </p>

                    <p>
                        What was built, tested, learned,
                        or achieved.
                    </p>

                </article>

            </section>


            <!-- 01 CONTEXT -->

            <section
                class="project-page-section"
                data-project-section="context"
            >

                <p class="project-page-label">
                    01 · CONTEXT
                </p>

                <h2>
                    Context
                </h2>

                <p>
                    Project-specific context will be
                    added here.
                </p>

            </section>


            <!-- 02 PROBLEM -->

            <section
                class="project-page-section"
                data-project-section="problem"
            >

                <p class="project-page-label">
                    02 · THE PROBLEM
                </p>

                <h2>
                    The Problem
                </h2>

                <p>
                    The problem, research question,
                    or challenge behind this project
                    will be documented here.
                </p>

            </section>


            <!-- 03 PRACHI'S ROLE -->

            <section
                class="project-page-section"
                data-project-section="role"
            >

                <p class="project-page-label">
                    03 · PRACHI'S ROLE
                </p>

                <h2>
                    My Role
                </h2>

                <p>
                    Research, design, development,
                    implementation, testing, and
                    documentation will be described here.
                </p>

            </section>


            <!-- 04 PROCESS -->

            <section
                class="project-page-section"
                data-project-section="process"
            >

                <p class="project-page-label">
                    04 · THE PROCESS
                </p>

                <h2>
                    The Process
                </h2>

                <div class="project-page-process">

                    <div>
                        <span>01</span>
                        Research
                    </div>

                    <div>
                        <span>02</span>
                        Planning
                    </div>

                    <div>
                        <span>03</span>
                        Development
                    </div>

                    <div>
                        <span>04</span>
                        Testing
                    </div>

                    <div>
                        <span>05</span>
                        Iteration
                    </div>

                </div>

            </section>


            <!-- 05 KEY DECISIONS -->

            <section
                class="project-page-section"
                data-project-section="decisions"
            >

                <p class="project-page-label">
                    05 · KEY DECISIONS
                </p>

                <h2>
                    Key Design & Technical Decisions
                </h2>

                <div class="project-page-decision-list">

                    <article>
                        <span>01</span>

                        <div>
                            <h3>
                                Decision One
                            </h3>

                            <p>
                                The reasoning behind an
                                important project decision.
                            </p>
                        </div>
                    </article>

                    <article>
                        <span>02</span>

                        <div>
                            <h3>
                                Decision Two
                            </h3>

                            <p>
                                The technical or design
                                reasoning behind the choice.
                            </p>
                        </div>
                    </article>

                    <article>
                        <span>03</span>

                        <div>
                            <h3>
                                Decision Three
                            </h3>

                            <p>
                                What influenced this
                                implementation choice.
                            </p>
                        </div>
                    </article>

                </div>

            </section>


            <!-- DEVELOPMENT MAP -->

            <section
                class="project-page-section"
                data-project-section="development-map"
            >

                <p class="project-page-label">
                    DEVELOPMENT MAP
                </p>

                <h2>
                    From Idea to Implementation
                </h2>

                <div class="project-page-development-map">

                    <span>Idea</span>
                    <span>Research</span>
                    <span>Data</span>
                    <span>Architecture</span>
                    <span>Development</span>
                    <span>Testing</span>
                    <span>Current State</span>

                </div>

            </section>


            <!-- AI SYSTEM -->

            <section
                class="project-page-section"
                data-project-section="ai-system"
            >

                <p class="project-page-label">
                    AI SYSTEM
                </p>

                <h2>
                    Designing for an AI System,
                    not just an Interface
                </h2>

                <p>
                    The system architecture behind
                    this project will be explained here.
                </p>

                <div class="project-page-ai-diagram">

                    <div>
                        Input
                    </div>

                    <span>↓</span>

                    <div>
                        Processing
                    </div>

                    <span>↓</span>

                    <div>
                        Model
                    </div>

                    <span>↓</span>

                    <div>
                        Output
                    </div>

                </div>

            </section>


            <!-- PROJECT VISUALS -->

            <section
                class="project-page-section"
                data-project-section="visuals"
            >

                <p class="project-page-label">
                    PROJECT VISUALS
                </p>

                <h2>
                    Building the Interface
                </h2>

                <div class="project-page-visual-story">

                    <figure>

                        <img
                            src="${project.image}"
                            alt="${project.title} interface"
                        />

                        <figcaption>
                            Project interface and
                            implementation.
                        </figcaption>

                    </figure>

                </div>

            </section>


            <!-- OUTCOMES -->

            <section
                class="project-page-section"
                data-project-section="outcomes"
            >

                <p class="project-page-label">
                    OUTCOMES
                </p>

                <h2>
                    What was built
                </h2>

                <div class="project-page-outcomes">

                    <div>
                        <strong>01</strong>
                        <span>
                            Research
                        </span>
                    </div>

                    <div>
                        <strong>02</strong>
                        <span>
                            Prototype
                        </span>
                    </div>

                    <div>
                        <strong>03</strong>
                        <span>
                            Implementation
                        </span>
                    </div>

                    <div>
                        <strong>04</strong>
                        <span>
                            Testing
                        </span>
                    </div>

                </div>

            </section>


            <!-- IMPACT -->

            <section
                class="project-page-section"
                data-project-section="impact"
            >

                <p class="project-page-label">
                    IMPACT
                </p>

                <h2>
                    Impact
                </h2>

                <p>
                    The impact of the project will be
                    described using actual results,
                    observations, and measurable outcomes
                    where available.
                </p>

            </section>


            <!-- LEARNINGS -->

            <section
                class="project-page-section"
                data-project-section="learnings"
            >

                <p class="project-page-label">
                    KEY LEARNINGS
                </p>

                <h2>
                    What I Learned
                </h2>

                <div class="project-page-learning-map">

                    <span>Fundamentals</span>
                    <span>Implementation</span>
                    <span>Problem Solving</span>
                    <span>Advanced Concepts</span>

                </div>

            </section>


            <!-- NOVA AI -->

            <section
                class="project-page-ai"
                data-project-section="nova"
            >

                <div class="project-page-ai-header">

                    <p class="project-page-label">
                        ASK NOVA
                    </p>

                    <h2>
                        Curious about this project?
                    </h2>

                    <p>
                        Ask Nova about the work,
                        decisions, challenges,
                        or lessons behind it.
                    </p>

                </div>

                <div class="project-page-ai-prompts">

                    <button type="button">
                        What did Prachi build here?
                    </button>

                    <button type="button">
                        What did she learn?
                    </button>

                    <button type="button">
                        What was the hardest part?
                    </button>

                </div>

                <div class="project-page-ai-input">

                    <input
                        type="text"
                        placeholder="Ask anything..."
                        aria-label="Ask Nova about this project"
                    />

                    <button
                        type="button"
                        aria-label="Send question"
                    >
                        ↑
                    </button>

                </div>

            </section>


            <!-- BOTTOM ACTIONS -->

            <footer class="project-page-footer">

                <button
                    class="project-page-back"
                    type="button"
                    data-action="back"
                >
                    ← Back to Work
                </button>

                <button
                    class="project-page-share"
                    type="button"
                    data-action="share"
                >
                    Share
                </button>

            </footer>

        </div>
    `;

    setupProjectPageEvents(
        container,
        project
    );

    return container;
}

function setupProjectPageEvents(
    container,
    project
) {
    const backButtons =
        container.querySelectorAll(
            '[data-action="back"]'
        );

    const shareButtons =
        container.querySelectorAll(
            '[data-action="share"]'
        );

    backButtons.forEach((button) => {
        button.addEventListener(
            "click",
            () => {
                if (window.history.length > 1) {
                    window.history.back();
                    return;
                }

                window.location.href =
                    "/#work";
            }
        );
    });

    shareButtons.forEach((button) => {
        button.addEventListener(
            "click",
            async () => {
                const shareData = {
                    title: project.title,
                    text: project.description,
                    url: window.location.href
                };

                try {
                    if (
                        navigator.share
                    ) {
                        await navigator.share(
                            shareData
                        );
                        return;
                    }

                    await navigator.clipboard.writeText(
                        window.location.href
                    );

                    button.textContent =
                        "Copied";
                } catch {
                    button.textContent =
                        "Copied";
                }
            }
        );
    });
}

export function initializeProjectPage() {
    const slug =
        getProjectSlug();

    if (!slug) {
        return false;
    }

    const index =
        getProjectIndex(slug);

    if (index === -1) {
        return false;
    }

    const project =
        WORK_PROJECTS[index];

    const page =
        createProjectPage(
            project,
            index
        );

    document.body.innerHTML = "";

    document.body.appendChild(page);

    document.title =
        `${project.title} — EasternNova`;

    return true;
}