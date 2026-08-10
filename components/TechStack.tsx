import { techCategories } from "@/data/site";
import RevealOnScroll from "./ui/RevealOnScroll";
import SectionLabel from "./ui/SectionLabel";

export default function TechStack() {
  return (
    <div className="mt-24 border-t border-border pt-16">
      <RevealOnScroll>
        <SectionLabel>Stack</SectionLabel>
        <h3 className="mt-4 text-xl font-light text-muted">Technology</h3>
      </RevealOnScroll>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {techCategories.map((category, index) => (
          <RevealOnScroll key={category.label} delay={index * 0.05}>
            <div>
              <h4 className="mb-3 text-xs uppercase tracking-[0.15em] text-muted">
                {category.label}
              </h4>
              <p className="text-sm leading-relaxed text-foreground/80">
                {category.items.join(" · ")}
              </p>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </div>
  );
}
