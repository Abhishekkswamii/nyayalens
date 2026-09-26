import type { ConcernLevel } from "@/lib/types";

const LABELS: Record<ConcernLevel, string> = {
  high: "High concern",
  medium: "Medium concern",
  low: "Low concern",
  info: "Informational",
};

const STYLES: Record<ConcernLevel, string> = {
  high: "bg-risk-high/10 text-risk-high border-risk-high/30",
  medium: "bg-risk-medium/10 text-risk-medium border-risk-medium/30",
  low: "bg-risk-low/10 text-risk-low border-risk-low/30",
  info: "bg-muted/10 text-muted border-muted/30",
};

/**
 * Concern indicators always pair color with a text label (never color alone),
 * per WCAG 1.4.1.
 */
export function ConcernBadge({ level, className = "" }: { level: ConcernLevel; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${STYLES[level]} ${className}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[level]}
    </span>
  );
}
