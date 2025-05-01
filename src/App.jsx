import { lazy, Suspense } from "react";
import "./index.css";
// Lazy load the heavy Dark component
const Dark = lazy(() => import("./components/organisms/Dark"));
import Header from "./components/molecules/Header";
import Hero from "./components/organisms/Hero";
import WhatIDo from "./components/organisms/WhatIDo";
import Experience from "./components/organisms/Experience";
import Projects from "./components/organisms/Projects";
import Contact from "./components/organisms/Contact";

// Simple loading fallback that won't strain performance
const DarkFallback = () => (
  <div className="bg-primary w-full h-full" />
);

// JSON-LD structured data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Albaz Aqther",
  "jobTitle": "Web Developer",
  "url": "https://albazaqther.com",
  "sameAs": [
    "https://www.facebook.com/albaz.alba.12/",
    "https://twitter.com/albazalba10",
    "https://www.instagram.com/albazakthar/",
    "https://www.linkedin.com/in/albazaqther/",
    "https://github.com/albazalba"
  ],
  "worksFor": {
    "@type": "Organization",
    "name": "AQ Development"
  },
  "knowsAbout": ["Web Development", "React", "Next.js", "Three.js", "JavaScript", "UI/UX Design"]
};

function App() {
  return (
    <div className="bg-primary relative">
      {/* SEO: Add structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Dark 3D background */}
      <div className="fixed top-0 left-0 h-screen w-screen z-0" aria-hidden="true">
        <Suspense fallback={<DarkFallback />}>
          <Dark />
        </Suspense>
      </div>

      {/* Content layers */}
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <WhatIDo />
          <Experience />
          <Projects />
          <Contact />
        </main>
        <footer className="text-center py-4 text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Albaz Aqther. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
