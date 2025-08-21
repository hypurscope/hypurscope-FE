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
            "2000-01-01 00:00"
          )}`
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
            size: `${formatNumberCompact(sizeNum, 4)} ${coin}`,
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
  return (
    <section className="space-y-4 max-w-5xl w-full mx-auto mt-8 font-geist-sans ">
      <div>
        <h2 className="text-2xl font-semibold">Open Positions</h2>
        <p className="text-sm text-black/50">Current trading positions</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#DDE6FF] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#EAF1FF] text-[12px] text-black/70">
            <tr>
              <th className="px-5 py-3 font-medium">Asset</th>
              <th className="px-5 py-3 font-medium">Size</th>
              <th className="px-5 py-3 font-medium">Notional Value</th>
              <th className="px-5 py-3 font-medium">Entry Price</th>
              <th className="px-5 py-3 font-medium">Unrealized PnL</th>
              <th className="px-5 py-3 font-medium">PnL %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.asset} className="border-t border-[#EEF3FF]">
                <td className="px-5 py-4">{r.asset}</td>
                <td className="px-5 py-4">{r.size}</td>
                <td className="px-5 py-4">{r.notional}</td>
                <td className="px-5 py-4">{r.entryPrice}</td>
                <td className="px-5 py-4">{r.pnl}</td>
                <td
                  className="px-5 py-4"
                  style={{ color: (r.pnlPct ?? 0) >= 0 ? GREEN : RED }}
                >
                  {r.pnlPct !== undefined ? (
                    <>{(r.pnlPct >= 0 ? "+" : "") + r.pnlPct.toFixed(2)}%</>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td className="px-5 py-6 text-center text-black/50" colSpan={6}>
                  No open positions
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && <div className="p-4 text-sm text-gray-500">Loading…</div>}
        {error && <div className="p-4 text-sm text-red-500">{error}</div>}
      </div>
    </section>
  );
}
