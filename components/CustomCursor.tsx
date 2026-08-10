"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInteractive, setIsInteractive] = useState(false);
  const [isProject, setIsProject] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const checkDesktop = () => {
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      setIsDesktop(desktop);
      document.body.classList.toggle("custom-cursor-active", desktop);
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => {
      window.removeEventListener("resize", checkDesktop);
      document.body.classList.remove("custom-cursor-active");
    };
  }, []);

  useEffect(() => {
    if (!isDesktop || prefersReducedMotion) return;

    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      const target = e.target as HTMLElement;
      const projectEl = target.closest("[data-cursor='project']");
      const interactiveEl = target.closest(
        "a, button, [data-cursor='interactive']"
      );

      setIsProject(!!projectEl);
      setIsInteractive(!!interactiveEl || !!projectEl);
    };

    const handleLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, [isDesktop, prefersReducedMotion]);

  if (!isDesktop || prefersReducedMotion) return null;

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[100] mix-blend-difference"
      animate={{
        x: position.x - (isProject ? 28 : isInteractive ? 16 : 4),
        y: position.y - (isProject ? 28 : isInteractive ? 16 : 4),
        width: isProject ? 56 : isInteractive ? 32 : 8,
        height: isProject ? 56 : isInteractive ? 32 : 8,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
    >
      <div className="relative flex h-full w-full items-center justify-center rounded-full border border-white/80 bg-white/10">
        {isProject && (
          <span className="text-[9px] font-medium uppercase tracking-wider text-white">
            View
          </span>
        )}
      </div>
    </motion.div>
  );
}
