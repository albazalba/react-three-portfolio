# SEO & Discoverability Guide

This document explains how SEO, GEO (Generative Engine Optimization), and AEO (Answer Engine Optimization) are implemented for **Albaz Aqther**'s portfolio, and how to maintain it.

## Environment

Set the canonical domain in `.env.local` or your hosting provider:

```bash
NEXT_PUBLIC_SITE_URL=https://albazaqther.com
```

Never hard-code `localhost` in metadata. All canonical URLs, Open Graph URLs, and structured data derive from this variable via `lib/seo.ts`.

## Site Structure

| URL | Purpose |
|-----|---------|
| `/` | Homepage with Person, WebSite, FAQ schema |
| `/about` | Biography, principles, tech stack |
| `/work` | Project index |
| `/work/[slug]` | Individual case studies |
| `/experience` | Work history |
| `/contact` | Contact information |
| `/insights` | Article index |
| `/insights/[slug]` | Individual articles |

## Sitemap

**URL:** `/sitemap.xml`  
**Source:** `app/sitemap.ts`

Generated automatically at build time. Includes homepage, static pages, featured project case studies, and insight articles. Excludes API routes, admin paths, and pages with `noindex`.

### Submit to Search Console

1. Open [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://albazaqther.com`
3. Verify ownership (DNS TXT record or HTML file)
4. Go to **Sitemaps** → submit `https://albazaqther.com/sitemap.xml`
5. Repeat for [Bing Webmaster Tools](https://www.bing.com/webmasters)

## Robots.txt

**URL:** `/robots.txt`  
**Source:** `app/robots.ts`

Allows all legitimate crawlers. Disallows `/api/`, `/_private/`, `/admin/`, `/dashboard/`, `/internal/`. Does not block CSS, JS, or images.

AI/search crawlers are not blocked — the public portfolio is intended to be discoverable.

## Metadata System

All page metadata is centralized in `lib/seo.ts`:

- `generatePageMetadata()` — title, description, canonical, Open Graph, Twitter cards
- `pageMetadata.*()` — presets for each page type
- `pageDescriptions` — shared descriptions for JSON-LD consistency

### Adding a New Page

1. Create the route under `app/`
2. Add a `pageMetadata` preset in `lib/seo.ts`
3. Export `metadata` from the page
4. Add JSON-LD via `<JsonLd />` where appropriate
5. Add the URL to `app/sitemap.ts`

## Structured Data (JSON-LD)

| Schema | Where |
|--------|-------|
| `Person` | Root layout (global) |
| `WebSite` | Root layout |
| `ProfessionalService` | Root layout |
| `FAQPage` | Homepage |
| `WebPage` | About, Work, Experience, Contact, Insights |
| `BreadcrumbList` | Nested pages (work, insights) |
| `SoftwareApplication` | Project case studies |
| `Article` | Insight articles |

Validate with [Google Rich Results Test](https://search.google.com/test/rich-results) or [Schema Markup Validator](https://validator.schema.org/).

## Open Graph & Social Previews

Each page has unique `og:title`, `og:description`, `og:url`, `og:type`, and `og:image`. Twitter cards use `summary_large_image`.

**Manual step:** Replace placeholder OG images in `public/` with dedicated 1200×630 PNG assets in a dark/gold visual style. Update paths in `data/site.ts` (`siteConfig.og`).

## RSS Feed

**URL:** `/rss.xml`  
**Source:** `scripts/generate-rss.ts` (runs after `next build`)

Articles are defined in `data/articles.ts`. The RSS feed is written to `out/rss.xml` during the build.

## Adding a New Article

1. Add an entry to `data/articles.ts` with all required fields
2. Rebuild — static params and sitemap update automatically
3. Link the article from relevant project pages where appropriate

## Adding a New Project Case Study

1. Add to `featuredProjects` in `data/site.ts` with `slug`, `seoTitle`, `seoDescription`, dates
2. Rebuild — `/work/[slug]` page generates via `generateStaticParams`

## Canonical URL Verification

Inspect any page:

```bash
curl -s https://albazaqther.com/about | grep 'rel="canonical"'
```

Or use browser DevTools → Elements → search for `canonical`.

## Core Web Vitals Monitoring

1. Run Lighthouse locally or use [PageSpeed Insights](https://pagespeed.web.dev/)
2. Monitor in Google Search Console → **Experience** → Core Web Vitals
3. Keep images optimized, fonts with `display: swap`, and minimize client-side JavaScript

## Indexing Verification

After deployment:

1. Search `site:albazaqther.com` on Google
2. Use Search Console → **URL Inspection** for key pages
3. Confirm no accidental `noindex` meta tags
4. Confirm canonical URLs point to production domain, not localhost

## Analytics (Optional)

The architecture supports adding analytics without coupling to core functionality:

- **Google Analytics** — add gtag script via `next/script` in layout
- **Plausible** — add script tag in layout
- **Search Console** — verification meta tag in layout metadata

Do not install multiple analytics systems unless needed.

## Redirects

Netlify redirects in `netlify.toml` handle:

- `http` → `https`
- `www` → non-www

Trailing slashes follow Next.js defaults (no trailing slash).

## Content Authenticity

Do not add fake testimonials, awards, or metrics. All structured data reflects real projects, experience, and profiles listed in `data/site.ts`.

## GEO / AEO Strategy

The site establishes entity clarity through:

- Consistent display name: **Albaz Aqther** (short form: **Albaz**)
- Legal name kept as schema `alternateName` for discoverability: Abdul Kader Albaz Aqther
- Location signals: Dubai, UAE
- `sameAs` links: LinkedIn, GitHub
- Natural FAQ content on homepage
- Technical insight articles for long-term organic growth
- Project case studies with real architecture descriptions

Avoid keyword-stuffed doorway pages. One strong geographic entity (Dubai) is sufficient.
