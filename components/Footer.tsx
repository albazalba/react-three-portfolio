"use client";

import { ArrowUp } from "lucide-react";
import { siteConfig } from "@/data/site";
import { scrollToSection } from "@/lib/utils";

export default function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="grid-container">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium tracking-[0.15em]">
              ALBAZ / AQTHER
            </p>
            <p className="mt-2 text-sm text-muted">
              Software Engineer · Dubai
            </p>
            <p className="mt-6 text-xs text-muted">
              © 2026 {siteConfig.name}
            </p>
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            <div className="flex gap-6 text-sm text-muted">
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                GitHub
              </a>
              <a
                href={siteConfig.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                LinkedIn
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="transition-colors hover:text-foreground"
              >
                Email
              </a>
            </div>

            <button
              onClick={() => scrollToSection("hero")}
              className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-accent"
              aria-label="Back to top"
            >
              Back to top
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
