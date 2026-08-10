import type { Metadata } from "next";
import type { Article } from "@/data/articles";
import type { Project } from "@/data/site";
import { siteConfig } from "@/data/site";

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;
  return url.replace(/\/$/, "");
}

export function absoluteUrl(path = ""): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized === "/" ? "" : normalized}`;
}

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
};

export function generatePageMetadata({
  title,
  description,
  path,
  ogImage = siteConfig.og.default,
  type = "website",
  publishedTime,
  modifiedTime,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage);

  return {
    title,
    description,
    metadataBase: new URL(getSiteUrl()),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.displayName,
      locale: "en_US",
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function generatePersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.displayName,
    alternateName: siteConfig.alternateNames,
    jobTitle: siteConfig.jobTitle,
    description: siteConfig.personDescription,
    url: getSiteUrl(),
    image: absoluteUrl(siteConfig.profileImage),
    email: siteConfig.email,
    sameAs: [siteConfig.links.linkedin, siteConfig.links.github],
    homeLocation: {
      "@type": "Place",
      name: "Dubai, United Arab Emirates",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dubai",
        addressCountry: "AE",
      },
    },
    knowsAbout: siteConfig.knowsAbout,
    worksFor: {
      "@type": "Organization",
      name: siteConfig.currentEmployer.name,
    },
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.displayName,
    url: getSiteUrl(),
    description: siteConfig.description,
    publisher: {
      "@type": "Person",
      name: siteConfig.displayName,
      url: getSiteUrl(),
    },
  };
}

export function generateWebPageSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.displayName,
      url: getSiteUrl(),
    },
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function generateProjectSchema(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    description: project.description,
    url: absoluteUrl(`/work/${project.slug}`),
    image: project.image
      ? absoluteUrl(project.image)
      : absoluteUrl(siteConfig.og.default),
    applicationCategory: "WebApplication",
    operatingSystem: "Web",
    author: {
      "@type": "Person",
      name: siteConfig.displayName,
      url: getSiteUrl(),
    },
    keywords: project.technologies.join(", "),
    programmingLanguage: project.technologies.filter((t) =>
      ["React", "Next.js", "TypeScript", "Python", "JavaScript"].includes(t)
    ),
    dateCreated: project.dateCreated,
    dateModified: project.dateModified,
  };
}

export function generateArticleSchema(article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: absoluteUrl(article.coverImage),
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: siteConfig.displayName,
      url: getSiteUrl(),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/insights/${article.slug}`),
    },
    keywords: article.tags.join(", "),
  };
}

export function generateProfessionalServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: `${siteConfig.displayName} — Software Engineering`,
    description: siteConfig.description,
    url: getSiteUrl(),
    areaServed: {
      "@type": "City",
      name: "Dubai",
      containedInPlace: {
        "@type": "Country",
        name: "United Arab Emirates",
      },
    },
    knowsAbout: siteConfig.knowsAbout,
  };
}

export const pageDescriptions = {
  home: "Albaz Aqther is a software engineer based in Dubai specializing in modern web applications, product engineering and AI-powered systems.",
  about:
    "Learn about Albaz Aqther, a Dubai-based software engineer focused on building modern web products and AI-powered systems.",
  work: "Selected projects by Albaz Aqther including AI platforms, analytics consoles, and production web applications.",
  experience:
    "Professional experience of Albaz Aqther in product engineering, web applications and AI-focused software work.",
  contact:
    "Contact Albaz Aqther, a software engineer based in Dubai, UAE. Available for opportunities locally and globally.",
  insights:
    "Engineering notes on React, Next.js, TypeScript, web architecture and AI application development by Albaz Aqther.",
} as const;

export function generateFaqSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export const pageMetadata = {
  home: () =>
    generatePageMetadata({
      title: "Albaz Aqther — Software Engineer in Dubai",
      description: pageDescriptions.home,
      path: "/",
      ogImage: siteConfig.og.home,
    }),
  about: () =>
    generatePageMetadata({
      title: "About Albaz Aqther — Software Engineer",
      description: pageDescriptions.about,
      path: "/about",
      ogImage: siteConfig.og.about,
    }),
  work: () =>
    generatePageMetadata({
      title: "Selected Work — Albaz Aqther",
      description: pageDescriptions.work,
      path: "/work",
      ogImage: siteConfig.og.work,
    }),
  project: (project: Project) =>
    generatePageMetadata({
      title: project.seoTitle,
      description: project.seoDescription,
      path: `/work/${project.slug}`,
      ogImage: project.ogImage || siteConfig.og.work,
    }),
  experience: () =>
    generatePageMetadata({
      title: "Experience — Albaz Aqther",
      description: pageDescriptions.experience,
      path: "/experience",
      ogImage: siteConfig.og.default,
    }),
  contact: () =>
    generatePageMetadata({
      title: "Contact Albaz Aqther",
      description: pageDescriptions.contact,
      path: "/contact",
      ogImage: siteConfig.og.default,
    }),
  insights: () =>
    generatePageMetadata({
      title: "Insights — Albaz Aqther",
      description: pageDescriptions.insights,
      path: "/insights",
      ogImage: siteConfig.og.insights,
    }),
  article: (article: Article) =>
    generatePageMetadata({
      title: article.seoTitle,
      description: article.seoDescription,
      path: `/insights/${article.slug}`,
      ogImage: article.coverImage,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    }),
};
