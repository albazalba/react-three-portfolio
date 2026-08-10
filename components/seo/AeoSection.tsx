import Link from "next/link";

export const profileFaqs = [
  {
    question: "Who is Abdul Kader Albaz Aqther?",
    answer:
      "Abdul Kader Albaz Aqther is a software engineer based in Dubai, UAE, specializing in frontend engineering with React, Next.js and TypeScript, with a growing focus on AI-powered applications and intelligent systems.",
  },
  {
    question: "What does Abdul specialize in?",
    answer:
      "Frontend architecture, React and Next.js development, TypeScript, complex dashboards, and AI application engineering including LLMs, AI agents and Python backends.",
  },
  {
    question: "Where is Abdul based?",
    answer:
      "Abdul is based in Dubai, United Arab Emirates, and works with teams globally.",
  },
];

export default function AeoSection() {
  return (
    <section
      className="section-padding border-t border-border"
      aria-labelledby="profile-summary"
    >
      <div className="grid-container max-w-3xl">
        <h2
          id="profile-summary"
          className="text-xl font-light tracking-tight text-muted"
        >
          Profile
        </h2>
        <dl className="mt-8 space-y-8">
          {profileFaqs.map((faq) => (
            <div key={faq.question}>
              <dt className="text-sm text-foreground">{faq.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-10 text-sm text-muted">
          Explore{" "}
          <Link href="/work" className="text-foreground hover:text-accent">
            selected work
          </Link>
          , read{" "}
          <Link href="/insights" className="text-foreground hover:text-accent">
            engineering insights
          </Link>
          , or{" "}
          <Link href="/contact" className="text-foreground hover:text-accent">
            get in touch
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
