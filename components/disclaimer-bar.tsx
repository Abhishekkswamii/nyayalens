import Link from "next/link";

export function DisclaimerBar() {
  return (
    <div className="border-t border-border bg-surface-secondary/60 px-4 py-3 text-center text-xs text-muted sm:px-6">
      <strong className="text-ink">Informational assistance, not legal advice.</strong>{" "}
      This analysis is for educational and informational purposes only. It does not constitute legal
      advice and should not be relied upon as a substitute for professional legal counsel.{" "}
      <Link href="/help#limitations" className="focus-ring rounded font-medium text-gold-dark underline">
        Understand the limitations
      </Link>
    </div>
  );
}
