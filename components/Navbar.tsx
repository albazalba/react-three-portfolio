"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/data/site";
import { cn, scrollToSection } from "@/lib/utils";

const navLinks = [
  { label: "Work", id: "work" },
  { label: "About", id: "about" },
  { label: "Experience", id: "experience" },
  { label: "Contact", id: "contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleNav = (id: string) => {
    setMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <>
      <motion.header
        initial={prefersReducedMotion ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
          scrolled
            ? "border-b border-border bg-background/90 backdrop-blur-md"
            : "bg-transparent"
        )}
      >
        <div className="grid-container flex h-16 items-center justify-between md:h-20">
          <button
            onClick={() => handleNav("hero")}
            className="group text-left"
            aria-label="Scroll to top"
          >
            <span className="text-sm font-medium tracking-[0.15em] text-foreground transition-colors group-hover:text-accent">
              ALBAZ
            </span>
            <span className="mx-2 text-muted">/</span>
            <span className="text-sm font-medium tracking-[0.15em] text-muted transition-colors group-hover:text-foreground">
              AQTHER
            </span>
          </button>

          <nav
            className="hidden items-center gap-10 lg:flex"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className="cursor-pointer text-sm text-muted transition-colors duration-300 hover:text-foreground"
                data-cursor="interactive"
              >
                {link.label}
              </button>
            ))}
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
              <span>{siteConfig.availability}</span>
            </div>
          </nav>

          <button
            className="flex h-10 w-10 items-center justify-center lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/98 backdrop-blur-sm lg:hidden"
          >
            <nav
              className="flex h-full flex-col items-start justify-center gap-8 px-8"
              aria-label="Mobile navigation"
            >
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleNav(link.id)}
                  className="text-3xl font-light tracking-tight text-foreground"
                >
                  {link.label}
                </motion.button>
              ))}
              <div className="mt-4 flex items-center gap-2 text-sm text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {siteConfig.availability}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
