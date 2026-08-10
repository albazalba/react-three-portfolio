"use client";

import { useState } from "react";
import { featuredProjects, additionalProjects } from "@/data/site";
import RevealOnScroll from "./ui/RevealOnScroll";
import SectionLabel from "./ui/SectionLabel";
import ProjectCard from "./ProjectCard";
import CaseStudy from "./CaseStudy";
import type { Project } from "@/data/site";

export default function ProjectShowcase() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <section id="work" className="section-padding">
      <div className="grid-container">
        <RevealOnScroll>
          <SectionLabel>Portfolio</SectionLabel>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-light tracking-tight">
            Selected Work
          </h2>
          <blockquote className="mt-4 max-w-xl text-muted">
            A selection of products, platforms and experiments I&apos;ve worked
            on.
          </blockquote>
        </RevealOnScroll>

        <div className="mt-12 md:mt-16">
          {featuredProjects.map((project, index) => (
            <RevealOnScroll key={project.id} delay={index * 0.05}>
              <ProjectCard
                project={project}
                index={index}
                onSelect={setSelectedProject}
              />
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll className="mt-20">
          <SectionLabel>More work</SectionLabel>
          <h3 className="mt-4 text-xl font-light text-muted">
            Additional projects
          </h3>
        </RevealOnScroll>

        <div className="mt-8">
          {additionalProjects.map((project, index) => (
            <RevealOnScroll key={project.id} delay={index * 0.03}>
              <ProjectCard
                project={project}
                index={index}
                onSelect={setSelectedProject}
                variant="compact"
              />
            </RevealOnScroll>
          ))}
        </div>
      </div>

      <CaseStudy
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
