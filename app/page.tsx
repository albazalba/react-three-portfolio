import SiteShell from "@/components/layout/SiteShell";
import Hero from "@/components/Hero";
import ProjectShowcase from "@/components/ProjectShowcase";
import AeoSection, { profileFaqs } from "@/components/seo/AeoSection";
import JsonLd from "@/components/seo/JsonLd";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { generateFaqSchema } from "@/lib/seo";

export default function Home() {
  return (
    <SiteShell>
      <JsonLd data={generateFaqSchema(profileFaqs)} />
      <Hero />
      <ProjectShowcase showAdditional={false} linkToWorkPage />
      <section className="section-padding border-t border-border">
        <div className="grid-container">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                href: "/about",
                label: "About",
                text: "Engineering background, approach and current direction.",
              },
              {
                href: "/experience",
                label: "Experience",
                text: "Professional history in product and web engineering.",
              },
              {
                href: "/insights",
                label: "Insights",
                text: "Notes on React, Next.js, AI engineering and architecture.",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group border border-border p-6 transition-colors hover:border-accent/40"
              >
                <h2 className="text-lg font-light">{item.label}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.text}
                </p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm text-muted transition-colors group-hover:text-accent">
                  Read more
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <AeoSection />
    </SiteShell>
  );
}
