import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import SiteShell from "@/components/layout/SiteShell";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import {
  getAllArticleSlugs,
  getArticleBySlug,
} from "@/data/articles";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  pageMetadata,
} from "@/lib/seo";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return pageMetadata.article(article);
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) notFound();

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Insights", path: "/insights" },
    { name: article.title, path: `/insights/${article.slug}` },
  ];

  return (
    <SiteShell>
      <article className="section-padding pt-28">
        <div className="grid-container max-w-3xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Insights", href: "/insights" },
              { label: article.title },
            ]}
          />
          <JsonLd
            data={[
              generateArticleSchema(article),
              generateBreadcrumbSchema(breadcrumbs),
            ]}
          />

          <header className="mb-10">
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
            <h1 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-light leading-tight tracking-tight">
              {article.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              {article.excerpt}
            </p>
            <p className="mt-4 text-sm text-muted">
              {article.tags.join(" · ")}
            </p>
          </header>

          <div className="space-y-6 text-base leading-relaxed text-muted">
            {article.content.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          <footer className="mt-12 flex flex-wrap gap-6 border-t border-border pt-8 text-sm">
            {article.relatedProjectSlug && (
              <Link
                href={`/work/${article.relatedProjectSlug}`}
                className="inline-flex items-center gap-2 text-muted transition-colors hover:text-accent"
              >
                Related project
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-muted transition-colors hover:text-foreground"
            >
              All insights
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </footer>
        </div>
      </article>
    </SiteShell>
  );
}
