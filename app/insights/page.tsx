import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SiteShell from "@/components/layout/SiteShell";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { articles } from "@/data/articles";
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
  pageDescriptions,
  pageMetadata,
} from "@/lib/seo";

export const metadata: Metadata = pageMetadata.insights();

export default function InsightsPage() {
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Insights", path: "/insights" },
  ];

  return (
    <SiteShell>
      <section className="section-padding pt-28">
        <div className="grid-container">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Insights" }]}
          />
          <JsonLd
            data={[
              generateWebPageSchema({
                name: "Insights",
                description: pageDescriptions.insights,
                path: "/insights",
              }),
              generateBreadcrumbSchema(breadcrumbs),
            ]}
          />
          <PageHeader
            label="Writing"
            title="Insights"
            description="Engineering notes on React, Next.js, TypeScript, web architecture and AI application development."
          />

          <div className="mt-12 space-y-0 border-t border-border">
            {articles.map((article) => (
              <article
                key={article.slug}
                className="border-b border-border py-8"
              >
                <time
                  dateTime={article.publishedAt}
                  className="text-xs uppercase tracking-[0.15em] text-muted"
                >
                  {new Date(article.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <h2 className="mt-3 text-2xl font-light">
                  <Link
                    href={`/insights/${article.slug}`}
                    className="transition-colors hover:text-accent"
                  >
                    {article.title}
                  </Link>
                </h2>
                <p className="mt-3 max-w-2xl text-muted">{article.excerpt}</p>
                <Link
                  href={`/insights/${article.slug}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-accent"
                >
                  Read article
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
