import type { Metadata } from "next";
import SiteShell from "@/components/layout/SiteShell";
import Contact from "@/components/Contact";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
  pageDescriptions,
  pageMetadata,
} from "@/lib/seo";

export const metadata: Metadata = pageMetadata.contact();

export default function ContactPage() {
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <SiteShell>
      <div className="section-padding pt-28">
        <div className="grid-container">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Contact" }]}
          />
          <JsonLd
            data={[
              generateWebPageSchema({
                name: "Contact",
                description: pageDescriptions.contact,
                path: "/contact",
              }),
              generateBreadcrumbSchema(breadcrumbs),
            ]}
          />
        </div>
      </div>
      <Contact standalone />
    </SiteShell>
  );
}
