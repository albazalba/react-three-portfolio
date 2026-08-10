type SectionLabelProps = {
  children: React.ReactNode;
  className?: string;
};

export default function SectionLabel({ children, className = "" }: SectionLabelProps) {
  return (
    <p
      className={`text-xs uppercase tracking-[0.2em] text-muted ${className}`}
    >
      {children}
    </p>
  );
}
