"use client";

import React, { useEffect, useState } from "react";
import { Pagination } from "@/components/ui/pagination";
import SearchInput from "../common/SearchInput";
import MetricCard from "./MetricCard";

// ---- Formatting helpers (hoisted so they're not recreated each render) ----
const fmtInt = (n?: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    Math.round(Number(n) || 0),
  );
const fmtCompact = (n?: number) => {
  const x = Number(n) || 0;
  const abs = Math.abs(x);
  const format = (v: number) => (v % 1 === 0 ? v.toFixed(0) : v.toFixed(2));
  if (abs >= 1e12) return `${format(x / 1e12)}T`;
  if (abs >= 1e9) return `${format(x / 1e9)}B`;
  if (abs >= 1e6) return `${format(x / 1e6)}M`;
  if (abs >= 1e3) return `${format(x / 1e3)}K`;
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
    x,
  );
};
const fmtDateOnly = (s?: string | null) => {
  if (!s) return "—";
  const parts = String(s)
    .split(/[^0-9]/)
    .filter(Boolean)
    .map(Number);
  if (parts.length >= 3) {
    const [yy, mm, dd] = parts;
    const y = yy < 100 ? 2000 + yy : yy;
    const date = new Date(Date.UTC(y, Math.max(0, (mm || 1) - 1), dd || 1));
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime())
    ? s
    : d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
};

// Small hook for responsive breakpoint detection (no external dep)
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return; // SSR guard
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

// Short helper to truncate addresses nicely
const truncateAddress = (addr: string, lead = 6, tail = 4) => {
  if (!addr) return addr;
  if (addr.length <= lead + tail + 3) return addr;
  return `${addr.slice(0, lead)}...${addr.slice(-tail)}`;
};

export default function TokenHolders() {
  const [query, setQuery] = useState(""); // token actually queried (empty until submit)
  const [input, setInput] = useState(""); // text the user is typing
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [rows, setRows] = useState<
    { rank: number; address: string; amount: number; percentage: number }[]
  >([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    token?: string;
    lastUpdate?: string | null;
    totalHolders?: number;
    totalAmount?: number;
  }>({});

  const fetchPage = async (
    token: string,
    p: number,
    ps: number,
    signal?: AbortSignal,
  ) => {
    const res = await fetch(
      `/api/holders?token=${encodeURIComponent(
        token,
      )}&page=${p}&pageSize=${ps}`,
      { signal },
    );
    if (!res.ok) throw new Error("Failed to fetch holders");
    return res.json();
  };

  useEffect(() => {
    if (!query) return; // do not fetch until a token has been submitted
    let cancelled = false;
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const json = await fetchPage(query, page, pageSize, controller.signal);
        if (cancelled) return;
        setRows(json.rows || []);
        setTotalPages(json.totalPages || 1);
        setSummary({
          token: json.token,
          lastUpdate: json.lastUpdate,
          totalHolders: json.totalHolders,
          totalAmount: json.totalAmount,
        });
      } catch (e: any) {
        if (!cancelled && e?.name !== "AbortError")
          setError(e?.message ?? "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [query, page, pageSize]);

  // Only update local input while typing; do not fetch
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Submit triggers the actual query + resets pagination
  const handleSubmit = (value: string) => {
    const next = (value || input || "").trim().toUpperCase();
    if (!next) return;
    if (next === query) return; // no-op if same token
    setPage(1);
    setQuery(next);
    setInput(next);
  };

  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <div className="space-y-4 font-geist-sans mt-8">
      <div className="flex flex-col items-center justify-between gap-16">
        <SearchInput
          handleSearch={handleSearch}
          onSubmit={handleSubmit}
          query={input} // use local input, not query
          placeholder="Enter token symbol (e.g., PURR, HYPE)"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-20">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[10px] min-w-[200px] border border-[#DFDFDF] bg-white py-5 px-[40px] w-fit"
              >
                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-6 w-28 bg-gray-200 rounded" />
              </div>
            ))
          ) : (
            <>
              <MetricCard
                label="Token"
                value={
                  summary.token?.toUpperCase() ||
                  (query ? query.toUpperCase() : "-")
                }
              />
              <MetricCard
                label="Top Holders (Limit)"
                value={
                  summary.totalHolders != null
                    ? fmtInt(summary.totalHolders)
                    : "0"
                }
              />
              <MetricCard
                label="Total Supply"
                value={
                  summary.totalAmount != null
                    ? fmtCompact(summary.totalAmount)
                    : "0.00"
                }
              />
              <MetricCard
                label="Last Updated"
                value={fmtDateOnly(summary.lastUpdate)}
              />
            </>
          )}
        </div>
      </div>

      <section className="mt-14">
        <div className="rounded-2xl border border-[#DDE6FF] bg-white">
          <table className="w-full table-fixed text-left text-[11px] sm:text-xs md:text-sm">
            <caption className="sr-only">
              Top holders for {query || "selected token"} showing {rows.length}{" "}
              addresses
            </caption>
            <thead className="bg-[#EAF1FF] text-[10px] sm:text-xs text-black/70">
              <tr>
                <th
                  scope="col"
                  className="px-3 sm:px-5 py-2 sm:py-3 font-medium w-[46px]"
                >
                  Rank
                </th>
                <th
                  scope="col"
                  className="px-3 sm:px-5 py-2 sm:py-3 font-medium w-[45%]"
                >
                  Address
                </th>
                <th
                  scope="col"
                  className="px-3 sm:px-5 py-2 sm:py-3 font-medium w-[25%]"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-3 sm:px-5 py-2 sm:py-3 font-medium w-[20%]"
                >
                  <span className="sm:hidden text-[9px] whitespace-nowrap">
                    % (Top 2K)
                  </span>
                  <span className="hidden sm:inline">% Share (Top 2000)</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const amountDisplay = fmtCompact(r.amount);
                const pctDisplay =
                  (isMobile
                    ? r.percentage.toFixed(1)
                    : r.percentage.toFixed(2)) + "%";
                return (
                  <tr
                    key={`${r.rank}-${r.address}`}
                    className="border-t border-[#EEF3FF]"
                  >
                    <td className="px-3 sm:px-5 py-3 text-black/70 align-middle">
                      #{r.rank}
                    </td>
                    <td className="px-3 sm:px-5 py-3 font-mono align-middle overflow-hidden whitespace-nowrap truncate">
                      {isMobile ? truncateAddress(r.address, 5, 4) : r.address}
                    </td>
                    <td className="px-3 sm:px-5 py-3 align-middle whitespace-nowrap">
                      {amountDisplay}
                    </td>
                    <td className="px-3 sm:px-5 py-3 align-middle whitespace-nowrap">
                      {pctDisplay}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 sm:px-5 py-6 text-center text-gray-600"
                  >
                    {query ? "No results" : "Enter a token symbol to search"}
                  </td>
                </tr>
              )}
              {loading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <tr
                    key={`skeleton-${i}`}
                    className="border-t border-[#EEF3FF] animate-pulse"
                  >
                    <td className="px-3 sm:px-5 py-3">
                      <div className="h-3 w-7 rounded bg-gray-200" />
                    </td>
                    <td className="px-3 sm:px-5 py-3">
                      <div className="h-3 w-24 sm:w-40 rounded bg-gray-200" />
                    </td>
                    <td className="px-3 sm:px-5 py-3">
                      <div className="h-3 w-14 sm:w-16 rounded bg-gray-200" />
                    </td>
                    <td className="px-3 sm:px-5 py-3">
                      <div className="h-3 w-10 sm:w-12 rounded bg-gray-200" />
                    </td>
                  </tr>
                ))}
              {error && !loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 sm:px-5 py-6 text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="px-3 sm:px-5 py-2">
            <p className="text-[10px] text-gray-600">
              * Percentages are based on the top 2000 holders returned by this
              API (not the full on-chain holder set).
            </p>
          </div>
        </div>
        {query && totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
            className=" px-3 py-3 mt-5"
          />
        )}
      </section>
    </div>
  );
}
