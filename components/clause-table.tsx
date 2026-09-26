"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "@/components/icons";
import { ConcernBadge } from "@/components/concern-badge";
import { ClauseDetailDialog } from "@/components/clause-detail-dialog";
import type { ConcernLevel, LegalClause } from "@/lib/types";

const PAGE_SIZE = 8;

export function ClauseTable({ clauses }: { clauses: LegalClause[] }) {
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<ConcernLevel | "all">("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<LegalClause | null>(null);

  const filtered = useMemo(() => {
    return clauses.filter((clause) => {
      const matchesQuery =
        query.trim() === "" ||
        clause.title.toLowerCase().includes(query.toLowerCase()) ||
        clause.category.toLowerCase().includes(query.toLowerCase());
      const matchesLevel = levelFilter === "all" || clause.concernLevel === levelFilter;
      return matchesQuery && matchesLevel;
    });
  }, [clauses, query, levelFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="rounded-card border border-border bg-surface shadow-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-serif text-lg font-semibold text-ink">Key Clauses</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative">
            <span className="sr-only">Search clauses</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search clauses…"
              className="focus-ring w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm sm:w-56"
            />
          </label>
          <label>
            <span className="sr-only">Filter by concern level</span>
            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value as ConcernLevel | "all");
                setPage(1);
              }}
              className="focus-ring rounded-md border border-border bg-surface px-3 py-2 text-sm"
            >
              <option value="all">All concern levels</option>
              <option value="high">High concern</option>
              <option value="medium">Medium concern</option>
              <option value="low">Low concern</option>
              <option value="info">Informational</option>
            </select>
          </label>
        </div>
      </div>

      {pageItems.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted">No clauses match your search.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th scope="col" className="px-4 py-3 font-medium">#</th>
                <th scope="col" className="px-4 py-3 font-medium">Clause title</th>
                <th scope="col" className="px-4 py-3 font-medium">Category</th>
                <th scope="col" className="px-4 py-3 font-medium">Concern level</th>
                <th scope="col" className="px-4 py-3 font-medium">Evidence</th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((clause, i) => (
                <tr key={clause.id} className="border-b border-border last:border-0 hover:bg-surface-secondary/40">
                  <td className="px-4 py-3 text-muted">{String((currentPage - 1) * PAGE_SIZE + i + 1).padStart(2, "0")}</td>
                  <td className="px-4 py-3 font-medium text-ink">{clause.title}</td>
                  <td className="px-4 py-3 capitalize text-muted">{clause.category.replace("-", " ")}</td>
                  <td className="px-4 py-3">
                    <ConcernBadge level={clause.concernLevel} />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {clause.evidence.available ? (
                      <>Section {clause.evidence.section ?? "—"} · Page {clause.evidence.page ?? "—"}</>
                    ) : (
                      "Evidence unavailable"
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(clause)}
                      className="focus-ring rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-secondary"
                    >
                      View details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted">
        <span>
          Showing {pageItems.length} of {filtered.length} key clauses
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => p - 1)}
              className="focus-ring rounded-md border border-border px-2.5 py-1 disabled:opacity-40"
              aria-label="Previous page"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                aria-current={p === currentPage ? "page" : undefined}
                className={`focus-ring rounded-md px-2.5 py-1 ${
                  p === currentPage ? "bg-gold/20 font-semibold text-gold-dark" : "border border-border"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="focus-ring rounded-md border border-border px-2.5 py-1 disabled:opacity-40"
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <ClauseDetailDialog clause={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
