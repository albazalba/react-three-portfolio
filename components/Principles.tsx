"use client";

import { useState } from "react";
import { principles } from "@/data/site";
import RevealOnScroll from "./ui/RevealOnScroll";
import SectionLabel from "./ui/SectionLabel";
import { cn } from "@/lib/utils";

export default function Principles() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="mt-24 border-t border-border pt-16">
      <RevealOnScroll>
        <SectionLabel>Approach</SectionLabel>
        <h3 className="mt-4 text-[clamp(1.75rem,3vw,2.5rem)] font-light tracking-tight">
          How I build
        </h3>
      </RevealOnScroll>

      <div className="mt-12 grid gap-px border border-border bg-border md:grid-cols-2">
        {principles.map((principle, index) => (
          <RevealOnScroll key={principle.number} delay={index * 0.05}>
            <button
              className={cn(
                "group w-full bg-background p-8 text-left transition-colors duration-300 md:p-10",
                active === index && "bg-surface"
              )}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
              data-cursor="interactive"
            >
              <span className="text-xs text-accent">{principle.number}</span>
              <h4 className="mt-3 text-2xl font-light transition-colors duration-300 group-hover:text-accent md:text-3xl">
                {principle.title}
              </h4>
              <p className="mt-4 leading-relaxed text-muted">
                {principle.description}
              </p>
            </button>
          </RevealOnScroll>
        ))}
      </div>
    </div>
  );
}
