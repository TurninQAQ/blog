import type { LucideIcon } from "lucide-react";

export type FeaturedNoteCardProps = {
  title: string;
  label: string;
  description: string;
  state: string;
  icon: LucideIcon;
};

export function FeaturedNoteCard({
  title,
  label,
  description,
  state,
  icon: Icon,
}: FeaturedNoteCardProps) {
  return (
    <article className="lab-glow-card rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface/78 p-5 transition-colors duration-150 hover:border-[var(--lab-border-active)]">
      <div className="flex items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lab border border-[var(--lab-border-active)] text-lab-accent">
          <Icon size={18} aria-hidden="true" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[14px] font-normal leading-[1.4] text-lab-muted">
            {label}
          </p>
          <h3 className="mt-2 text-[24px] font-semibold leading-[1.2] text-lab-text">
            {title}
          </h3>
        </div>
      </div>

      <p className="mt-5 text-[16px] font-normal leading-[1.5] text-lab-text-muted">
        {description}
      </p>

      <p className="mt-5 inline-flex min-h-11 items-center rounded-lab border border-[var(--lab-border-hairline)] px-3 font-mono text-[14px] font-normal leading-[1.4] text-lab-muted">
        {state}
      </p>
    </article>
  );
}
