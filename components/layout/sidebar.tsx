"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CompareIcon,
  DocumentIcon,
  HelpIcon,
  ObligationIcon,
  RightsIcon,
  ScaleIcon,
  SettingsIcon,
  SparkleIcon,
  WarningIcon,
} from "@/components/icons";

const NAV_ITEMS = [
  { href: "/analyze", label: "Overview", icon: DocumentIcon },
  { href: "/analyze/clauses", label: "Clauses", icon: DocumentIcon },
  { href: "/analyze/obligations", label: "Obligations", icon: ObligationIcon },
  { href: "/analyze/rights", label: "Rights", icon: RightsIcon },
  { href: "/analyze/risks", label: "Risks", icon: WarningIcon },
  { href: "/compare", label: "Compare", icon: CompareIcon },
  { href: "/ask", label: "Ask AI", icon: SparkleIcon },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="flex h-full flex-col">
      <Link
        href="/"
        onClick={onNavigate}
        className="focus-ring flex items-center gap-2 px-2 py-1 font-serif text-xl font-semibold text-ink"
      >
        <ScaleIcon className="h-6 w-6 text-gold-dark" />
        NyayaLens
      </Link>

      <ul className="mt-8 flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`focus-ring flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-gold/20 text-gold-dark"
                    : "text-ink/80 hover:bg-surface-secondary hover:text-ink"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 rounded-card border border-border bg-surface-secondary/60 p-4">
        <p className="text-sm font-semibold text-ink">Need professional advice?</p>
        <p className="mt-1 text-xs text-muted">
          This tool helps you prepare better questions for a lawyer.
        </p>
        <Link
          href="/analyze/lawyer-prep"
          onClick={onNavigate}
          className="focus-ring mt-3 inline-block text-xs font-semibold text-gold-dark underline"
        >
          Learn more →
        </Link>
      </div>

      <ul className="mt-4 space-y-1 border-t border-border pt-4">
        <li>
          <Link
            href="/settings"
            onClick={onNavigate}
            className="focus-ring flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-surface-secondary hover:text-ink"
          >
            <SettingsIcon className="h-[18px] w-[18px]" /> Settings
          </Link>
        </li>
        <li>
          <Link
            href="/help"
            onClick={onNavigate}
            className="focus-ring flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-surface-secondary hover:text-ink"
          >
            <HelpIcon className="h-[18px] w-[18px]" /> Help & FAQ
          </Link>
        </li>
      </ul>
    </nav>
  );
}
