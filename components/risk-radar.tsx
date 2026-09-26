import type { RiskSummary } from "@/lib/types";

const COLORS = {
  high: "#A23B32",
  medium: "#8A5A10",
  low: "#3A5E45",
};

export function RiskRadar({ summary }: { summary: RiskSummary }) {
  const total = summary.totalClauses || 1;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const segments = [
    { key: "high" as const, value: summary.high },
    { key: "medium" as const, value: summary.medium },
    { key: "low" as const, value: summary.low },
  ];

  let offset = 0;
  const arcs = segments.map((segment) => {
    const length = (segment.value / total) * circumference;
    const arc = { ...segment, length, offset };
    offset += length;
    return arc;
  });

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center gap-2">
        <h2 className="font-serif text-lg font-semibold text-ink">Risk Radar</h2>
      </div>

      <div className="mt-4 flex items-center justify-center">
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          role="img"
          aria-label={`${summary.totalClauses} clauses analyzed: ${summary.high} high concern, ${summary.medium} medium concern, ${summary.low} low concern.`}
        >
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#F7F1DF" strokeWidth="16" />
          {arcs.map(
            (arc) =>
              arc.length > 0 && (
                <circle
                  key={arc.key}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke={COLORS[arc.key]}
                  strokeWidth="16"
                  strokeDasharray={`${arc.length} ${circumference - arc.length}`}
                  strokeDashoffset={-arc.offset}
                  transform="rotate(-90 80 80)"
                  strokeLinecap="butt"
                />
              ),
          )}
          <text x="80" y="76" textAnchor="middle" className="fill-ink font-serif" style={{ fontSize: 28, fontWeight: 600 }}>
            {summary.totalClauses}
          </text>
          <text x="80" y="96" textAnchor="middle" className="fill-muted font-sans" style={{ fontSize: 11, fontWeight: 500 }}>
            Clauses
          </text>
        </svg>
      </div>

      <ul className="mt-4 space-y-2 text-sm">
        <li className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-ink">
            <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: COLORS.high }} />
            High concern
          </span>
          <span className="font-semibold text-ink">{summary.high}</span>
        </li>
        <li className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-ink">
            <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: COLORS.medium }} />
            Medium concern
          </span>
          <span className="font-semibold text-ink">{summary.medium}</span>
        </li>
        <li className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-ink">
            <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: COLORS.low }} />
            Low concern
          </span>
          <span className="font-semibold text-ink">{summary.low}</span>
        </li>
      </ul>

      <div className="mt-5 rounded-md bg-surface-secondary/60 p-3">
        <p className="text-xs font-semibold text-ink">Key takeaway</p>
        <p className="mt-1 text-xs text-muted">{summary.keyTakeaway}</p>
      </div>
      <p className="mt-3 text-[11px] text-muted">
        Concern levels reflect prioritization for review, not a legal ruling.
      </p>
    </div>
  );
}
