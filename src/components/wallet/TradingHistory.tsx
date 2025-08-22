"use client";
import React, { useEffect, useMemo, useState } from "react";
import { formatNumberCompact } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import MetricCard from "@/components/dashboard/MetricCard";

type TradingHistoryProps = {
  address: string;
};

type Row = {
  tokenName: string;
  entryPrice: string; // formatted
  entryPriceNum: number;
  dir: string;
  transactionId: string; // formatted id
  transactionHash: string; // raw hash
  feePaid: string; // formatted fee
  feePaidNum: number;
  closedPnl: string; // formatted closed pnl
  closedPnlNum: number;
  tradeSize: string; // formatted size
  tradeSizeNum: number;
};

const rowsDefault: Row[] = [];
// Lightweight media query hook (mirrors pattern in TokenHolders)
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const handler = () => setMatches(mql.matches);
    handler();
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}
const GREEN = "#25AD32";
const RED = "#E5484D";

export default function TradingHistory({ address }: TradingHistoryProps) {
  const [rows, setRows] = useState<Row[]>(rowsDefault);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

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
        if (!res.ok) throw new Error("Failed to load trading history");
        const data = await res.json();
        const arr = (data?.trading_history?.["Trading History"] || []) as any[];
        const mapped: Row[] = arr.map((r) => {
          const token = String(r?.["token name"] ?? "-");
          const entry = Number(r?.["entry price"] ?? 0);
          const dir = String(r?.["dir"] ?? "-");
          const txId = String(r?.["transaction id"] ?? "-");
          const txHash = String(r?.["transaction hash"] ?? "");
          const fee = Number(r?.["fee paid"] ?? 0);
          const closed = Number(r?.["closed PnL"] ?? 0);
          const size = Number(r?.["trade size"] ?? 0);
          return {
            tokenName: token,
            entryPrice: formatNumberCompact(entry, 5),
            entryPriceNum: entry,
            dir,
            transactionId: formatNumberCompact(Number(txId), 0),
            transactionHash: txHash,
            feePaid: formatNumberCompact(fee, 5),
            feePaidNum: fee,
            closedPnl: formatNumberCompact(closed, 5),
            closedPnlNum: closed,
            tradeSize: formatNumberCompact(size, 5),
            tradeSizeNum: size,
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

  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 900px)");

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page]);

  const renderHash = (hash: string) => {
    if (!hash) return "-";
    const short = `${hash.slice(0, 6)}…${hash.slice(-4)}`;
    const url = `https://hypurrscan.io/tx/${hash}`; // swap to HyperEVM explorer if needed
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        className="text-[#1969FE] underline underline-offset-2"
        title={hash}
      >
        {short}
      </a>
    );
  };

  // Aggregated metrics (computed after rows fetched)
  const metrics = useMemo(() => {
    if (!rows.length) return null;
    let wins = 0;
    let totalFees = 0;
    let netPnl = 0;
    rows.forEach((r) => {
      if (r.closedPnlNum > 0) wins += 1;
      totalFees += r.feePaidNum;
      netPnl += r.closedPnlNum;
    });
    return {
      totalTrades: rows.length,
      winRate: rows.length ? (wins / rows.length) * 100 : 0,
      totalFees,
      netPnl,
    };
  }, [rows]);

  return (
    <section className="space-y-6 max-w-5xl w-full mx-auto mt-8 font-geist-sans">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">Trade History</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {loading && !rows.length
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[10px] min-w-[140px] border border-[#DFDFDF] bg-white py-4 px-4 flex flex-col gap-1 animate-pulse"
              >
                <div className="h-3 w-16 bg-gray-200 rounded" />
                <div className="h-5 w-20 bg-gray-200 rounded" />
              </div>
            ))
          : metrics && (
              <>
                <MetricCard
                  label="Trades"
                  value={String(metrics.totalTrades)}
                />
                <MetricCard
                  label="Win %"
                  value={`${metrics.winRate.toFixed(isMobile ? 1 : 2)}%`}
                />
                <MetricCard
                  label="Fees"
                  value={formatNumberCompact(metrics.totalFees, 2)}
                />
                <MetricCard
                  label="Net PnL"
                  value={`${metrics.netPnl > 0 ? "+" : ""}${formatNumberCompact(
                    Math.abs(metrics.netPnl),
                    2
                  )}`}
                />
              </>
            )}
      </div>

      <div className="rounded-2xl border border-[#DDE6FF] bg-white overflow-x-auto max-w-full">
        <table className="w-full min-w-full table-fixed text-left text-[10px] sm:text-[11px] md:text-sm">
          <thead className="bg-[#EAF1FF] text-[9px] sm:text-[10px] md:text-xs text-black/70">
            <tr>
              <th className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 font-medium w-[30%] sm:w-[14%] whitespace-nowrap">
                Token
              </th>
              <th className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 font-medium w-[18%] sm:w-[14%] whitespace-nowrap">
                Entry
              </th>
              <th className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 font-medium w-[18%] sm:w-[10%] whitespace-nowrap">
                Direction
              </th>
              <th className="hidden sm:table-cell px-1 py-2 sm:px-3 md:px-5 sm:py-2.5 md:py-3 font-medium md:w-[12%] whitespace-nowrap">
                <span className="md:hidden">ID</span>
                <span className="hidden md:inline">Tx ID</span>
              </th>
              <th className="hidden sm:table-cell px-1 py-2 sm:px-3 md:px-5 sm:py-2.5 md:py-3 font-medium md:w-[18%] whitespace-nowrap">
                <span className="md:hidden">Hash</span>
                <span className="hidden md:inline">Tx Hash</span>
              </th>
              <th className="hidden sm:table-cell px-1 py-2 sm:px-3 md:px-5 sm:py-2.5 md:py-3 font-medium md:w-[10%] whitespace-nowrap">
                Fee
              </th>
              <th className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 font-medium w-[22%] sm:w-[12%] whitespace-nowrap">
                Closed PnL
              </th>
              <th className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 font-medium w-[12%] sm:w-[10%] whitespace-nowrap">
                Size
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.map((r, idx) => {
              const closedColor = r.closedPnlNum >= 0 ? GREEN : RED;
              const entryDisp = isMobile
                ? formatNumberCompact(r.entryPriceNum, 3)
                : r.entryPrice;
              const feeDisp = isMobile
                ? formatNumberCompact(r.feePaidNum, 3)
                : r.feePaid;
              const sizeDisp = isMobile
                ? formatNumberCompact(r.tradeSizeNum, 3)
                : r.tradeSize;
              const closedDisp = isMobile
                ? formatNumberCompact(r.closedPnlNum, 3)
                : r.closedPnl;
              return (
                <tr
                  key={idx}
                  className="border-t border-[#EEF3FF] text-[9px] sm:text-[10px] md:text-[11px] lg:text-sm"
                >
                  <td className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 whitespace-nowrap font-medium w-[30%] sm:w-auto">
                    {r.tokenName}
                  </td>
                  <td className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 whitespace-nowrap w-[18%] sm:w-auto">
                    {entryDisp}
                  </td>
                  <td className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 whitespace-nowrap w-[18%] sm:w-auto">
                    <span className="inline-flex items-center rounded-full border border-black/10 px-1.5 py-0.5 text-[8px] sm:text-[9px] md:text-[11px] text-black/70">
                      {r.dir}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 whitespace-nowrap">
                    {r.transactionId}
                  </td>
                  <td
                    className="hidden sm:table-cell px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 whitespace-nowrap overflow-hidden truncate"
                    title={r.transactionHash}
                  >
                    {renderHash(r.transactionHash)}
                  </td>
                  <td className="hidden sm:table-cell px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 whitespace-nowrap">
                    {feeDisp}
                  </td>
                  <td
                    className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 whitespace-nowrap w-[22%] sm:w-auto"
                    style={{ color: closedColor }}
                  >
                    {r.closedPnlNum > 0 ? "+" : ""}
                    {closedDisp}
                  </td>
                  <td className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 whitespace-nowrap w-[12%] sm:w-auto">
                    {sizeDisp}
                  </td>
                </tr>
              );
            })}
            {paged.length === 0 && !loading && (
              <tr>
                <td
                  className="px-3 sm:px-5 py-6 text-center text-black/50 text-xs sm:text-sm"
                  colSpan={8}
                >
                  No trades
                </td>
              </tr>
            )}
            {loading &&
              !rows.length &&
              Array.from({ length: 8 }).map((_, i) => (
                <tr
                  key={`sk-${i}`}
                  className="border-t border-[#EEF3FF] animate-pulse"
                >
                  <td className="px-2 sm:px-4 md:px-5 py-3">
                    <div className="h-3 w-14 bg-gray-200 rounded" />
                  </td>
                  <td className="px-2 sm:px-4 md:px-5 py-3">
                    <div className="h-3 w-12 bg-gray-200 rounded" />
                  </td>
                  <td className="px-2 sm:px-4 md:px-5 py-3">
                    <div className="h-3 w-8 bg-gray-200 rounded" />
                  </td>
                  <td className="hidden sm:table-cell px-2 sm:px-4 md:px-5 py-3">
                    <div className="h-3 w-10 bg-gray-200 rounded" />
                  </td>
                  <td className="hidden sm:table-cell px-2 sm:px-4 md:px-5 py-3">
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                  </td>
                  <td className="hidden sm:table-cell px-2 sm:px-4 md:px-5 py-3">
                    <div className="h-3 w-10 bg-gray-200 rounded" />
                  </td>
                  <td className="px-2 sm:px-4 md:px-5 py-3">
                    <div className="h-3 w-12 bg-gray-200 rounded" />
                  </td>
                  <td className="px-2 sm:px-4 md:px-5 py-3">
                    <div className="h-3 w-12 bg-gray-200 rounded" />
                  </td>
                </tr>
              ))}
            {error && !loading && (
              <tr>
                <td
                  colSpan={8}
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
          className=" px-3 py-3 mt-5"
        />
      )}
    </section>
  );
}
