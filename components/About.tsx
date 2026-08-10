import RevealOnScroll from "./ui/RevealOnScroll";
import SectionLabel from "./ui/SectionLabel";
import Principles from "./Principles";
import TechStack from "./TechStack";
import CurrentlyExploring from "./CurrentlyExploring";

export default function About() {
  return (
    <section id="about" className="section-padding border-t border-border">
      <div className="grid-container">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-8">
          <RevealOnScroll className="lg:col-span-5">
            <SectionLabel>About</SectionLabel>
            <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-light leading-tight tracking-tight">
              Engineer by trade.
              <br />
              Builder by nature.
            </h2>
          </RevealOnScroll>

          <RevealOnScroll className="lg:col-span-7" delay={0.1}>
            <div className="space-y-6 text-base leading-relaxed text-muted md:text-lg">
              <p>
                Albaz is a software engineer focused on building products —
                from complex dashboards and data-heavy platforms to AI agents
                and intelligent operational systems.
              </p>
              <p>
                His work spans interface design, system architecture, and
                full-stack delivery — with a growing emphasis on AI engineering,
                Python backends, and LLM-powered applications.
              </p>
              <p>
                Based in Dubai, he works with teams globally to ship software
                that is fast, maintainable, and genuinely useful.
              </p>
            </div>
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
