"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export default function HeroComposition() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className="relative mx-auto w-full max-w-xl lg:mx-0 lg:ml-auto lg:max-w-none"
      aria-hidden="true"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-8 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-accent/[0.04] blur-3xl" />

      <div className="relative aspect-[4/5] w-full max-w-md lg:aspect-square lg:max-w-none">
        {/* Back layer — analytics */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: -3 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-4 top-8 rounded-sm border border-border bg-surface/80 p-4 shadow-2xl backdrop-blur-sm md:inset-x-8 md:top-12"
        >
          <AnalyticsPanel />
        </motion.div>

        {/* Main layer — operations */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-0 bottom-0 top-16 rounded-sm border border-border bg-[#0a0a0a] shadow-[0_24px_80px_rgba(0,0,0,0.5)] md:top-20"
        >
          <OperationsPanel />
        </motion.div>

        {/* Floating metric card */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -right-2 top-4 rounded-sm border border-border bg-background/95 px-4 py-3 backdrop-blur-md md:-right-4 md:top-8"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
            Agents
          </p>
          <p className="mt-1 text-2xl font-light text-foreground">3 active</p>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  i === 3 ? "bg-accent" : "bg-accent/40"
                )}
              />
            ))}
          </div>
        </motion.div>

        {/* Status pill */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-6 left-4 flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 backdrop-blur-sm md:left-6"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="text-[10px] tracking-wide text-muted">
            Systems operational
          </span>
        </motion.div>
      </div>
    </div>
  );
}

function AnalyticsPanel() {
  return (
    <div className="opacity-70">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-widest text-muted">
          Analytics
        </span>
        <span className="text-[9px] text-accent">+12.4%</span>
      </div>
      <svg viewBox="0 0 240 60" className="h-14 w-full">
        <polyline
          fill="none"
          stroke="rgba(225,183,79,0.35)"
          strokeWidth="1.5"
          points="0,45 30,40 60,42 90,28 120,32 150,18 180,22 210,15 240,12"
        />
      </svg>
    </div>
  );
}

function OperationsPanel() {
  return (
    <div className="flex h-full flex-col p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent/70" />
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
            AI Operations
          </span>
        </div>
        <div className="flex gap-1.5">
          <div className="h-1.5 w-8 rounded-full bg-white/10" />
          <div className="h-1.5 w-4 rounded-full bg-accent/30" />
        </div>
      </div>

      <div className="grid flex-1 grid-cols-12 gap-2 md:gap-3">
        <div className="col-span-3 space-y-1.5 md:space-y-2">
          {["Overview", "Agents", "Metrics", "Logs"].map((item, i) => (
            <div
              key={item}
              className={cn(
                "rounded-sm px-2 py-1.5 text-[8px] md:text-[9px]",
                i === 1
                  ? "border border-accent/20 bg-accent/5 text-accent"
                  : "text-muted"
              )}
            >
              {item}
            </div>
          ))}
        </div>

        <div className="col-span-6 flex flex-col gap-2 md:gap-3">
          <div className="flex-1 rounded-sm border border-white/5 bg-white/[0.02] p-2 md:p-3">
            <p className="mb-2 text-[8px] text-accent md:text-[9px]">
              Agent reasoning
            </p>
            <div className="space-y-1.5">
              <div className="h-1 w-full rounded bg-white/10" />
              <div className="h-1 w-11/12 rounded bg-white/10" />
              <div className="h-1 w-4/5 rounded bg-white/[0.08]" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[72, 58, 91].map((val) => (
              <div
                key={val}
                className="rounded-sm border border-white/5 bg-white/[0.02] p-1.5 md:p-2"
              >
                <div className="text-[8px] text-muted">Load</div>
                <div className="mt-1 h-1 rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-accent/50"
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-3 space-y-1.5 md:space-y-2">
          <div className="rounded-sm border border-white/5 bg-white/[0.02] p-2">
            <div className="text-[8px] text-muted">Requests</div>
            <div className="text-base font-light md:text-lg">2.4k</div>
          </div>
          <div className="rounded-sm border border-white/5 bg-white/[0.02] p-2">
            <div className="text-[8px] text-muted">Latency</div>
            <div className="text-base font-light text-accent md:text-lg">
              48ms
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
