"use client";

import Link from "next/link";
import {
  experiences,
  exploringItems,
  featuredProjects,
  getAllProjects,
  principles,
  siteConfig,
  techCategories,
} from "@/data/site";
import type { Action } from "./layout";
import { LANDMARKS } from "./layout";
import { closeOverlay, queueTeleport, requestLookLock, startChase } from "./store";
import SignalMatch from "./SignalMatch";
import ArcadeGame from "./arcade/ArcadeGame";

const hobbies: Record<string, { title: string; text: string }> = {
  photography: {
    title: "Photography",
    text: "Looking closely. Light, framing, and the habit of noticing what a scene is actually doing.",
  },
  travel: {
    title: "Travel",
    text: "Changing the backdrop. New streets, a different pace, the same curiosity carried somewhere else.",
  },
  markets: {
    title: "Markets",
    text: "Systems with a pulse. How signals, incentives, and timing move — watched the way an engineer watches a product.",
  },
  design: {
    title: "Product design",
    text: "The other half of building. How something feels in the first five seconds, and whether a complex thing can feel simple.",
  },
  technology: {
    title: "Technology",
    text: "The craft past the workday. Tools, systems, and what they make possible when nobody has filed a ticket.",
  },
};

function Eyebrow({ children }: { children: string }) {
  return <p className="text-xs uppercase tracking-[0.28em] text-accent">{children}</p>;
}

function go(landmarkId: string) {
  const landmark = LANDMARKS.find((item) => item.id === landmarkId);
  if (!landmark) return;
  queueTeleport({ x: landmark.x, z: landmark.z, yaw: landmark.yaw });
  closeOverlay();
  requestLookLock();
}

export default function Placard({ overlay }: { overlay: Action }) {
  if (overlay.type === "game") {
    return overlay.id === "signal" ? <SignalMatch /> : <ArcadeGame key={overlay.id} id={overlay.id} />;
  }

  if (overlay.type === "pc") {
    const owner = siteConfig.displayName;
    const initials = owner
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return (
      <div>
        <Eyebrow>Personal computer</Eyebrow>
        <h2 className="mt-3 text-4xl font-light leading-tight tracking-tight">Access denied.</h2>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-muted md:text-base">
          This one is my personal computer, and you don&apos;t have access to it. The arcade
          machines along the far wall are open to everyone.
        </p>
        <div className="mt-8 flex max-w-sm items-center gap-4 border border-white/10 bg-white/[0.03] p-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent/60 text-sm tracking-[0.12em] text-accent">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base">{owner}</p>
            <p className="mt-1 text-sm tracking-[0.3em] text-muted" aria-hidden="true">
              ••••••••
            </p>
          </div>
          <span className="text-xs uppercase tracking-[0.22em] text-muted">Locked</span>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => go("projects")}
            className="border border-accent px-4 py-2 text-sm text-accent"
          >
            Go to the machines
          </button>
          <button
            type="button"
            onClick={() => {
              closeOverlay();
              requestLookLock();
            }}
            className="border border-border px-4 py-2 text-sm text-muted hover:text-foreground"
          >
            Keep walking
          </button>
        </div>
      </div>
    );
  }

  if (overlay.type === "index") {
    return (
      <div>
        <Eyebrow>Directory</Eyebrow>
        <h2 className="mt-3 text-3xl font-light tracking-tight">Where to walk</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          The living room opens onto the career gallery and the game room. The arcade
          machines in the game room are real, so pick one and play.
        </p>
        <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {LANDMARKS.filter((item) => item.id !== "foyer").map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => go(item.id)}
                className="flex w-full items-baseline justify-between gap-6 py-4 text-left transition-colors hover:text-accent"
              >
                <span className="text-lg font-light">{item.label}</span>
                <span className="text-sm text-muted">{item.detail}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-xs uppercase tracking-[0.22em] text-muted">Reading room</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href="/about" className="hover:text-accent">About</Link>
          <Link href="/experience" className="hover:text-accent">Experience</Link>
          <Link href="/work" className="hover:text-accent">Work</Link>
          <Link href="/contact" className="hover:text-accent">Contact</Link>
        </div>
      </div>
    );
  }

  if (overlay.type === "intro") {
    return (
      <div>
        <Eyebrow>Introduction</Eyebrow>
        <h2 className="mt-3 text-4xl font-light leading-tight tracking-tight">
          Engineer by trade.
          <br />
          Builder by nature.
        </h2>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted md:text-base">
          <p>
            {siteConfig.displayName} is a software engineer based in Dubai, focused
            on building products — from complex dashboards and data-heavy platforms
            to AI agents and intelligent operational systems.
          </p>
          <p>
            His work spans interface design, system architecture, and full-stack
            delivery, with a growing emphasis on AI engineering, Python backends,
            and LLM-powered applications.
          </p>
          <p>
            I build digital products that feel simple. Complex problems, clear
            interfaces, fast enough that speed is part of the experience.
          </p>
        </div>
        <p className="mt-6 text-sm text-foreground/80">
          {siteConfig.availability} · {siteConfig.location}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={() => go("experience")} className="border border-border px-4 py-2 text-sm hover:border-accent hover:text-accent">
            Walk to experience
          </button>
          <Link href="/about" className="border border-border px-4 py-2 text-sm text-muted hover:border-accent hover:text-accent">
            Read the long version
          </Link>
        </div>
      </div>
    );
  }

  if (overlay.type === "principles") {
    return (
      <div>
        <Eyebrow>Principles</Eyebrow>
        <h2 className="mt-3 text-3xl font-light">How the work is made</h2>
        <ol className="mt-8 space-y-6">
          {principles.map((principle) => (
            <li key={principle.number}>
              <p className="text-xs tracking-[0.22em] text-accent">{principle.number}</p>
              <h3 className="mt-1 text-xl font-light">{principle.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{principle.description}</p>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (overlay.type === "stack") {
    return (
      <div>
        <Eyebrow>Tech stack</Eyebrow>
        <h2 className="mt-3 text-3xl font-light">What I reach for</h2>
        <div className="mt-8 space-y-6">
          {techCategories.map((category) => (
            <div key={category.label}>
              <p className="text-xs uppercase tracking-[0.22em] text-accent">{category.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {category.items.join(" · ")}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs uppercase tracking-[0.22em] text-muted">Currently exploring</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{exploringItems.join(" · ")}</p>
      </div>
    );
  }

  if (overlay.type === "experience") {
    const job = experiences.find((item) => item.id === overlay.id);
    if (!job) return null;
    return (
      <div>
        <Eyebrow>Experience</Eyebrow>
        <h2 className="mt-3 text-3xl font-light leading-tight">{job.position}</h2>
        <p className="mt-2 text-lg text-foreground/90">{job.company}</p>
        <p className="mt-1 text-sm text-muted">
          {job.period} · {job.location}
        </p>
        <ul className="mt-8 space-y-3 text-sm leading-relaxed text-muted">
          {job.highlights.map((highlight) => (
            <li key={highlight} className="border-l border-accent/50 pl-4">
              {highlight}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => go("wall")}
          className="mt-8 border border-border px-4 py-2 text-sm hover:border-accent hover:text-accent"
        >
          Continue to the project wall
        </button>
      </div>
    );
  }

  if (overlay.type === "project") {
    const project = getAllProjects().find((item) => item.slug === overlay.slug);
    if (!project) return null;
    const featured = featuredProjects.some((item) => item.slug === project.slug);
    return (
      <div>
        <Eyebrow>{project.year}</Eyebrow>
        <h2 className="mt-3 text-3xl font-light leading-tight">{project.title}</h2>
        <p className="mt-2 text-sm text-muted">
          {project.role}
          {featured ? "" : " · earlier work"}
        </p>
        <p className="mt-5 text-sm leading-relaxed text-foreground/90 md:text-base">
          {project.description}
        </p>
        <p className="mt-5 text-sm text-accent/90">{project.technologies.join(" · ")}</p>
        {project.caseStudy.length > 0 && (
          <div className="mt-8 space-y-6">
            {project.caseStudy.map((section) => (
              <section key={section.title}>
                <h3 className="text-xs uppercase tracking-[0.22em] text-accent">{section.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{section.content}</p>
              </section>
            ))}
          </div>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-border px-4 py-2 text-sm hover:border-accent hover:text-accent"
            >
              Open the live site
            </a>
          )}
          {featured && (
            <Link
              href={`/work/${project.slug}`}
              className="border border-border px-4 py-2 text-sm text-muted hover:border-accent hover:text-accent"
            >
              Case study page
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (overlay.type === "hobby") {
    const hobby = hobbies[overlay.id];
    if (!hobby) return null;
    return (
      <div>
        <Eyebrow>Hobbies</Eyebrow>
        <h2 className="mt-3 text-3xl font-light">{hobby.title}</h2>
        <p className="mt-5 max-w-md text-base leading-relaxed text-muted">{hobby.text}</p>
        <p className="mt-8 text-sm text-muted">
          Technology is the main craft. Curiosity does not stop at the editor.
        </p>
      </div>
    );
  }

  if (overlay.type === "contact") {
    return (
      <div>
        <Eyebrow>Correspondence</Eyebrow>
        <h2 className="mt-3 text-4xl font-light leading-tight tracking-tight">
          Let&apos;s build something
          <br />
          worth using.
        </h2>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-muted md:text-base">
          Software engineer based in {siteConfig.location}. {siteConfig.availability} —
          Dubai, the UAE, and remote teams.
        </p>
        <div className="mt-8 flex flex-col gap-4 text-lg">
          <a href={`mailto:${siteConfig.email}`} className="w-fit hover:text-accent">
            {siteConfig.email}
          </a>
          <a href={siteConfig.links.linkedin} target="_blank" rel="noopener noreferrer" className="w-fit text-muted hover:text-foreground">
            LinkedIn
          </a>
          <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer" className="w-fit text-muted hover:text-foreground">
            GitHub
          </a>
        </div>
      </div>
    );
  }

  if (overlay.type === "chase-result") {
    const cleared = overlay.found === overlay.total;
    return (
      <div>
        <Eyebrow>Light Chase</Eyebrow>
        <h2 className="mt-3 text-3xl font-light">
          {cleared ? "Every light found." : "The lights went out."}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {overlay.found} of {overlay.total} in {overlay.seconds}s.
          {cleared
            ? " The arcade floor is yours."
            : " Walk back to the gold ring and run it again."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              closeOverlay();
              startChase();
              requestLookLock();
            }}
            className="border border-accent px-4 py-2 text-sm text-accent"
          >
            Run it again
          </button>
          <button
            type="button"
            onClick={() => {
              closeOverlay();
              requestLookLock();
            }}
            className="border border-border px-4 py-2 text-sm text-muted hover:text-foreground"
          >
            Keep walking
          </button>
        </div>
      </div>
    );
  }

  return null;
}
