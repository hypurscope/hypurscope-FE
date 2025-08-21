"use client";
import React, { useEffect, useMemo, useState } from "react";
import { formatNumberCompact, formatUSDCompact } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";

type SpotTokenHoldingsProps = { address: string };

type Row = {
  token: string;
  balance: string; // compact amount, no commas
  value: string; // USD compact
  allocation: string; // percent with %
};

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
          const total = Number(h?.total ?? 0); // quantity
          const entry = Number(h?.entry ?? 0); // USD price per unit
          const usd = total * entry;
          return { coin, total, entry, usd };
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

  return (
    <section className="space-y-3 font-geist-sans">
      <div>
        <h2 className="text-xl font-semibold">Spot Token Holdings</h2>
        <p className="text-sm text-black/50">
          Current token balances and allocations
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#DDE6FF] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#EAF1FF] text-[12px] text-black/70">
            <tr>
              <th className="px-5 py-3 font-medium">Token</th>
              <th className="px-5 py-3 font-medium">Balance</th>
              <th className="px-5 py-3 font-medium">Value</th>
              <th className="px-5 py-3 font-medium">Allocation</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((r) => (
              <tr key={r.token} className="border-t border-[#EEF3FF]">
                <td className="px-5 py-4">{r.token}</td>
                <td className="px-5 py-4">{r.balance}</td>
                <td className="px-5 py-4">{r.value}</td>
                <td className="px-5 py-4">{r.allocation}</td>
              </tr>
            ))}
            {paged.length === 0 && !loading && (
              <tr>
                <td className="px-5 py-6 text-center text-black/50" colSpan={4}>
                  No holdings
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
