import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

interface EmptyStateProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ icon: Icon, title, body, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-surface px-6 py-16 text-center">
      <Icon className="h-8 w-8 text-muted" />
      <p className="mt-4 font-serif text-lg font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="focus-ring mt-5 rounded-md bg-gold-dark px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
