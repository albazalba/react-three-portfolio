import Link from "next/link";
import SiteShell from "@/components/layout/SiteShell";

export default function NotFound() {
  return (
    <SiteShell>
      <section className="section-padding flex min-h-[70vh] items-center pt-28">
        <div className="grid-container max-w-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">404</p>
          <h1 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-light tracking-tight">
            This page doesn&apos;t exist.
          </h1>
          <p className="mt-4 text-muted">
            The page you are looking for may have moved or no longer exists.
          </p>
          <div className="mt-10 flex flex-wrap gap-6 text-sm">
            <Link
              href="/"
              className="text-foreground transition-colors hover:text-accent"
            >
              Back home
            </Link>
            <Link
              href="/work"
              className="text-muted transition-colors hover:text-accent"
            >
              View work
            </Link>
            <Link
              href="/contact"
              className="text-muted transition-colors hover:text-accent"
            >
              Contact
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
