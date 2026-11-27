"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MuseumChrome from "./MuseumChrome";
import MuseumScene from "./MuseumScene";
import { setCoarse, setLocked, setReducedMotion } from "./store";

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function MuseumExperience() {
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    setWebgl(canUseWebGL());
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onLock = () => {
      setLocked(document.pointerLockElement !== null);
    };
    document.addEventListener("pointerlockchange", onLock);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("pointerlockchange", onLock);
    };
  }, []);

  if (!webgl) {
    return (
      <main className="fixed inset-0 z-10 flex items-center bg-[#0c0b09] px-6 text-[#f4efe6]">
        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.32em] text-accent">The Hall</p>
          <h1 className="mt-4 text-4xl font-light">This browser cannot open the apartment.</h1>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            The walkable apartment needs WebGL. The same work is written out on the reading pages.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <Link href="/about" className="hover:text-accent">About</Link>
            <Link href="/experience" className="hover:text-accent">Experience</Link>
            <Link href="/work" className="hover:text-accent">Work</Link>
            <Link href="/contact" className="hover:text-accent">Contact</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 z-10 bg-[#0c0b09] text-[#f4efe6]">
      <MuseumScene />
      <MuseumChrome />
    </main>
  );
}
