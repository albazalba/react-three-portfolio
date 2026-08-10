"use client";

import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/data/site";
import RevealOnScroll from "./ui/RevealOnScroll";

type ContactProps = {
  standalone?: boolean;
};

export default function Contact({ standalone = false }: ContactProps) {
  const TitleTag = standalone ? "h1" : "h2";

  return (
    <section
      id="contact"
      className={
        standalone ? "section-padding pb-24" : "section-padding border-t border-border"
      }
    >
      <div className="grid-container">
        <RevealOnScroll>
          <TitleTag className="text-[clamp(2.5rem,6vw,4.5rem)] font-light leading-[1.1] tracking-tight">
            Let&apos;s build something
            <br />
            worth using.
          </TitleTag>
          <p className="mt-8 text-muted">
            Software engineer based in {siteConfig.location}. Available for
            opportunities in Dubai, the UAE and remote/global teams.
          </p>
        </RevealOnScroll>

        <RevealOnScroll className="mt-16" delay={0.1}>
          <div className="flex flex-col gap-6 md:flex-row md:gap-16">
            <a
              href={`mailto:${siteConfig.email}`}
              className="group text-lg transition-colors hover:text-accent"
              data-cursor="interactive"
            >
              Email
              <ArrowUpRight className="ml-1 inline h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
            <a
              href={siteConfig.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group text-lg text-muted transition-colors hover:text-foreground"
              data-cursor="interactive"
            >
              LinkedIn
              <ArrowUpRight className="ml-1 inline h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group text-lg text-muted transition-colors hover:text-foreground"
              data-cursor="interactive"
            >
              GitHub
              <ArrowUpRight className="ml-1 inline h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="mt-24" delay={0.2}>
          <a
            href={`mailto:${siteConfig.email}`}
            className="inline-flex items-center gap-3 rounded-full border border-border px-8 py-4 text-sm uppercase tracking-[0.2em] transition-all duration-300 hover:border-accent hover:text-accent"
            data-cursor="interactive"
          >
            Get in touch
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </RevealOnScroll>
      </div>
    </section>
  );
}
