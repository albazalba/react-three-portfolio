export const siteConfig = {
  legalName: "Abdul Kader Albaz Aqther",
  alternateNames: ["Abdul Kader Albaz", "Albaz Aqther"],
  displayName: "Albaz Aqther",
  shortName: "Albaz / Aqther",
  jobTitle: "Software Engineer",
  title: "Abdul Kader Albaz Aqther — Software Engineer in Dubai",
  description:
    "Abdul Kader Albaz Aqther is a software engineer based in Dubai specializing in React, Next.js, TypeScript and AI-powered applications.",
  personDescription:
    "Software engineer specializing in frontend engineering, React, Next.js, TypeScript and AI-powered applications.",
  url: "https://albazaqther.com",
  location: "Dubai, UAE",
  email: "albazalba10@gmail.com",
  profileImage: "/me.png",
  links: {
    github: "https://github.com/albazalba",
    linkedin: "https://www.linkedin.com/in/albazaqther/",
  },
  availability: "Available for opportunities",
  currentEmployer: {
    name: "Evolvex Technologies",
    public: true,
  },
  knowsAbout: [
    "Software Engineering",
    "Frontend Engineering",
    "React",
    "Next.js",
    "TypeScript",
    "AI Applications",
    "LLMs",
    "AI Agents",
    "Python",
    "Frontend Architecture",
  ],
  og: {
    default: "/me.png",
    home: "/me.png",
    about: "/me.png",
    work: "/me.png",
    insights: "/me.png",
  },
};

export type CaseStudySection = {
  title: string;
  content: string;
};

export type Project = {
  id: string;
  slug: string;
  number: string;
  title: string;
  description: string;
  role: string;
  technologies: string[];
  year: string;
  featured: boolean;
  mockup: "ai-ops" | "risk" | "pulse" | "trading" | "default";
  image?: string;
  link?: string;
  github?: string;
  seoTitle: string;
  seoDescription: string;
  ogImage?: string;
  dateCreated?: string;
  dateModified?: string;
  caseStudy: CaseStudySection[];
};

export const featuredProjects: Project[] = [
  {
    id: "ai-ops-platform",
    slug: "ai-operations-platform",
    number: "01",
    title: "AI Operations Platform",
    description:
      "An AI-powered operations platform designed to help businesses understand their sites, metrics and operational data through intelligent agents.",
    role: "Lead Engineer",
    technologies: [
      "React",
      "Next.js",
      "Python",
      "FastAPI",
      "PostgreSQL",
      "LLMs",
      "Ollama",
    ],
    year: "2025 — Present",
    featured: true,
    mockup: "ai-ops",
    seoTitle: "AI Operations Platform — Abdul Kader Albaz Aqther",
    seoDescription:
      "Case study on an AI-powered operations platform built with React, Next.js, Python, FastAPI and LLMs by Abdul Kader Albaz Aqther.",
    dateCreated: "2025-01-01",
    dateModified: "2026-08-01",
    caseStudy: [
      {
        title: "Overview",
        content:
          "An ongoing AI engineering initiative building an operations platform where intelligent agents help teams interpret site health, metrics, and operational signals. The product connects frontend dashboards to Python backends and local or hosted LLMs.",
      },
      {
        title: "Problem",
        content:
          "Operational data lives across dashboards, logs, and ad-hoc reports. Teams spend time switching contexts instead of understanding what matters. The goal was to create a single surface where AI agents could surface insights without adding complexity.",
      },
      {
        title: "Approach",
        content:
          "Designed a modular agent architecture with clear separation between data ingestion, reasoning, and presentation. Prioritized fast iteration on the interface while keeping backend contracts stable and testable.",
      },
      {
        title: "Architecture",
        content:
          "Next.js frontend with TypeScript, FastAPI services for agent orchestration, PostgreSQL for structured data, and Ollama for local LLM inference. Agents communicate through defined tool interfaces with audit-friendly logging.",
      },
      {
        title: "Result",
        content:
          "A working platform prototype with agent-driven operational insights, extensible tool definitions, and a dashboard that scales as new data sources are added. Currently evolving as an active engineering project.",
      },
      {
        title: "Technology",
        content:
          "React · Next.js · TypeScript · Python · FastAPI · PostgreSQL · LLMs · Ollama · MCP",
      },
    ],
  },
  {
    id: "kinetic-risk-console",
    slug: "kinetic-risk-console",
    number: "02",
    title: "Kinetic Risk Console",
    description:
      "A modern risk-management and analytics interface focused on presenting complex financial and operational information through highly usable dashboards.",
    role: "Frontend Lead",
    technologies: ["React", "TypeScript", "Data visualization", "APIs"],
    year: "2024 — Present",
    featured: true,
    mockup: "risk",
    seoTitle: "Kinetic Risk Console — Abdul Kader Albaz Aqther",
    seoDescription:
      "A modern risk-management and analytics dashboard focused on information architecture, React and TypeScript.",
    dateCreated: "2024-06-01",
    dateModified: "2026-08-01",
    caseStudy: [
      {
        title: "Overview",
        content:
          "A production dashboard for risk and analytics workflows, built to handle dense data without overwhelming the user. Focus on information architecture, interaction patterns, and performance at scale.",
      },
      {
        title: "Problem",
        content:
          "Risk teams needed to monitor multiple data streams with drag-and-drop layouts, real-time updates, and consistent state across complex widget configurations. Legacy interfaces were slow and difficult to extend.",
      },
      {
        title: "Approach",
        content:
          "Led frontend architecture with reusable widget primitives, Redux Toolkit for predictable state, and React DnD Kit for intuitive layout editing. Established code review and testing standards for real-time data flows.",
      },
      {
        title: "Architecture",
        content:
          "Component-driven React application with normalized state, lazy-loaded chart modules, and API layers abstracted behind typed hooks. Drag-and-drop zones with collision detection and persistent layout serialization.",
      },
      {
        title: "Result",
        content:
          "A responsive, production-grade console used daily by operations teams. Improved interaction speed, reduced layout configuration time, and established patterns reused across the product surface.",
      },
      {
        title: "Technology",
        content:
          "React · TypeScript · Redux Toolkit · Ant Design · React DnD Kit · REST APIs",
      },
    ],
  },
  {
    id: "pulse-feedback",
    slug: "pulse-feedback-platform",
    number: "03",
    title: "Pulse — Feedback Platform",
    description:
      "A comprehensive feedback application with advanced UI components, data tables, and state management for enterprise teams.",
    role: "Fullstack Developer",
    technologies: [
      "React",
      "TypeScript",
      "TanStack Query",
      "MUI",
      "AWS",
      "Redux",
    ],
    year: "2022 — 2024",
    featured: true,
    mockup: "pulse",
    seoTitle: "Pulse Feedback Platform — Abdul Kader Albaz Aqther",
    seoDescription:
      "Enterprise feedback platform built with React, TypeScript, TanStack Query and AWS.",
    dateCreated: "2022-03-01",
    dateModified: "2024-12-01",
    caseStudy: [
      {
        title: "Overview",
        content:
          "A production feedback platform built for teams to collect, manage, and act on structured input. Combines complex table views, filtering, and form workflows in a cohesive interface.",
      },
      {
        title: "Problem",
        content:
          "Organizations needed a centralized system for feedback with role-based access, real-time updates, and performant data grids handling large datasets without degrading the user experience.",
      },
      {
        title: "Approach",
        content:
          "Built with reusable Material UI components, TanStack Query for server state, and Redux for global application state. Prioritized table performance and predictable data fetching patterns.",
      },
      {
        title: "Architecture",
        content:
          "React frontend with typed API layers, TanStack Table for advanced grid interactions, AWS-hosted backend services, and Redux for cross-view state consistency.",
      },
      {
        title: "Result",
        content:
          "A stable, production-grade platform used by teams to manage feedback workflows with responsive layouts and maintainable frontend architecture.",
      },
      {
        title: "Technology",
        content:
          "React · TypeScript · TanStack Query · Material UI · TanStack Table · AWS · Redux",
      },
    ],
  },
  {
    id: "ai-trading-system",
    slug: "ai-trading-system",
    number: "04",
    title: "AI Trading System",
    description:
      "An experimental algorithmic trading system combining market data, machine learning, backtesting, and MT5 integration.",
    role: "Engineer",
    technologies: [
      "Python",
      "Machine learning",
      "Backtesting",
      "MT5",
      "Exness",
    ],
    year: "2025",
    featured: true,
    mockup: "trading",
    seoTitle: "AI Trading System — Abdul Kader Albaz Aqther",
    seoDescription:
      "An experimental algorithmic trading and backtesting system combining Python, machine learning and market data.",
    dateCreated: "2025-02-01",
    dateModified: "2026-08-01",
    caseStudy: [
      {
        title: "Overview",
        content:
          "A personal engineering experiment exploring algorithmic trading — not a commercial product claim. Combines Python pipelines, strategy backtesting, and broker integration for learning and iteration.",
      },
      {
        title: "Problem",
        content:
          "Understanding how automated strategies behave across market conditions requires reproducible backtests, clean data pipelines, and safe integration with live trading environments.",
      },
      {
        title: "Approach",
        content:
          "Built incrementally: data ingestion first, then strategy modules, then backtesting framework, then cautious live integration. Every layer is inspectable and logged.",
      },
      {
        title: "Architecture",
        content:
          "Python services for market data ingestion and feature engineering, modular strategy definitions, backtesting engine with performance metrics, and MT5/Exness bridge for execution experiments.",
      },
      {
        title: "Result",
        content:
          "A functional research environment for testing strategies and studying market behavior. Presented as an engineering experiment — outcomes vary and past performance is not indicative of future results.",
      },
      {
        title: "Technology",
        content:
          "Python · Pandas · scikit-learn · Backtesting · MT5 · Exness API",
      },
    ],
  },
];

export const additionalProjects: Project[] = [
  {
    id: "leave-tracker",
    slug: "leave-tracker",
    number: "05",
    title: "Leave Tracker",
    description:
      "Employee leave management system with a modern, responsive interface.",
    role: "Fullstack Developer",
    technologies: ["React", "TanStack Query", "MUI", "AWS", "Redux"],
    year: "2022",
    featured: false,
    mockup: "default",
    image: "/onleave.png",
    seoTitle: "Leave Tracker — Abdul Kader Albaz Aqther",
    seoDescription: "Employee leave management system built with React and AWS.",
    caseStudy: [],
  },
  {
    id: "antstack-com",
    slug: "antstack-com",
    number: "06",
    title: "Antstack.com",
    description:
      "Company website built with Astro, Strapi CMS and Mailchimp integration.",
    role: "Fullstack Developer",
    technologies: ["Astro", "Strapi", "Mailchimp"],
    year: "2021",
    featured: false,
    mockup: "default",
    image: "/antstack.png",
    seoTitle: "Antstack.com — Abdul Kader Albaz Aqther",
    seoDescription: "Company website built with Astro and Strapi CMS.",
    caseStudy: [],
  },
  {
    id: "cyberpwn",
    slug: "cyberpwn",
    number: "07",
    title: "Cyberpwn",
    description:
      "Modern web application with Next.js, Tailwind, Strapi CMS and Mailchimp.",
    role: "Fullstack Developer",
    technologies: ["Next.js", "Tailwind", "Strapi", "ShadCN"],
    year: "2023",
    featured: false,
    mockup: "default",
    image: "/cyberpwn.png",
    seoTitle: "Cyberpwn — Abdul Kader Albaz Aqther",
    seoDescription: "Modern web application with Next.js and Strapi CMS.",
    caseStudy: [],
  },
  {
    id: "real-estate",
    slug: "real-estate-app",
    number: "08",
    title: "Real Estate App",
    description: "Full-stack real estate application built with the MERN stack.",
    role: "Developer",
    technologies: ["MongoDB", "Express", "React", "Node.js"],
    year: "2020",
    featured: false,
    mockup: "default",
    image: "/Corplac.png",
    seoTitle: "Real Estate App — Abdul Kader Albaz Aqther",
    seoDescription: "Full-stack real estate application built with the MERN stack.",
    caseStudy: [],
  },
  {
    id: "restaurant-finder",
    slug: "restaurant-finder",
    number: "09",
    title: "Restaurant Finder",
    description:
      "Next.js application for finding and exploring restaurants.",
    role: "Developer",
    technologies: ["Next.js"],
    year: "2021",
    featured: false,
    mockup: "default",
    image: "/restaurant.png",
    seoTitle: "Restaurant Finder — Abdul Kader Albaz Aqther",
    seoDescription: "Next.js application for finding and exploring restaurants.",
    caseStudy: [],
  },
];

export type Experience = {
  id: string;
  position: string;
  company: string;
  period: string;
  location: string;
  highlights: string[];
};

export const experiences: Experience[] = [
  {
    id: "evolvex",
    position: "Frontend Developer Lead",
    company: "Evolvex Technologies",
    period: "Dec 2024 — Present",
    location: "Dubai, UAE",
    highlights: [
      "Building production React applications for analytics and enterprise products",
      "Designing reusable frontend architecture with Redux Toolkit and Ant Design",
      "Complex dashboards, drag-and-drop layouts, and data-heavy interfaces",
      "API integrations with real-time data and performance optimization",
      "Leading code reviews, sprint planning, and mentoring six developers",
    ],
  },
  {
    id: "antstack-mts2",
    position: "Fullstack Developer",
    company: "AntStack Technologies",
    period: "May 2021 — Dec 2024",
    location: "Bangalore, India",
    highlights: [
      "Built scalable web applications with Next.js, React, MongoDB, and AWS",
      "Integrated AWS Cognito authentication supporting 35,000+ user accounts",
      "Led multiple projects with secure payment solutions and compliance standards",
      "Implemented test-driven development and conducted code reviews",
      "Optimized page load times and application state management",
    ],
  },
  {
    id: "antstack-mts1",
    position: "Frontend Developer",
    company: "AntStack Technologies",
    period: "July 2019 — May 2021",
    location: "Bangalore, India",
    highlights: [
      "Delivered key projects on tight deadlines in a fast-paced environment",
      "Implemented testing with Jest, React Testing Library, and Cypress",
      "Achieved Lighthouse performance scores above industry benchmarks",
      "Applied lazy loading, code splitting, and asset optimization",
      "Collaborated with designers in Figma and integrated REST/GraphQL APIs",
    ],
  },
];

export const principles = [
  {
    number: "01",
    title: "Clarity",
    description:
      "Complex systems should feel simple to the person using them.",
  },
  {
    number: "02",
    title: "Architecture",
    description:
      "Good interfaces are built on good foundations.",
  },
  {
    number: "03",
    title: "Performance",
    description:
      "Fast interfaces are part of the product experience.",
  },
  {
    number: "04",
    title: "Iteration",
    description: "Build, measure, refine, repeat.",
  },
];

export const techCategories = [
  {
    label: "AI",
    items: [
      "LLMs",
      "AI Agents",
      "LangChain",
      "LlamaIndex",
      "MCP",
      "Ollama",
    ],
  },
  {
    label: "Backend",
    items: ["Node.js", "Python", "FastAPI", "PostgreSQL"],
  },
  {
    label: "Cloud",
    items: ["AWS", "Docker", "Databricks"],
  },
  {
    label: "State & Data",
    items: ["Redux", "Zustand", "TanStack Query"],
  },
  {
    label: "Frontend",
    items: [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Tailwind",
      "MUI",
      "SCSS",
    ],
  },
];

export const exploringItems = [
  "AI Agents",
  "LLM Applications",
  "Python",
  "Machine Learning",
  "RAG",
  "MCP",
  "Local LLMs",
  "AI-powered developer tools",
  "Algorithmic trading systems",
];

export const personalInterests = [
  "Photography",
  "Travel",
  "Markets",
  "Product design",
  "Technology",
];

export function getFeaturedProjects(): Project[] {
  return featuredProjects;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return featuredProjects.find((project) => project.slug === slug);
}

export function getAllProjectSlugs(): string[] {
  return featuredProjects.map((project) => project.slug);
}

export function getAllProjects(): Project[] {
  return [...featuredProjects, ...additionalProjects];
}
