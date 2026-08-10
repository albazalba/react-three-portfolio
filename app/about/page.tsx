import type { Metadata } from "next";
import SiteShell from "@/components/layout/SiteShell";
import About from "@/components/About";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
  pageDescriptions,
  pageMetadata,
} from "@/lib/seo";

export const metadata: Metadata = pageMetadata.about();

export default function AboutPage() {
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ];

  return (
    <SiteShell>
      <article className="section-padding pt-28">
        <div className="grid-container">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
          <JsonLd
            data={[
              generateWebPageSchema({
                name: "About Abdul Kader Albaz Aqther",
                description: pageDescriptions.about,
                path: "/about",
              }),
              generateBreadcrumbSchema(breadcrumbs),
            ]}
          />
          <About standalone />
        </div>
      </article>
    </SiteShell>
  );
}
