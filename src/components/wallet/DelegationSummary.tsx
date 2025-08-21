"use client";
import React, { useEffect, useMemo, useState } from "react";
import { formatNumberCompact } from "@/lib/utils";

type DelegationSummaryProps = { address: string };

type Row = {
  validator: string;
  amount: string; // compact, no commas
  lockedUntil: string; // date string
};

export default function DelegationSummary({ address }: DelegationSummaryProps) {
  const [rows, setRows] = useState<Row[]>([]);
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
        if (!res.ok) throw new Error("Failed to load delegations");
        const data = await res.json();
        const arr = (data?.staking_delegation?.["Delegations"] || []) as any[];
        const mapped: Row[] = arr.map((d) => {
          const validator = String(d?.validator ?? "-");
          const amount = Number(d?.amount ?? 0);
          const ts = Number(d?.["locked Until Time"] ?? 0);
          const date = new Date(ts);
          const dateStr = isFinite(date.getTime())
            ? date.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })
            : "-";
          return {
            validator,
            amount: formatNumberCompact(amount, 2),
            lockedUntil: dateStr,
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

  const totalDelegated = useMemo(
    () =>
      formatNumberCompact(
        rows.reduce((a, r) => a + Number(r.amount.replace(/[^\d.-]/g, "")), 0),
        2
      ),
    [rows]
  );
  const activeValidators = rows.length.toString();

  return (
    <section className="space-y-5 font-geist-sans">
      <div>
        <h2 className="text-xl font-semibold">Delegation Summary</h2>
        <p className="text-sm text-black/50">Your current delegations</p>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <div className="space-y-1">
          <div className="text-xs text-black/50">Total Delegated</div>
          <div className="text-base font-medium">{totalDelegated}</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-black/50">Active Validators</div>
          <div className="text-base font-medium">{activeValidators}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#DDE6FF] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#EAF1FF] text-[12px] text-black/70">
            <tr>
              <th className="px-5 py-3 font-medium">Validator</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Locked Until</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.validator + r.lockedUntil}
                className="border-t border-[#EEF3FF]"
              >
                <td className="px-5 py-4 font-mono text-[12px]">
                  {r.validator}
                </td>
                <td className="px-5 py-4">{r.amount}</td>
                <td className="px-5 py-4">{r.lockedUntil}</td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td className="px-5 py-6 text-center text-black/50" colSpan={3}>
                  No delegations
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
