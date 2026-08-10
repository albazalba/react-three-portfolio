import fs from "node:fs";
import path from "node:path";
import { articles } from "../data/articles";
import { absoluteUrl, getSiteUrl } from "../lib/seo";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateRssFeed(): string {
  const siteUrl = getSiteUrl();
  const items = articles
    .map(
      (article) => `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${absoluteUrl(`/insights/${article.slug}`)}</link>
      <guid isPermaLink="true">${absoluteUrl(`/insights/${article.slug}`)}</guid>
      <description>${escapeXml(article.excerpt)}</description>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
    </item>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Insights — Albaz Aqther</title>
    <link>${siteUrl}/insights</link>
    <description>Engineering notes on React, Next.js, TypeScript, web architecture and AI application development.</description>
    <language>en-us</language>${items}
  </channel>
</rss>`;
}

const outputPath = path.join(process.cwd(), "out", "rss.xml");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generateRssFeed(), "utf8");
console.log(`RSS feed written to ${outputPath}`);
