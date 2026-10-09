import ENOVA_CONFIG from "./enova.config.js";

const state = {
    open: false,
    minimized: false,
    expanded: false,
    activeTab: "chat"
};

let root;
let previousFocus;

function element(tag, className, text = "") {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
}

function createENOVA() {
    if (document.querySelector(".enova")) return;

    root = element("section", "enova");
    root.innerHTML = `
        <div class="enova-backdrop" data-action="close"></div>
        <section class="enova-window" role="dialog" aria-modal="true" aria-label="ENOVA Terminal" aria-hidden="true">
            <header class="enova-topbar">
                <div class="enova-window-controls">
                    <button class="enova-control enova-control-red" data-action="close" aria-label="Close"></button>
                    <button class="enova-control enova-control-yellow" data-action="minimize" aria-label="Minimize"></button>
                    <button class="enova-control enova-control-green" data-action="expand" aria-label="Expand"></button>
                </div>
                <nav class="enova-tabs" aria-label="Terminal tabs">
                    <button class="enova-tab is-active" data-tab="chat">main</button>
                    <button class="enova-tab" data-tab="projects">1 projects</button>
                    <button class="enova-tab" data-tab="skills">2 skills</button>
                    <button class="enova-tab" data-tab="resume">3 resume</button>
                </nav>
                <div class="enova-topbar-title">ENOVA.ai <span>•</span> Terminal</div>
            </header>
            <div class="enova-workspace">
                <aside class="enova-light-pane">
                    <div class="enova-pane-heading">ENOVA / SYSTEM</div>
                    <div class="enova-editor">
                        <div><span class="enova-line-number">01</span><span class="enova-code-comment">// public intelligence</span></div>
                        <div><span class="enova-line-number">02</span><span class="enova-code-keyword">const</span> agent = <span class="enova-code-string">"ENOVA"</span></div>
                        <div><span class="enova-line-number">03</span><span class="enova-code-keyword">const</span> mode = <span class="enova-code-string">"public"</span></div>
                        <div><span class="enova-line-number">04</span><span class="enova-code-keyword">const</span> status = <span class="enova-code-string">"ready"</span></div>
                        <div class="enova-code-gap"></div>
                        <div><span class="enova-line-number">06</span><span class="enova-code-comment">// knowledge domains</span></div>
                        <div><span class="enova-line-number">07</span>portfolio</div>
                        <div><span class="enova-line-number">08</span>projects</div>
                        <div><span class="enova-line-number">09</span>skills</div>
                        <div><span class="enova-line-number">10</span>resume</div>
                    </div>
                    <div class="enova-pane-bottom">
                        <span>UTF-8</span>
                        <span>READ ONLY</span>
                    </div>
                </aside>
                <main class="enova-dark-pane">
                    <div class="enova-terminal-heading">
                        <div class="enova-terminal-brand">enova.ai <span>v0.1</span> <span class="enova-online-dot"></span></div>
                        <div class="enova-terminal-hint">type a question, or choose one below</div>
                    </div>
                    <div class="enova-terminal-content" aria-live="polite">
                        <section class="enova-view is-active" data-view="chat">
                            <p class="enova-comment">// hello. ask me anything about EasternNova.</p>
                            <div class="enova-suggestions"></div>
                            <div class="enova-messages"></div>
                        </section>
                        <section class="enova-view" data-view="projects" hidden>
                            <p class="enova-comment">// projects</p>
                            <p class="enova-placeholder">Project information will appear here as the portfolio knowledge base is connected.</p>
                        </section>
                        <section class="enova-view" data-view="skills" hidden>
                            <p class="enova-comment">// skills</p>
                            <p class="enova-placeholder">Skills will be populated from verified portfolio data.</p>
                        </section>
                        <section class="enova-view" data-view="resume" hidden>
                            <p class="enova-comment">// live resume</p>
                            <p class="enova-placeholder">Use the portfolio Resume control to open the current live resume.</p>
                        </section>
                    </div>
                    <footer class="enova-command-area">
                        <label class="enova-command-line">
                            <span class="enova-shell-prompt">guest@easternnova:~$</span>
                            <textarea class="enova-input" rows="1" placeholder="${ENOVA_CONFIG.placeholder}" aria-label="Message ENOVA" spellcheck="false"></textarea>
                            <button class="enova-send" aria-label="Send message" title="Send">↵</button>
                        </label>
                        <div class="enova-input-help">ENTER to send <span>SHIFT + ENTER for new line</span></div>
                    </footer>
                </main>
            </div>
            <footer class="enova-statusbar">
                <span class="enova-mode">NORMAL</span>
                <span class="enova-status-path">enova@easternnova</span>
                <span class="enova-status-spacer"></span>
                <span class="enova-status-live"><i></i> LIVE</span>
                <span class="enova-status-size">100%</span>
            </footer>
        </section>
        <button class="enova-minimized" data-action="restore" aria-label="Restore ENOVA">
            <span class="enova-mini-dots"><i></i><i></i><i></i></span>
            ENOVA.ai <span>• Terminal</span>
        </button>
    `;

    document.body.appendChild(root);
    bindEvents();
    renderSuggestions();
    bindNavigation();
}

function bindEvents() {
    root.addEventListener("click", event => {
        const action = event.target.closest("[data-action]")?.dataset.action;
        const tab = event.target.closest("[data-tab]")?.dataset.tab;

        if (action === "close") closeENOVA();
        if (action === "minimize") minimizeENOVA();
        if (action === "expand") toggleExpand();
        if (action === "restore") restoreENOVA();
        if (tab) switchTab(tab);
    });

    root.querySelector(".enova-send").addEventListener("click", sendMessage);

    const input = root.querySelector(".enova-input");

    input.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }

        if (event.key === "Escape") closeENOVA();
    });

    input.addEventListener("input", () => {
        input.style.height = "auto";
        input.style.height = `${Math.min(input.scrollHeight, 100)}px`;
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && state.open) closeENOVA();

        if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && state.open) {
            sendMessage();
        }
    });
}

function bindNavigation() {
    document.querySelectorAll("#enova-nav-button, [aria-label='Open EasternNova chat']").forEach(button => {
        button.addEventListener("click", openENOVA);
    });
}

function openENOVA() {
    previousFocus = document.activeElement;
    state.open = true;
    state.minimized = false;
    root.classList.add("is-open");
    root.classList.remove("is-minimized");
    root.querySelector(".enova-window").setAttribute("aria-hidden", "false");
    document.body.classList.add("enova-open");
    root.querySelector(".enova-input").focus();
}

function closeENOVA() {
    state.open = false;
    state.minimized = false;
    root.classList.remove("is-open", "is-minimized");
    root.querySelector(".enova-window").setAttribute("aria-hidden", "true");
    document.body.classList.remove("enova-open");
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
}

function minimizeENOVA() {
    state.minimized = true;
    root.classList.remove("is-open");
    root.classList.add("is-minimized");
    root.querySelector(".enova-window").setAttribute("aria-hidden", "true");
    document.body.classList.remove("enova-open");
}

function restoreENOVA() {
    state.minimized = false;
    openENOVA();
}

function toggleExpand() {
    state.expanded = !state.expanded;
    root.classList.toggle("is-expanded", state.expanded);
    root.querySelector(".enova-status-size").textContent = state.expanded ? "FULL" : "100%";
}

function switchTab(tab) {
    state.activeTab = tab;

    root.querySelectorAll("[data-tab]").forEach(button => {
        button.classList.toggle("is-active", button.dataset.tab === tab);
    });

    root.querySelectorAll("[data-view]").forEach(view => {
        const active = view.dataset.view === tab;
        view.hidden = !active;
        view.classList.toggle("is-active", active);
    });

    const input = root.querySelector(".enova-input");
    const chatActive = tab === "chat";
    input.disabled = !chatActive;
    root.querySelector(".enova-send").disabled = !chatActive;

    if (tab === "resume") {
        const resumeButton = document.querySelector("#resume-button");
        if (resumeButton) resumeButton.focus({ preventScroll: true });
    }
}

function renderSuggestions() {
    const container = root.querySelector(".enova-suggestions");

    ENOVA_CONFIG.suggestions.forEach((text, index) => {
        const button = element("button", "enova-suggestion", text);
        button.type = "button";
        button.addEventListener("click", () => {
            switchTab("chat");
            root.querySelector(".enova-input").value = text;
            sendMessage();
        });
        container.appendChild(button);
    });
}

function sendMessage() {
    const input = root.querySelector(".enova-input");
    const text = input.value.trim();

    if (!text || input.disabled) return;

    addMessage(text, "user");
    input.value = "";
    input.style.height = "auto";
    showTyping();

    window.setTimeout(() => {
        hideTyping();
        addMessage(
            "The ENOVA AI connection is not configured yet. This is the interface preview; the FastAPI and language-model connection will be added in the next phase.",
            "enova"
        );
    }, 700);
}

function addMessage(text, sender) {
    const message = element("article", `enova-message enova-message-${sender}`);
    const prefix = element(
        "div",
        "enova-message-prefix",
        sender === "user" ? "guest@easternnova:~$" : "enova@easternnova:~$"
    );
    const content = element("div", "enova-message-content", text);
    message.append(prefix, content);
    root.querySelector(".enova-messages").appendChild(message);
    message.scrollIntoView({ block: "nearest" });
}

function showTyping() {
    hideTyping();
    const typing = element("div", "enova-typing", "enova@easternnova:~$ processing...");
    typing.dataset.typing = "true";
    root.querySelector(".enova-messages").appendChild(typing);
}

function hideTyping() {
    root.querySelector("[data-typing]")?.remove();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createENOVA, { once: true });
} else {
    createENOVA();
}