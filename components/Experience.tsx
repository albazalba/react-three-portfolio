import Link from "next/link";
import { experiences } from "@/data/site";
import RevealOnScroll from "./ui/RevealOnScroll";
import SectionLabel from "./ui/SectionLabel";

type ExperienceProps = {
  standalone?: boolean;
};

export default function Experience({ standalone = false }: ExperienceProps) {
  return (
    <section
      id="experience"
      className={standalone ? "section-padding" : "section-padding border-t border-border"}
    >
      <div className="grid-container">
        {!standalone && (
          <RevealOnScroll>
            <SectionLabel>Experience</SectionLabel>
            <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-light tracking-tight">
              Work history
            </h2>
          </RevealOnScroll>
        )}

        <div className={standalone ? "" : "mt-16"}>
          {experiences.map((exp, index) => (
            <RevealOnScroll key={exp.id} delay={index * 0.08}>
              <article className="grid gap-6 border-t border-border py-10 md:grid-cols-12 md:gap-8">
                <div className="md:col-span-3">
                  <p className="text-sm text-muted">{exp.period}</p>
                  <p className="mt-1 text-xs text-muted/70">{exp.location}</p>
                </div>
                <div className="md:col-span-9">
                  <h3 className="text-xl font-light">{exp.position}</h3>
                  <p className="mt-1 text-muted">{exp.company}</p>
                  <ul className="mt-6 space-y-2">
                    {exp.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="text-sm leading-relaxed text-muted"
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
        {standalone && (
          <p className="mt-12 text-sm text-muted">
            <Link href="/work" className="hover:text-accent">
              Explore the AI Operations Platform
            </Link>
            {" · "}
            <Link href="/contact" className="hover:text-accent">
              Get in touch
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
