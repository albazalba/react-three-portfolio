import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  generatePersonSchema,
  generateWebSiteSchema,
  generateProfessionalServiceSchema,
  absoluteUrl,
  pageMetadata,
} from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  ...pageMetadata.home(),
  alternates: {
    canonical: absoluteUrl("/"),
    types: {
      "application/rss+xml": absoluteUrl("/rss.xml"),
    },
  },
  icons: {
    icon: [{ url: "/AQ.png", type: "image/png" }],
    apple: [{ url: "/AQ.png", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-background text-foreground antialiased">
        <JsonLd
          data={[
            generateWebSiteSchema(),
            generatePersonSchema(),
            generateProfessionalServiceSchema(),
          ]}
        />
        {children}
      </body>
    </html>
  );
}
