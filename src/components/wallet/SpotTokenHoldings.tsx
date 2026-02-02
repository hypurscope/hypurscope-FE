"use client";
import React, { useEffect, useMemo, useState } from "react";
// No external format helpers needed here; using lightweight local versions for clarity
import { Pagination } from "@/components/ui/pagination";
import MetricCard from "@/components/dashboard/MetricCard";

type SpotTokenHoldingsProps = { address: string };

interface RawRow {
  token: string;
  balance: number; // token amount
  entryValue: number; // TOTAL USD at entry (cost basis)
  currentValue: number | null; // TOTAL USD current
}
interface DisplayRow {
  token: string;
  balance: string;
  entryValue: string;
  allocation: string;
  currentValue: string;
}

export default function SpotTokenHoldings({ address }: SpotTokenHoldingsProps) {
  // (truncate, never round) ---
  const trunc = (n: number, d = 2) => {
    if (!Number.isFinite(n)) return NaN;
    const f = 10 ** d;
    return Math.trunc(n * f) / f;
  };
  const compact = (
    value: number | null | undefined,
    d = 2,
    prefix = "",
  ): string => {
    const n = Number(value);
    if (!isFinite(n)) return "-";
    const sign = n < 0 ? "-" : "";
    let abs = Math.abs(n);
    let suffix = "";
    if (abs >= 1e12) {
      abs /= 1e12;
      suffix = "T";
    } else if (abs >= 1e9) {
      abs /= 1e9;
      suffix = "B";
    } else if (abs >= 1e6) {
      abs /= 1e6;
      suffix = "M";
    } else if (abs >= 1e3) {
      abs /= 1e3;
      suffix = "K";
    }
    const t = trunc(abs, d).toFixed(d); // keep two decimals; remove trailing zeros right after
    const cleaned = t
      .replace(/\.0+$|(?<=\.\d*[1-9])0+$/g, "")
      .replace(/\.$/, "");
    return `${sign}${prefix}${cleaned}${suffix}`;
  };
  const usd = (v: number | null | undefined) => compact(v, 2, "$");
  const pct = (v: number) => trunc(v, 2).toFixed(2); // always show exactly 2
  const [rawRows, setRawRows] = useState<RawRow[]>([]);
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
            "2000-01-01 00:00",
          )}`,
        );
        if (!res.ok) throw new Error("Failed to load spot holdings");
        const data = await res.json();
        const holdings = (data?.user_spot_state?.["Holdings"] || []) as any[];
        // Assumption: h.entry is TOTAL entry USD value; h.value_in_usd is current total USD value
        const mapped: RawRow[] = holdings.map((h) => ({
          token: String(h?.coin ?? "-"),
          balance: Number(h?.total ?? 0),
          entryValue: Number(h?.entry ?? 0),
          currentValue:
            h?.value_in_usd !== undefined ? Number(h.value_in_usd) : null,
        }));
        if (!cancelled) {
          setRawRows(mapped);
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

  const totalPages = Math.max(1, Math.ceil(rawRows.length / pageSize));

  const sumEntry = useMemo(
    () =>
      rawRows.reduce(
        (acc, r) => acc + (isFinite(r.entryValue) ? r.entryValue : 0),
        0,
      ),
    [rawRows],
  );

  const paged: DisplayRow[] = useMemo(() => {
    const start = (page - 1) * pageSize;
    const slice = rawRows.slice(start, start + pageSize);
    return slice.map((r) => {
      const alloc = sumEntry > 0 ? (r.entryValue / sumEntry) * 100 : 0;
      return {
        token: r.token,
        balance: compact(r.balance),
        entryValue: usd(r.entryValue),
        allocation: `${pct(alloc)}%`,
        currentValue: r.currentValue == null ? "N/A" : usd(r.currentValue),
      };
    });
  }, [rawRows, page, sumEntry]);

  // Aggregated metrics
  type Metrics = {
    count: number;
    totalValue: number;
    topToken: string;
    topValue: number;
  } | null;
  const metrics = useMemo(() => {
    if (!rawRows.length) return null;
    let totalValue = 0;
    let topToken = "-";
    let topValue = 0;
    rawRows.forEach((r) => {
      totalValue += r.entryValue;
      if (r.entryValue > topValue) {
        topValue = r.entryValue;
        topToken = r.token;
      }
    });
    return { count: rawRows.length, totalValue, topToken, topValue };
  }, [rawRows]);

  return (
    <section className="space-y-5 font-geist-sans max-w-6xl w-full mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">
          Spot Token Holdings
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Current token balances and allocations
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {loading && !rawRows.length
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
                  value={usd(metrics.totalValue)}
                />
                <MetricCard label="Top Token Entry" value={metrics.topToken} />
                <MetricCard
                  label="Top Value at Entry"
                  value={usd(metrics.topValue)}
                />
              </>
            )}
      </div>

      <div className="rounded-2xl border border-[#DDE6FF] bg-white overflow-x-auto">
        <table className="w-full table-fixed text-left text-[11px] sm:text-xs md:text-sm">
          <thead className="bg-[#EAF1FF] w-full text-[9px] sm:text-xs text-black/70">
            <tr>
              <th className="px-3 sm:px-5 py-2 sm:py-3 font-medium w-[18%] sm:w-[34%] md:w-[30%]">
                Token
              </th>
              <th className="px-3 sm:px-5 py-2 sm:py-3 font-medium w-[14%] sm:w-[24%] md:w-[24%]">
                Balance
              </th>
              <th className="px-3 sm:px-5 py-2 sm:py-3 font-medium w-[22%] sm:w-[22%] md:w-[26%]">
                Value at Entry
              </th>
              <th className="px-3 sm:px-5 py-2 sm:py-3 font-medium w-[20%] sm:w-[20%] md:w-[20%]">
                Alloc
              </th>
              <th className="px-3 sm:px-5 py-2 sm:py-3 font-medium w-[22%] sm:w-[20%] md:w-[20%]">
                Current Value
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.map((r) => (
              <tr
                key={r.token}
                className="border-t border-[#EEF3FF] text-[10px] sm:text-[11px] md:text-sm"
              >
                <td
                  className="px-3 sm:px-5 py-3 font-medium whitespace-nowrap truncate"
                  title={r.token}
                >
                  {r.token}
                </td>
                <td
                  className="px-3 sm:px-5 py-3 whitespace-nowrap"
                  title={r.balance}
                >
                  {r.balance}
                </td>
                <td
                  className="px-3 sm:px-5 py-3 whitespace-nowrap"
                  title={r.entryValue}
                >
                  {r.entryValue}
                </td>
                <td
                  className="px-3 sm:px-5 py-3 whitespace-nowrap"
                  title={r.allocation}
                >
                  {r.allocation}
                </td>
                <td
                  className="px-3 sm:px-5 py-3 whitespace-nowrap"
                  title={r.currentValue}
                >
                  {r.currentValue}
                </td>
              </tr>
            ))}
            {paged.length === 0 && !loading && !error && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 sm:px-5 py-6 text-center text-gray-600 text-xs sm:text-sm"
                >
                  No holdings
                </td>
              </tr>
            )}
            {loading &&
              !rawRows.length &&
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
      {rawRows.length > pageSize && (
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
