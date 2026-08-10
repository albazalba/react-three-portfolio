import { exploringItems } from "@/data/site";
import RevealOnScroll from "./ui/RevealOnScroll";
import SectionLabel from "./ui/SectionLabel";

export default function CurrentlyExploring() {
  return (
    <div className="mt-24 border-t border-border pt-16">
      <RevealOnScroll>
        <div className="flex items-baseline gap-4">
          <SectionLabel>2026 →</SectionLabel>
        </div>
        <h3 className="mt-4 text-[clamp(1.75rem,3vw,2.5rem)] font-light tracking-tight">
          Currently exploring
        </h3>
        <blockquote className="mt-4 max-w-lg text-muted">
          Expanding from product and web engineering into AI systems and intelligent
          products.
        </blockquote>
      </RevealOnScroll>

      <RevealOnScroll className="mt-10" delay={0.1}>
        <ul className="flex flex-wrap gap-x-6 gap-y-3">
          {exploringItems.map((item) => (
            <li
              key={item}
              className="text-sm text-muted transition-colors duration-300 hover:text-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
      </RevealOnScroll>
    </div>
  );
}
