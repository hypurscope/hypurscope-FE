"use client";
import React, { useEffect, useMemo, useState } from "react";
import { formatNumberCompact } from "@/lib/utils";
import MetricCard from "@/components/dashboard/MetricCard";

type DelegationSummaryProps = { address: string };

type Row = {
  validator: string;
  amount: string; // compact, no commas
  lockedUntil: string; // date string
};

// Lightweight media query hook (parity with TokenHolders)
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

  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <section className="space-y-6 font-geist-sans max-w-5xl w-full mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">
          Delegation Summary
        </h2>
        <p className="text-xs sm:text-sm text-black/50">
          Your current delegations
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {loading && !rows.length ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[10px] min-w-[120px] border border-[#DFDFDF] bg-white py-4 px-4 flex flex-col gap-1 animate-pulse"
            >
              <div className="h-3 w-16 bg-gray-200 rounded" />
              <div className="h-5 w-20 bg-gray-200 rounded" />
            </div>
          ))
        ) : (
          <>
            <MetricCard label="Total Delegated" value={totalDelegated} />
            <MetricCard label="Active Validators" value={activeValidators} />
          </>
        )}
      </div>

      <div className="rounded-2xl border border-[#DDE6FF] bg-white overflow-x-auto">
        <table className="w-full table-fixed text-left text-[11px] sm:text-xs md:text-sm">
          <thead className="bg-[#EAF1FF] text-[10px] sm:text-xs text-black/70">
            <tr>
              <th className="px-3 sm:px-5 py-2 sm:py-3 font-medium w-[40%] sm:w-[38%] md:w-[40%]">
                Validator
              </th>
              <th className="px-3 sm:px-5 py-2 sm:py-3 font-medium w-[30%] sm:w-[30%] md:w-[30%]">
                Amount
              </th>
              <th className="px-3 sm:px-5 py-2 sm:py-3 font-medium w-[30%] sm:w-[32%] md:w-[30%]">
                <span className="sm:hidden">Locked</span>
                <span className="hidden sm:inline">Locked Until</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.validator + r.lockedUntil}
                className="border-t border-[#EEF3FF] text-[10px] sm:text-[11px] md:text-sm"
              >
                <td
                  className="px-3 sm:px-5 py-3 font-mono align-middle whitespace-nowrap overflow-hidden truncate"
                  title={r.validator}
                >
                  {r.validator}
                </td>
                <td
                  className="px-3 sm:px-5 py-3 align-middle whitespace-nowrap"
                  title={r.amount}
                >
                  {r.amount}
                </td>
                <td
                  className="px-3 sm:px-5 py-3 align-middle whitespace-nowrap"
                  title={r.lockedUntil}
                >
                  {r.lockedUntil}
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && !error && (
              <tr>
                <td
                  colSpan={3}
                  className="px-3 sm:px-5 py-6 text-center text-black/50 text-xs sm:text-sm"
                >
                  No delegations
                </td>
              </tr>
            )}
            {loading &&
              !rows.length &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr
                  key={`sk-${i}`}
                  className="border-t border-[#EEF3FF] animate-pulse"
                >
                  <td className="px-3 sm:px-5 py-3">
                    <div className="h-3 w-28 bg-gray-200 rounded" />
                  </td>
                  <td className="px-3 sm:px-5 py-3">
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                  </td>
                  <td className="px-3 sm:px-5 py-3">
                    <div className="h-3 w-20 bg-gray-200 rounded" />
                  </td>
                </tr>
              ))}
            {error && !loading && (
              <tr>
                <td
                  colSpan={3}
                  className="px-3 sm:px-5 py-6 text-center text-red-500 text-xs sm:text-sm"
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
