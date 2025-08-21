"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Pagination } from "@/components/ui/pagination";
import SearchInput from "../common/SearchInput";
import MetricCard from "./MetricCard";

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
    signal?: AbortSignal
  ) => {
    const res = await fetch(
      `/api/holders?token=${encodeURIComponent(
        token
      )}&page=${p}&pageSize=${ps}`,
      { signal }
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

  const fmtInt = (n?: number) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
      Math.round(Number(n) || 0)
    );
  const fmtCompact = (n?: number) => {
    const x = Number(n) || 0;
    const abs = Math.abs(x);
    if (abs >= 1e12) return `${(x / 1e12).toFixed(2)}T`;
    if (abs >= 1e9) return `${(x / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `${(x / 1e6).toFixed(2)}M`;
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 0,
    }).format(x);
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
                label="Total Holders"
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

      <section className=" mt-14">
        <div className="overflow-hidden rounded-2xl border border-[#DDE6FF] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#EAF1FF] text-xs text-black/70">
              <tr>
                <th className="px-5 py-3 font-medium">Rank</th>
                <th className="px-5 py-3 font-medium">Address</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Percentage (%)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={`${r.rank}-${r.address}`}
                  className="border-t border-[#EEF3FF]"
                >
                  <td className="px-5 py-4 text-black/70">#{r.rank}</td>
                  <td className="px-5 py-4 font-mono">{r.address}</td>
                  <td className="px-5 py-4">{r.amount.toLocaleString()}</td>
                  <td className="px-5 py-4">{r.percentage.toFixed(2)}%</td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-6 text-center text-black/50"
                  >
                    {query ? "No results" : "Enter a token symbol to search"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && <div className="p-4 text-sm text-gray-500">Loading…</div>}
          {error && <div className="p-4 text-sm text-red-500">{error}</div>}
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
