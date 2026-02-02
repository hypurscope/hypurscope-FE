"use client";
import React, { useEffect, useState } from "react";
import { formatNumberCompact, formatUSDCompact } from "@/lib/utils";

type OpenPositionsProps = {
  address: string;
};

type Row = {
  asset: string; // coin symbol
  size: string; // formatted size with sign
  notional: string; // position value
  entryPrice: string; // entry price (replaces mark price)
  pnl: string; // currency string with sign
  pnlPct?: number; // positive or negative number if computable
};

const rowsDefault: Row[] = [];

const GREEN = "#25AD32";
const RED = "#E5484D";

// Lightweight media query hook (mirrors pattern in TokenHolders)
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const handler = () => setMatches(mql.matches);
    handler();
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export default function OpenPositions({ address }: OpenPositionsProps) {
  const [rows, setRows] = useState<Row[]>(rowsDefault);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        if (!res.ok) throw new Error("Failed to load user state");
        const data = await res.json();
        const positions = (data?.user_state?.["Open Positions"] || []) as any[];
        const mapped: Row[] = positions.map((p) => {
          const coin = String(p?.coin ?? "-");
          const sizeNum = Number(p?.size ?? 0);
          const entry = Number(p?.entry_price ?? 0);
          const value = Number(p?.position_value ?? 0);
          const upnl = Number(p?.unrealized_pnl ?? 0);
          // Try computing pnl% as upnl / (|size| * entry_price) if both present, fallback to upnl/value if value != 0
          let pnlPct: number | undefined = undefined;
          const basis1 = Math.abs(sizeNum) * entry;
          if (basis1 > 0) pnlPct = (upnl / basis1) * 100;
          else if (Math.abs(value) > 0) pnlPct = (upnl / value) * 100;

          return {
            asset: coin,
            size: formatNumberCompact(sizeNum, 4),
            notional: formatUSDCompact(value),
            entryPrice: formatUSDCompact(entry),
            pnl: `${upnl >= 0 ? "+" : "-"}${formatUSDCompact(Math.abs(upnl))}`,
            pnlPct,
          };
        });
        if (!cancelled) setRows(mapped);
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
  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <section className="space-y-4 max-w-5xl w-full mx-auto md:mt-8 font-geist-sans">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">Open Positions</h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Current trading positions
        </p>
      </div>

      <div className="rounded-2xl border border-[#DDE6FF] bg-white">
        <table className="w-full table-fixed text-left text-[11px] sm:text-xs md:text-sm">
          <thead className="bg-[#EAF1FF] text-[10px] rounded-t-[20px] sm:text-xs text-black/70">
            <tr>
              <th className="px-2  md:px-5 py-2 sm:py-3 font-medium w-[14%]">
                Asset
              </th>
              <th className="px-2 sm:px-4 md:px-5 py-2 sm:py-3 font-medium w-[18%]">
                Size
              </th>
              <th className="px-2 sm:px-4 md:px-5 py-2 sm:py-3 font-medium w-[18%]">
                Notional
              </th>
              <th className="px-2 sm:px-4 md:px-5 py-2 sm:py-3 font-medium w-[14%]">
                Entry
              </th>
              <th className="px-2 sm:px-4 md:px-5 py-2 sm:py-3 font-medium w-[18%]">
                uPnL
              </th>
              <th className="px-2 sm:px-4 md:px-5 py-2 sm:py-3 font-medium w-[12%]">
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              // Display scaled percentage (original pnlPct * 10) per user request
              const pct =
                r.pnlPct !== undefined
                  ? `${r.pnlPct >= 0 ? "+" : ""}${(r.pnlPct * 10).toFixed(
                      isMobile ? 1 : 2,
                    )}%`
                  : "—";
              const sizeShort = isMobile
                ? r.size.replace(/(\d+\.\d{2})(\d*)/, "$1")
                : r.size;
              return (
                <tr
                  key={r.asset}
                  className="border-t text-[10px] border-[#EEF3FF]"
                >
                  <td className="px-1 md:px-5 py-3 align-middle whitespace-nowrap font-medium">
                    {r.asset}
                  </td>
                  <td className="px-1  md:px-5 py-3 align-middle overflow-hidden whitespace-nowrap truncate">
                    {sizeShort}
                  </td>
                  <td className="px-1 md:px-5 py-3 align-middle whitespace-nowrap">
                    {r.notional}
                  </td>
                  <td className="px-1 md:px-5 py-3 align-middle whitespace-nowrap">
                    {r.entryPrice}
                  </td>
                  <td className="px-1 md:px-5 py-3 w-fit align-middle whitespace-nowrap overflow-hidden truncate">
                    {r.pnl}
                  </td>
                  <td
                    className="px-2 sm:px-4 md:px-5 py-3 align-middle whitespace-nowrap"
                    style={{ color: (r.pnlPct ?? 0) >= 0 ? GREEN : RED }}
                  >
                    {pct}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && !loading && !error && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-gray-600 text-xs sm:text-sm"
                >
                  No open positions
                </td>
              </tr>
            )}
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr
                  key={`sk-${i}`}
                  className="border-t border-[#EEF3FF] animate-pulse"
                >
                  <td className="px-2 sm:px-4 md:px-5 py-3">
                    <div className="h-3 w-10 bg-gray-200 rounded" />
                  </td>
                  <td className="px-2 sm:px-4 md:px-5 py-3">
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                  </td>
                  <td className="px-2 sm:px-4 md:px-5 py-3">
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                  </td>
                  <td className="px-2 sm:px-4 md:px-5 py-3">
                    <div className="h-3 w-14 bg-gray-200 rounded" />
                  </td>
                  <td className="px-2 sm:px-4 md:px-5 py-3">
                    <div className="h-3 w-20 bg-gray-200 rounded" />
                  </td>
                  <td className="px-2 sm:px-4 md:px-5 py-3">
                    <div className="h-3 w-8 bg-gray-200 rounded" />
                  </td>
                </tr>
              ))}
            {error && !loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-red-500 text-xs sm:text-sm"
                >
                  {error}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
