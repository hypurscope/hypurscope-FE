"use client";
import React, { useEffect, useMemo, useState } from "react";
import { formatNumberCompact, formatUSDCompact } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import MetricCard from "@/components/dashboard/MetricCard";

type SpotTokenHoldingsProps = { address: string };

type Row = {
  token: string;
  balance: string; // compact amount, no commas
  value: string; // USD compact
  allocation: string; // percent with %
  currentValue: string; // computed current USD value or N/A
};

// Responsive media query hook (mirrors approach in TokenHolders)
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(query);
    const handler = () => setMatches(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export default function SpotTokenHoldings({ address }: SpotTokenHoldingsProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/user-info/${address}?start_time=${encodeURIComponent(
            "2000-01-01 00:00"
          )}`
        );
        if (!res.ok) throw new Error("Failed to load spot holdings");
        const data = await res.json();
        const holdings = (data?.user_spot_state?.["Holdings"] || []) as any[];

        // Compute USD values and allocations
        const detailed = holdings.map((h) => {
          const coin = String(h?.coin ?? "-");
          const total = Number(h?.total ?? 0); // quantity (balance)
          const entry = Number(h?.entry ?? 0); // USD price at entry per unit
          const priceNow =
            h?.value_in_usd !== undefined ? Number(h?.value_in_usd) : undefined; // current unit price if provided
          const usd = total * entry; // value at entry
          // Current value rules:
          // 1. If token is USDC -> balance * 1
          // 2. Else if value_in_usd present -> balance * value_in_usd
          // 3. Else -> N/A
          let currentValue: string;
          if (coin.toUpperCase() === "USDC") {
            currentValue = formatUSDCompact(total * 1, 2);
          } else if (priceNow !== undefined && isFinite(priceNow)) {
            currentValue = formatUSDCompact(total * priceNow, 2);
          } else {
            currentValue = "N/A";
          }
          return { coin, total, entry, usd, currentValue };
        });
        const sumUSD =
          detailed.reduce((acc, d) => acc + (isFinite(d.usd) ? d.usd : 0), 0) ||
          0;
        const mapped: Row[] = detailed.map((d) => {
          const pct = sumUSD > 0 ? (d.usd / sumUSD) * 100 : 0;
          return {
            token: d.coin,
            balance: formatNumberCompact(d.total, 2),
            value: formatUSDCompact(d.usd, 2),
            allocation: `${pct.toFixed(2)}%`,
            currentValue: d.currentValue,
          };
        });
        if (!cancelled) {
          setRows(mapped);
          setPage(1);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [address]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page]);

  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 900px)");

  // Aggregated metrics
  type Metrics = {
    count: number;
    totalValue: number;
    topToken: string;
    topValue: number;
  } | null;
  const metrics: Metrics = useMemo(() => {
    if (!rows.length) return null;
    let totalValue = 0;
    let topToken = "-";
    let topValue = 0;
    rows.forEach((r) => {
      const usd = Number(r.value.replace(/[^0-9.+-]/g, "")) || 0;
      totalValue += usd;
      if (usd > topValue) {
        topValue = usd;
        topToken = r.token;
      }
    });
    return {
      count: rows.length,
      totalValue,
      topToken,
      topValue,
    };
  }, [rows]);

  return (
    <section className="space-y-5 font-geist-sans max-w-6xl w-full mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">
          Spot Token Holdings
        </h2>
        <p className="text-xs sm:text-sm text-black/50">
          Current token balances and allocations
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {loading && !rows.length
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[10px] min-w-[130px] border border-[#DFDFDF] bg-white py-4 px-4 flex flex-col gap-1 animate-pulse"
              >
                <div className="h-3 w-14 bg-gray-200 rounded" />
                <div className="h-5 w-20 bg-gray-200 rounded" />
              </div>
            ))
          : metrics && (
              <>
                <MetricCard label="Tokens" value={String(metrics.count)} />
                <MetricCard
                  label="Total Value at Entry"
                  value={formatUSDCompact(metrics.totalValue, 2)}
                />
                <MetricCard label="Top Token Entry" value={metrics.topToken} />
                <MetricCard
                  label="Top Value at Entry"
                  value={formatUSDCompact(metrics.topValue, 2)}
                />
              </>
            )}
      </div>

      <div className="rounded-2xl border border-[#DDE6FF] bg-white overflow-x-auto">
        <table className="w-full table-fixed text-left text-[11px] sm:text-xs md:text-sm">
          <thead className="bg-[#EAF1FF] text-[10px] sm:text-xs text-black/70">
            <tr>
              <th className="px-3 sm:px-5 py-2 sm:py-3 font-medium w-[38%] sm:w-[34%] md:w-[30%]">
                Token
              </th>
              <th className="px-3 sm:px-5 py-2 sm:py-3 font-medium w-[28%] sm:w-[24%] md:w-[24%]">
                Balance
              </th>
              <th className="px-3 sm:px-5 py-2 sm:py-3 font-medium w-[22%] sm:w-[22%] md:w-[26%]">
                Value at Entry
              </th>
              <th className="px-3 sm:px-5 py-2 sm:py-3 font-medium w-[12%] sm:w-[20%] md:w-[20%]">
                Alloc
              </th>
              <th className="px-3 sm:px-5 py-2 sm:py-3 font-medium w-[12%] sm:w-[20%] md:w-[20%]">
                Current Value
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.map((r) => {
              const allocationDisplay = isMobile
                ? r.allocation.replace(/(\d+\.\d{2})(\d*)/, "$1")
                : r.allocation;
              return (
                <tr
                  key={r.token}
                  className="border-t border-[#EEF3FF] text-[10px] sm:text-[11px] md:text-sm"
                >
                  <td
                    className="px-3 sm:px-5 py-3 align-middle whitespace-nowrap font-medium overflow-hidden truncate"
                    title={r.token}
                  >
                    {r.token}
                  </td>
                  <td
                    className="px-3 sm:px-5 py-3 align-middle whitespace-nowrap overflow-hidden truncate"
                    title={r.balance}
                  >
                    {r.balance}
                  </td>
                  <td
                    className="px-3 sm:px-5 py-3 align-middle whitespace-nowrap"
                    title={r.value}
                  >
                    {r.value}
                  </td>
                  <td
                    className="px-3 sm:px-5 py-3 align-middle whitespace-nowrap"
                    title={r.allocation}
                  >
                    {allocationDisplay}
                  </td>
                  <td
                    className="px-3 sm:px-5 py-3 align-middle whitespace-nowrap"
                    title={r.currentValue}
                  >
                    {r.currentValue}
                  </td>
                </tr>
              );
            })}
            {paged.length === 0 && !loading && !error && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 sm:px-5 py-6 text-center text-black/50 text-xs sm:text-sm"
                >
                  No holdings
                </td>
              </tr>
            )}
            {loading &&
              !rows.length &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr
                  key={`sk-${i}`}
                  className="border-t border-[#EEF3FF] animate-pulse"
                >
                  <td className="px-3 sm:px-5 py-3">
                    <div className="h-3 w-20 bg-gray-200 rounded" />
                  </td>
                  <td className="px-3 sm:px-5 py-3">
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                  </td>
                  <td className="px-3 sm:px-5 py-3">
                    <div className="h-3 w-14 bg-gray-200 rounded" />
                  </td>
                  <td className="px-3 sm:px-5 py-3">
                    <div className="h-3 w-10 bg-gray-200 rounded" />
                  </td>
                  <td className="px-3 sm:px-5 py-3">
                    <div className="h-3 w-12 bg-gray-200 rounded" />
                  </td>
                </tr>
              ))}
            {error && !loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 sm:px-5 py-6 text-center text-red-500 text-xs sm:text-sm"
                >
                  {error}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {rows.length > pageSize && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          className="px-3 py-3 mt-5"
        />
      )}
    </section>
  );
}
