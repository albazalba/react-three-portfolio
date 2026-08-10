import type { Metadata } from "next";
import SiteShell from "@/components/layout/SiteShell";
import Experience from "@/components/Experience";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
  pageDescriptions,
  pageMetadata,
} from "@/lib/seo";

export const metadata: Metadata = pageMetadata.experience();

export default function ExperiencePage() {
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Experience", path: "/experience" },
  ];

  return (
    <SiteShell>
      <div className="section-padding pt-28">
        <div className="grid-container">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Experience" },
            ]}
          />
          <JsonLd
            data={[
              generateWebPageSchema({
                name: "Experience",
                description: pageDescriptions.experience,
                path: "/experience",
              }),
              generateBreadcrumbSchema(breadcrumbs),
            ]}
          />
          <PageHeader
            label="Career"
            title="Work history"
            description="Professional experience in frontend engineering, product development and AI-focused software work since 2021."
          />
        </div>
      </div>
      <Experience standalone />
    </SiteShell>
  );
}
