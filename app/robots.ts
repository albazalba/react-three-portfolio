import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_private/", "/admin/", "/dashboard/", "/internal/"],
      },
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
