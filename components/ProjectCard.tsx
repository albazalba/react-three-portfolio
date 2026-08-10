import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/site";
import ProjectMockup from "./ui/ProjectMockup";
import { cn } from "@/lib/utils";

type ProjectCardProps = {
  project: Project;
  index: number;
  variant?: "featured" | "compact";
};

export default function ProjectCard({
  project,
  index,
  variant = "featured",
}: ProjectCardProps) {
  const isEven = index % 2 === 0;
  const projectHref = project.featured
    ? `/work/${project.slug}`
    : project.link;

  if (variant === "compact") {
    return (
      <article className="group border-t border-border py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-3">
              <span className="text-xs text-muted">{project.number}</span>
              <h3 className="text-lg font-light">{project.title}</h3>
            </div>
            <p className="max-w-xl text-sm text-muted">{project.description}</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted">
            <span>{project.year}</span>
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 transition-colors hover:text-accent"
                data-cursor="interactive"
              >
                Visit
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </article>
    );
  }

  const cardContent = (
    <>
      <div className={cn("md:col-span-7", !isEven && "md:[direction:ltr]")}>
        <div className="overflow-hidden rounded-sm">
          {project.image ? (
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={project.image}
                alt={`${project.title} product interface preview`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            </div>
          ) : (
            <ProjectMockup
              type={project.mockup}
              className="transition-transform duration-500 group-hover:scale-[1.02]"
            />
          )}
        </div>
      </div>

      <div className={cn("md:col-span-5", !isEven && "md:[direction:ltr]")}>
        <span className="text-xs text-accent">{project.number}</span>
        <h3 className="mt-2 text-2xl font-light transition-transform duration-300 group-hover:translate-x-1 md:text-3xl">
          {project.title}
        </h3>
        <p className="mt-4 leading-relaxed text-muted">{project.description}</p>

        <div className="mt-6 space-y-2 text-sm opacity-70 transition-opacity duration-300 group-hover:opacity-100">
          <p>
            <span className="text-muted">Role — </span>
            {project.role}
          </p>
          <p>
            <span className="text-muted">Tech — </span>
            {project.technologies.join(" · ")}
          </p>
          <p>
            <span className="text-muted">Year — </span>
            {project.year}
          </p>
        </div>

        <div className="mt-8 flex items-center gap-2 text-sm text-muted transition-colors duration-300 group-hover:text-accent">
          <span>View case study</span>
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </>
  );

  if (project.featured) {
    return (
      <Link
        href={projectHref!}
        className={cn(
          "group grid cursor-pointer items-center gap-8 border-t border-border py-12 md:grid-cols-12 md:gap-12 md:py-16",
          !isEven && "md:[direction:rtl]"
        )}
        data-cursor="project"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <article
      className={cn(
        "group border-t border-border py-12 md:py-16",
        "grid items-center gap-8 md:grid-cols-12 md:gap-12",
        !isEven && "md:[direction:rtl]"
      )}
    >
      {cardContent}
    </article>
  );
}
