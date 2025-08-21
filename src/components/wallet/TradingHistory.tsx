"use client";
import React, { useEffect, useMemo, useState } from "react";
import { formatNumberCompact } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";

type TradingHistoryProps = {
  address: string;
};

type Row = {
  tokenName: string;
  entryPrice: string;
  dir: string;
  transactionId: string;
  transactionHash: string; // raw hash
  feePaid: string;
  closedPnl: string;
  closedPnlNum: number;
  tradeSize: string;
};

const rowsDefault: Row[] = [];
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
            dir,
            transactionId: formatNumberCompact(Number(txId), 0),
            transactionHash: txHash,
            feePaid: formatNumberCompact(fee, 5),
            closedPnl: formatNumberCompact(closed, 5),
            closedPnlNum: closed,
            tradeSize: formatNumberCompact(size, 5),
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

  return (
    <section className="space-y-4 max-w-5xl w-full mx-auto mt-8 font-geist-sans">
      <div>
        <h2 className="text-2xl font-semibold">Trade History</h2>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#DDE6FF] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#EAF1FF] text-[12px] text-black/70">
            <tr>
              <th className="px-5 py-3 font-medium">Token Name</th>
              <th className="px-5 py-3 font-medium">Entry Price</th>
              <th className="px-5 py-3 font-medium">Direction</th>
              <th className="px-5 py-3 font-medium">Transaction ID</th>
              <th className="px-5 py-3 font-medium">Transaction Hash</th>
              <th className="px-5 py-3 font-medium">Fee Paid</th>
              <th className="px-5 py-3 font-medium">Closed PnL</th>
              <th className="px-5 py-3 font-medium">Trade Size</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((r, idx) => (
              <tr key={idx} className="border-t border-[#EEF3FF]">
                <td className="px-5 py-4">{r.tokenName}</td>
                <td className="px-5 py-4">{r.entryPrice}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center rounded-full border border-black/10 px-2 py-0.5 text-[11px] text-black/70">
                    {r.dir}
                  </span>
                </td>
                <td className="px-5 py-4">{r.transactionId}</td>
                <td className="px-5 py-4">{renderHash(r.transactionHash)}</td>
                <td className="px-5 py-4">{r.feePaid}</td>
                <td
                  className="px-5 py-4"
                  style={{ color: r.closedPnlNum >= 0 ? GREEN : RED }}
                >
                  {r.closedPnlNum > 0 ? "+" : ""}
                  {r.closedPnl}
                </td>
                <td className="px-5 py-4">{r.tradeSize}</td>
              </tr>
            ))}
            {paged.length === 0 && !loading && (
              <tr>
                <td className="px-5 py-6 text-center text-black/50" colSpan={8}>
                  No trades
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && <div className="p-4 text-sm text-gray-500">Loading…</div>}
        {error && <div className="p-4 text-sm text-red-500">{error}</div>}
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
