import Link from "next/link";
import RevealOnScroll from "./ui/RevealOnScroll";
import SectionLabel from "./ui/SectionLabel";
import Principles from "./Principles";
import TechStack from "./TechStack";
import CurrentlyExploring from "./CurrentlyExploring";
import { siteConfig } from "@/data/site";

type AboutProps = {
  standalone?: boolean;
};

export default function About({ standalone = false }: AboutProps) {
  const TitleTag = standalone ? "h1" : "h2";

  return (
    <section
      id="about"
      className={standalone ? "" : "section-padding border-t border-border"}
    >
      <div className="grid-container">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-8">
          <RevealOnScroll className="lg:col-span-5">
            {!standalone && <SectionLabel>About</SectionLabel>}
            <TitleTag className="mt-4 text-[clamp(2rem,4vw,3rem)] font-light leading-tight tracking-tight">
              Engineer by trade.
              <br />
              Builder by nature.
            </TitleTag>
          </RevealOnScroll>

          <RevealOnScroll className="lg:col-span-7" delay={0.1}>
            <div className="space-y-6 text-base leading-relaxed text-muted md:text-lg">
              <p>
                {siteConfig.displayName} is a software engineer based in Dubai,
                UAE, focused on building products — from complex dashboards and
                data-heavy platforms to AI agents and intelligent operational
                systems.
              </p>
              <p>
                His work spans interface design, system architecture, and
                full-stack delivery — with a growing emphasis on AI engineering,
                Python backends, and LLM-powered applications.
              </p>
              <p>
                Professional experience building for the web since 2021. Available
                for opportunities in Dubai, the UAE and remote/global teams.
              </p>
            </div>
            {standalone && (
              <p className="mt-8 text-sm text-muted">
                <Link href="/experience" className="hover:text-accent">
                  View experience
                </Link>
                {" · "}
                <Link href="/work" className="hover:text-accent">
                  Explore selected work
                </Link>
              </p>
            )}
          </RevealOnScroll>
        </div>

        <Principles />
        <TechStack />
        <CurrentlyExploring />

        <RevealOnScroll className="mt-24 border-t border-border pt-16">
          <SectionLabel>Beyond the browser</SectionLabel>
          <p className="mt-4 max-w-lg text-muted">
            Technology is the main craft, but curiosity extends beyond code.
          </p>
          <p className="mt-6 text-sm tracking-wide text-muted">
            Photography · Travel · Markets · Product design · Technology
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
