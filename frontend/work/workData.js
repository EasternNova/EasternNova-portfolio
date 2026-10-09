import handlexImage from "./Wassets/handlex.png";
import easternnovaImage from "./Wassets/easternnova-portfolio.png";
import miniarcadeImage from "./Wassets/miniarcade.png";
import focusflowImage from "./Wassets/focusflow.png";
import datalensImage from "./Wassets/datalens.png";
import novaaiImage from "./Wassets/novaai.png";
import cubelabImage from "./Wassets/cubelab.png";
import sketchspaceImage from "./Wassets/sketchspace.png";

export const WORK_PROJECTS = [
    {
        id: "P1",
        title: "HandLex",
        description:
            "Designed a real-time AI which will convert Sign Language to text",
        skills: [
            "Artificial Intelligence",
            "Full Stack Developer"
        ],
        image: handlexImage,
        link: "/projects/handlex",
        accent: "cyan",
        status: "In Development",
        type: "AI / ML",
        role: "AI / Full Stack Development",
        project: {
            botName: "HandLex",
            context:
                "HandLex is a sign-language recognition project exploring how computer vision and machine learning can help translate sign language into readable text.",
            problem:
                "Sign language communication can be difficult to access when the other person does not understand signing. The project explores a technology-based bridge between visual gestures and text.",
            role:
                "I am responsible for researching the problem, preparing the dataset, building the machine-learning pipeline, developing the recognition system, and creating the web experience around it.",
            process:
                "The project moves from dataset research and keypoint extraction to feature preparation, model experimentation, recognition, testing, and finally the portfolio interface used to demonstrate the work.",
            decisions: [
                {
                    title: "Use body keypoints",
                    text:
                        "The project focuses on extracted pose and hand keypoints instead of depending only on raw video frames."
                },
                {
                    title: "Build the model in stages",
                    text:
                        "Recognition and translation are treated as separate problems so each part can be tested and improved independently."
                },
                {
                    title: "Show the system visually",
                    text:
                        "The final experience should make the AI process understandable instead of presenting only a prediction."
                }
            ],
            constraints: [
                "Large video datasets",
                "Limited computing resources",
                "Complex sign-language sequences",
                "Model accuracy and generalisation"
            ],
            impact:
                "HandLex has become a practical exploration of computer vision, sequence modelling, AI engineering, and full-stack development while creating a foundation for future real-time sign-language translation.",
            learning:
                "The project is teaching me how research papers, datasets, model architecture, engineering decisions, and user experience connect inside one AI product."
        }
    },

    {
        id: "P2",
        title: "EasternNova Portfolio",
        description:
            "A personal portfolio showcasing projects, experiments, technical skills, and interactive design.",
        skills: [
            "Web Development",
            "UI / UX Design"
        ],
        image: easternnovaImage,
        link: "/projects/easternnova-portfolio",
        accent: "purple",
        status: "In Development",
        type: "Portfolio",
        role: "Design / Full Stack Development",
        project: {
            botName: "EasternNova",
            context:
                "EasternNova is my personal digital space for presenting projects, experiments, technical skills, and the process behind the things I build.",
            problem:
                "A traditional portfolio can show finished projects without showing the thinking, experimentation, and technical journey behind them.",
            role:
                "I design, develop, structure, test, and continuously refine the portfolio experience myself.",
            process:
                "The portfolio is being developed through separate stages covering structure, project presentation, visual design, interaction, animation, accessibility, and future AI features.",
            decisions: [
                {
                    title: "Treat projects as destinations",
                    text:
                        "The portfolio acts as an index while each project receives its own documentation experience."
                },
                {
                    title: "Keep the interface restrained",
                    text:
                        "Animation and visual effects are used to support the content rather than compete with it."
                },
                {
                    title: "Build progressively",
                    text:
                        "The portfolio is developed in controlled phases so each system remains understandable and maintainable."
                }
            ],
            constraints: [
                "Solo development",
                "Limited project history",
                "Continuous design iteration",
                "Performance and responsiveness"
            ],
            impact:
                "EasternNova is becoming a living record of my growth as a developer, designer, and AI/ML student rather than simply a collection of links.",
            learning:
                "Building the portfolio itself has taught me how architecture, design systems, interaction, content, and performance affect the quality of a digital product."
        }
    },

    {
        id: "P3",
        title: "MiniArcade",
        description:
            "A collection of browser games designed as an interactive arcade experience.",
        skills: [
            "Game Development",
            "JavaScript"
        ],
        image: miniarcadeImage,
        link: "/projects/miniarcade",
        accent: "orange",
        status: "In Development",
        type: "Web Game",
        role: "Game Development",
        project: {
            botName: "MiniArcade",
            context:
                "MiniArcade is an interactive browser-based arcade combining small games into one playful web experience.",
            problem:
                "Individual browser games often feel disconnected. The goal is to create one place where multiple simple games can feel like part of the same product.",
            role:
                "I design the interface, game interactions, navigation, visual system, and JavaScript logic.",
            process:
                "The project begins with individual game mechanics and gradually connects them through a shared interface, navigation system, themes, and responsive behaviour.",
            decisions: [
                {
                    title: "Start with simple mechanics",
                    text:
                        "Small games make it easier to focus on interaction quality and reusable game logic."
                },
                {
                    title: "Use one visual system",
                    text:
                        "Shared components make multiple games feel like one arcade instead of unrelated pages."
                },
                {
                    title: "Keep controls immediate",
                    text:
                        "Game interfaces should make the next possible action obvious without unnecessary UI."
                }
            ],
            constraints: [
                "Browser performance",
                "Responsive game controls",
                "Reusable game architecture",
                "Multiple game states"
            ],
            impact:
                "MiniArcade provides a practical environment for learning JavaScript interaction, game logic, UI design, and reusable front-end architecture.",
            learning:
                "The project is teaching me how small interaction decisions can strongly affect usability and how game logic can be separated from interface code."
        }
    },

    {
        id: "P4",
        title: "FocusFlow",
        description:
            "A minimal productivity web app to manage tasks, focus time, and daily goals.",
        skills: [
            "Web Application",
            "Productivity"
        ],
        image: focusflowImage,
        link: "/projects/focusflow",
        accent: "green",
        status: "Concept / Development",
        type: "Productivity",
        role: "Web Development",
        project: {
            botName: "FocusFlow",
            context:
                "FocusFlow explores a simple productivity environment for organising tasks, focus sessions, and daily goals.",
            problem:
                "Productivity tools can become overwhelming when planning itself becomes another task.",
            role:
                "I am responsible for the interface structure, interaction design, task flow, and front-end implementation.",
            process:
                "The project focuses on reducing the number of decisions required to start a task and organising the experience around short, focused sessions.",
            decisions: [
                {
                    title: "Reduce visual noise",
                    text:
                        "The interface prioritises the current task instead of showing every piece of information simultaneously."
                },
                {
                    title: "Focus on one action",
                    text:
                        "The user should always understand what they can do next."
                },
                {
                    title: "Keep progress visible",
                    text:
                        "Small progress signals provide feedback without turning the interface into a dashboard."
                }
            ],
            constraints: [
                "Avoiding feature overload",
                "Simple task management",
                "Responsive interaction",
                "Maintaining focus"
            ],
            impact:
                "FocusFlow explores how a small interface can support daily planning without becoming another source of distraction.",
            learning:
                "The project is helping me understand how product decisions and interface simplicity influence behaviour."
        }
    },

    {
        id: "P5",
        title: "DataLens",
        description:
            "An interactive data visualization platform exploring real-world datasets.",
        skills: [
            "Data Visualization",
            "Python"
        ],
        image: datalensImage,
        link: "/projects/datalens",
        accent: "blue",
        status: "In Development",
        type: "Data Visualization",
        role: "Data / Web Development",
        project: {
            botName: "DataLens",
            context:
                "DataLens explores ways of turning datasets into visual experiences that make patterns easier to understand.",
            problem:
                "Raw tables can contain useful information while still being difficult to interpret quickly.",
            role:
                "I work on dataset preparation, visualisation logic, interface design, and the connection between data and the web interface.",
            process:
                "The workflow moves from dataset exploration and cleaning to selecting useful visual representations and building an interactive interface around them.",
            decisions: [
                {
                    title: "Visualise before decorating",
                    text:
                        "Charts should communicate a meaningful relationship before additional visual styling is introduced."
                },
                {
                    title: "Keep data accessible",
                    text:
                        "The interface should make the underlying information understandable rather than hiding it behind graphics."
                },
                {
                    title: "Explore interactively",
                    text:
                        "Interaction allows users to inspect patterns instead of relying only on static charts."
                }
            ],
            constraints: [
                "Dataset quality",
                "Large data volumes",
                "Chart readability",
                "Browser rendering"
            ],
            impact:
                "DataLens provides a practical environment for learning how programming, data analysis, and interface design can work together.",
            learning:
                "The project is teaching me to think about data not only as numbers but also as information that needs context and presentation."
        }
    },

    {
        id: "P6",
        title: "NovaAI",
        description:
            "An AI-powered assistant for learning, coding, and creative exploration.",
        skills: [
            "AI / ML",
            "Conversational AI"
        ],
        image: novaaiImage,
        link: "/projects/novaai",
        accent: "pink",
        status: "In Development",
        type: "Artificial Intelligence",
        role: "AI / Web Development",
        project: {
            botName: "NovaAI",
            context:
                "NovaAI explores an AI assistant designed around learning, coding, experimentation, and creative exploration.",
            problem:
                "General-purpose AI interfaces can provide answers without creating a clear environment for structured learning and experimentation.",
            role:
                "I explore the assistant experience, interface, prompt structure, technical integration, and interaction model.",
            process:
                "The project develops from conversational experiments into a structured interface that combines AI interaction with learning and creative workflows.",
            decisions: [
                {
                    title: "Make conversation contextual",
                    text:
                        "The assistant should understand what the user is trying to accomplish rather than responding as an isolated question-answer system."
                },
                {
                    title: "Keep interaction lightweight",
                    text:
                        "The interface should make experimentation quick instead of surrounding every interaction with controls."
                },
                {
                    title: "Design for learning",
                    text:
                        "The assistant should help users understand concepts rather than only produce outputs."
                }
            ],
            constraints: [
                "Model limitations",
                "Prompt reliability",
                "Response latency",
                "Responsible AI behaviour"
            ],
            impact:
                "NovaAI is an exploration of how conversational AI can become part of a useful learning environment.",
            learning:
                "The project is helping me understand that good AI products require both technical model knowledge and thoughtful interaction design."
        }
    },

    {
        id: "P7",
        title: "CubeLab",
        description:
            "An interactive 3D puzzle simulator with solving algorithms and visual learning.",
        skills: [
            "Algorithms",
            "JavaScript"
        ],
        image: cubelabImage,
        link: "/projects/cubelab",
        accent: "yellow",
        status: "Concept / Development",
        type: "Interactive 3D",
        role: "JavaScript Development",
        project: {
            botName: "CubeLab",
            context:
                "CubeLab explores an interactive environment for understanding cube puzzles, algorithms, and visual problem solving.",
            problem:
                "Puzzle algorithms can be difficult to understand when presented only as sequences of written moves.",
            role:
                "I work on the interactive model, algorithm representation, visual interface, and browser-based interactions.",
            process:
                "The project combines puzzle representation, user controls, algorithm logic, and visual feedback into one interactive learning environment.",
            decisions: [
                {
                    title: "Show the algorithm",
                    text:
                        "Moves should be visible as actions rather than hidden behind a final result."
                },
                {
                    title: "Use visual feedback",
                    text:
                        "The interface should show how each action changes the puzzle."
                },
                {
                    title: "Separate logic from rendering",
                    text:
                        "Puzzle state and visual representation should remain independent so the system can evolve."
                }
            ],
            constraints: [
                "3D rendering",
                "State management",
                "Algorithm complexity",
                "Interaction accuracy"
            ],
            impact:
                "CubeLab creates a practical way to explore algorithms and interactive 3D interfaces through a browser.",
            learning:
                "The project is strengthening my understanding of algorithms, state, visualisation, and interactive JavaScript systems."
        }
    },

    {
        id: "P8",
        title: "SketchSpace",
        description:
            "A lightweight digital drawing and creative canvas for quick ideas and sketches.",
        skills: [
            "Creative Tools",
            "HTML / CSS"
        ],
        image: sketchspaceImage,
        link: "/projects/sketchspace",
        accent: "red",
        status: "Concept / Development",
        type: "Creative Tool",
        role: "Web Development",
        project: {
            botName: "SketchSpace",
            context:
                "SketchSpace explores a lightweight browser canvas for quickly drawing, experimenting, and capturing visual ideas.",
            problem:
                "Creative tools can introduce unnecessary complexity when the goal is simply to sketch an idea quickly.",
            role:
                "I design the canvas experience, controls, interface structure, and front-end behaviour.",
            process:
                "The project begins with basic drawing interaction and gradually explores tools, canvas behaviour, responsiveness, and lightweight workflows.",
            decisions: [
                {
                    title: "Canvas first",
                    text:
                        "The drawing surface remains the main focus instead of surrounding it with a large interface."
                },
                {
                    title: "Keep controls simple",
                    text:
                        "Common actions should remain easy to find and operate."
                },
                {
                    title: "Prioritise experimentation",
                    text:
                        "The tool should feel quick enough to use for ideas that may only take a few seconds."
                }
            ],
            constraints: [
                "Canvas performance",
                "Pointer interaction",
                "Responsive sizing",
                "Simple controls"
            ],
            impact:
                "SketchSpace provides a small environment for exploring creative interaction and browser-based canvas development.",
            learning:
                "The project is teaching me how direct manipulation interfaces differ from conventional form-based web interfaces."
        }
    }
];