import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import SiteShell from "@/components/layout/SiteShell";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import ProjectMockup from "@/components/ui/ProjectMockup";
import {
  getAllProjectSlugs,
  getProjectBySlug,
} from "@/data/site";
import {
  generateBreadcrumbSchema,
  generateProjectSchema,
  generateWebPageSchema,
  pageMetadata,
} from "@/lib/seo";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return pageMetadata.project(project);
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Work", path: "/work" },
    { name: project.title, path: `/work/${project.slug}` },
  ];

  return (
    <SiteShell>
      <article className="section-padding pt-28">
        <div className="grid-container max-w-4xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Work", href: "/work" },
              { label: project.title },
            ]}
          />
          <JsonLd
            data={[
              generateProjectSchema(project),
              generateWebPageSchema({
                name: project.title,
                description: project.description,
                path: `/work/${project.slug}`,
              }),
              generateBreadcrumbSchema(breadcrumbs),
            ]}
          />

          <header className="mb-10">
            <p className="text-xs text-accent">{project.number}</p>
            <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-light tracking-tight">
              {project.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              {project.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <span>{project.role}</span>
              <span>{project.year}</span>
              <span>{project.technologies.join(" · ")}</span>
            </div>
          </header>

          <ProjectMockup type={project.mockup} className="mb-12" />

          <div className="space-y-12">
            {project.caseStudy.map((section, index) => (
              <section key={section.title}>
                <div className="mb-3 flex items-baseline gap-4">
                  <span className="text-xs text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-xl font-light">{section.title}</h2>
                </div>
                <p className="pl-8 leading-relaxed text-muted">
                  {section.content}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-6 border-t border-border pt-8">
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              Related insights
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/work"
              className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              Back to work
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>
    </SiteShell>
  );
}
