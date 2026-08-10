"use client";

import { motion, useReducedMotion } from "motion/react";
import { siteConfig } from "@/data/site";
import { scrollToSection } from "@/lib/utils";
import HeroComposition from "./HeroComposition";
import SocialLinks from "./ui/SocialLinks";

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden section-padding pt-28"
      aria-label="Introduction"
    >
      {/* Subtle background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.03] via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="grid-container relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          <div className="lg:col-span-6 xl:col-span-5">
            <motion.h1
              initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-balance text-[clamp(2.5rem,6vw,4.5rem)] font-light leading-[1.08] tracking-tight"
            >
              I build digital products
              <br />
              <span className="text-muted">that feel simple.</span>
            </motion.h1>

            <motion.blockquote
              initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-8 max-w-xl border-l border-border pl-5 text-base leading-relaxed text-muted md:text-lg"
            >
              Software engineer building AI-powered products and intelligent
              systems. I turn complex problems into clear, fast experiences.
            </motion.blockquote>

            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-6 text-sm tracking-wide text-muted"
            >
              Based in {siteConfig.location.replace(", UAE", "")} · Working
              globally
            </motion.p>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <button
                onClick={() => scrollToSection("work")}
                className="border border-border px-6 py-3 text-sm transition-colors duration-300 hover:border-accent hover:text-accent"
                data-cursor="interactive"
              >
                View selected work
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="px-6 py-3 text-sm text-muted transition-colors duration-300 hover:text-foreground"
                data-cursor="interactive"
              >
                Get in touch
              </button>
            </motion.div>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-8 border-t border-border pt-6"
            >
              <SocialLinks />
            </motion.div>
          </div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 xl:col-span-7"
          >
            <HeroComposition />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
