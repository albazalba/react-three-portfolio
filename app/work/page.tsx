import type { Metadata } from "next";
import SiteShell from "@/components/layout/SiteShell";
import ProjectShowcase from "@/components/ProjectShowcase";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
  pageDescriptions,
  pageMetadata,
} from "@/lib/seo";

export const metadata: Metadata = pageMetadata.work();

export default function WorkPage() {
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Work", path: "/work" },
  ];

  return (
    <SiteShell>
      <div className="section-padding pt-28">
        <div className="grid-container">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Work" }]} />
          <JsonLd
            data={[
              generateWebPageSchema({
                name: "Selected Work",
                description: pageDescriptions.work,
                path: "/work",
              }),
              generateBreadcrumbSchema(breadcrumbs),
            ]}
          />
          <PageHeader
            label="Portfolio"
            title="Selected Work"
            description="Products, platforms and engineering experiments across AI systems, analytics interfaces and production web applications."
          />
        </div>
      </div>
      <ProjectShowcase />
    </SiteShell>
  );
}
