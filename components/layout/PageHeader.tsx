type PageHeaderProps = {
  label?: string;
  title: string;
  description?: string;
};

export default function PageHeader({
  label,
  title,
  description,
}: PageHeaderProps) {
  return (
    <header className="mb-12 max-w-3xl">
      {label && (
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {label}
        </p>
      )}
      <h1 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-light leading-tight tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
          {description}
        </p>
      )}
    </header>
  );
}
