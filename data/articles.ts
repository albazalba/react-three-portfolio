export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  coverImage: string;
  seoTitle: string;
  seoDescription: string;
  relatedProjectSlug?: string;
};

export const articles: Article[] = [
  {
    slug: "building-scalable-react-applications",
    title: "Building Scalable React Applications",
    excerpt:
      "Practical patterns for structuring React applications that remain maintainable as products grow in complexity.",
    content: [
      "Large React applications fail quietly. The first version ships quickly, but without structure, every new feature increases coupling and slows delivery.",
      "A scalable frontend starts with clear boundaries: feature modules, shared UI primitives, and predictable data flow. State should live at the lowest level that still makes sense — not everything belongs in global stores.",
      "For dashboard-heavy products, composition beats inheritance. Build small, testable units and compose them into views. Pair that with TypeScript at the boundaries and you get safer refactors as requirements change.",
      "Performance is part of architecture. Lazy loading, route-level splitting, and memoization where it matters keep interfaces responsive without premature optimization.",
    ],
    tags: ["React", "Frontend Architecture", "TypeScript"],
    publishedAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T09:00:00.000Z",
    coverImage: "/me.png",
    seoTitle:
      "Building Scalable React Applications — Abdul Kader Albaz Aqther",
    seoDescription:
      "Notes on React architecture, TypeScript boundaries and maintainable frontend systems for complex products.",
    relatedProjectSlug: "kinetic-risk-console",
  },
  {
    slug: "nextjs-architecture-decisions",
    title: "Next.js Architecture Decisions That Scale",
    excerpt:
      "How I approach routing, rendering and content structure in Next.js for production portfolios and applications.",
    content: [
      "Next.js gives you flexibility — App Router, static generation, metadata APIs — but that flexibility needs discipline.",
      "I default to static generation for marketing and portfolio surfaces where content changes infrequently. That keeps Core Web Vitals strong and deployment simple.",
      "Metadata should be centralized. Reusable helpers for titles, descriptions, canonical URLs and structured data prevent drift across pages.",
      "Clean URL structures matter for crawlability and long-term maintainability. Human-readable paths beat query parameters every time.",
    ],
    tags: ["Next.js", "Frontend Engineering", "SEO"],
    publishedAt: "2026-04-10T09:00:00.000Z",
    updatedAt: "2026-04-10T09:00:00.000Z",
    coverImage: "/me.png",
    seoTitle: "Next.js Architecture Decisions — Abdul Kader Albaz Aqther",
    seoDescription:
      "Engineering notes on Next.js App Router, static generation and SEO-friendly architecture.",
    relatedProjectSlug: "ai-operations-platform",
  },
  {
    slug: "building-llm-applications-with-python",
    title: "Building LLM Applications with Python",
    excerpt:
      "Connecting React frontends to Python backends and LLM services for practical AI-powered products.",
    content: [
      "LLM applications are not just prompts — they are systems. Data ingestion, tool interfaces, observability and UI clarity matter as much as model choice.",
      "Python backends with FastAPI provide a clean layer for agent orchestration, while the frontend focuses on presenting insights without overwhelming users.",
      "Local models through Ollama are useful for development and privacy-sensitive workflows. Hosted models make sense when latency and scale requirements grow.",
      "The goal is not to showcase AI for its own sake. The interface should make complex operational data feel understandable.",
    ],
    tags: ["AI", "Python", "LLMs", "FastAPI"],
    publishedAt: "2026-05-15T09:00:00.000Z",
    updatedAt: "2026-05-15T09:00:00.000Z",
    coverImage: "/me.png",
    seoTitle: "Building LLM Applications with Python — Abdul Kader Albaz Aqther",
    seoDescription:
      "Practical notes on LLM applications, Python backends and AI agent architecture.",
    relatedProjectSlug: "ai-operations-platform",
  },
  {
    slug: "designing-complex-dashboards",
    title: "Designing Complex Dashboards",
    excerpt:
      "Information architecture patterns for data-heavy interfaces in analytics and operational products.",
    content: [
      "Complex dashboards fail when they try to show everything at once. Start with the decisions users need to make, then design backward.",
      "Hierarchy beats density. Primary metrics, supporting context, and drill-down paths should be visually distinct without relying on excessive color.",
      "Interaction patterns like drag-and-drop layouts need persistent state and predictable undo behavior. Technical architecture must support that from day one.",
      "Accessibility and performance are part of dashboard quality. Keyboard navigation, readable contrast and fast updates keep tools usable under pressure.",
    ],
    tags: ["Frontend Engineering", "Dashboards", "UX"],
    publishedAt: "2026-06-20T09:00:00.000Z",
    updatedAt: "2026-06-20T09:00:00.000Z",
    coverImage: "/me.png",
    seoTitle: "Designing Complex Dashboards — Abdul Kader Albaz Aqther",
    seoDescription:
      "Frontend engineering notes on information architecture for analytics and operational dashboards.",
    relatedProjectSlug: "kinetic-risk-console",
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}

export function getAllArticleSlugs(): string[] {
  return articles.map((article) => article.slug);
}
