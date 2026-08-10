"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import type { Project } from "@/data/site";
import ProjectMockup from "./ui/ProjectMockup";

type CaseStudyProps = {
  project: Project | null;
  onClose: () => void;
};

export default function CaseStudy({ project, onClose }: CaseStudyProps) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!project) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-background/95 backdrop-blur-sm md:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-study-title"
        >
          <button
            className="absolute inset-0"
            onClick={onClose}
            aria-label="Close case study"
          />

          <motion.article
            initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-border bg-surface md:rounded-sm"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-surface/95 px-6 py-4 backdrop-blur-sm">
              <div>
                <span className="text-xs text-accent">{project.number}</span>
                <h2
                  id="case-study-title"
                  className="text-xl font-light tracking-tight"
                >
                  {project.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center text-muted transition-colors hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 md:p-8">
              <ProjectMockup type={project.mockup} className="mb-8" />

              <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                <span>{project.role}</span>
                <span>{project.year}</span>
                <span>{project.technologies.join(" · ")}</span>
              </div>

              <div className="space-y-10">
                {project.caseStudy.map((section, i) => (
                  <section key={section.title}>
                    <div className="mb-3 flex items-baseline gap-4">
                      <span className="text-xs text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-lg font-light">{section.title}</h3>
                    </div>
                    <p className="pl-8 leading-relaxed text-muted">
                      {section.content}
                    </p>
                  </section>
                ))}
              </div>

              {(project.link || project.github) && (
                <div className="mt-10 flex gap-6 border-t border-border pt-8">
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent transition-opacity hover:opacity-70"
                    >
                      View live →
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                      Source code →
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
