import { ChevronLeft, ChevronRight } from 'lucide-react';

function pageWindow(page, totalPages) {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function Pagination({ meta, itemLabel, onPageChange }) {
  if (!meta) return null;
  const { page, limit, total, totalPages } = meta;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const pageBtn = 'min-w-8 rounded border px-2 py-1 text-sm';
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm text-slate-600">
      <span>
        Showing {from}-{to} of {total} {itemLabel}
      </span>
      <div className="flex items-center gap-1">
        <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className={`${pageBtn} border-slate-300 disabled:opacity-40`}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageWindow(page, totalPages).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`${pageBtn} ${p === page ? 'border-brand bg-brand text-white' : 'border-slate-300 hover:bg-slate-50'}`}
          >
            {p}
          </button>
        ))}
        <button type="button" aria-label="Next page" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className={`${pageBtn} border-slate-300 disabled:opacity-40`}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
