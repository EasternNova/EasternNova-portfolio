const ENOVA_CONFIG = {
    name: "ENOVA.ai",
    title: "EasternNova Neural Operations & Virtual Assistant",
    welcome: "Hello. I'm ENOVA, the public intelligence of EasternNova.",
    description: "Ask me about the projects, skills, experience, or ideas behind the work.",
    placeholder: "Ask about EasternNova...",
    apiBaseUrl: "http://localhost:8000",
    chatEndpoint: "/api/chat",
    suggestions: [
        "Who is Prachi?",
        "What are her skills?",
        "Explore her projects",
        "Tell me about her resume",
        "What's her best work?"
    ],
    commands: [
        { label: "Chat", command: "chat" },
        { label: "Projects", command: "projects" },
        { label: "Resume", command: "resume" }
    ]
};

export default ENOVA_CONFIG;