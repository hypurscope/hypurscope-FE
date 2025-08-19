import * as React from "react";
import { cn } from "@/lib/utils";

export type PaginationProps = React.ComponentPropsWithoutRef<"nav"> & {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
  ...props
}: PaginationProps) {
  const goto = (p: number) => () =>
    onPageChange(Math.min(Math.max(1, p), totalPages));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showDots = totalPages > 7;

  const windowed = React.useMemo(() => {
    if (!showDots) return pages;
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    const result: (number | "dots")[] = [1];
    if (start > 2) result.push("dots");
    for (let p = start; p <= end; p++) result.push(p);
    if (end < totalPages - 1) result.push("dots");
    result.push(totalPages);
    return result;
  }, [page, totalPages]);

  return (
    <nav
      className={cn("flex items-center justify-center gap-1", className)}
      {...props}
    >
      <button
        onClick={goto(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-black/10 bg-white px-2 py-1 text-xs disabled:opacity-40"
      >
        Prev
      </button>
      {windowed.map((p, i) =>
        p === "dots" ? (
          <span key={`dots-${i}`} className="px-2 text-xs text-black/50">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={goto(p)}
            className={cn(
              "rounded-md px-2 py-1 text-xs",
              p === page
                ? "bg-black text-white"
                : "border border-black/10 bg-white text-black"
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={goto(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border border-black/10 bg-white px-2 py-1 text-xs disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
