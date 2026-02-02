"use client";
import React, { useEffect, useState } from "react";
import { formatNumberCompact } from "@/lib/utils";

type ApiSummary = Record<string, number | string | null | undefined>;

interface StakingSummaryProps {
  address: string;
}

export default function StakingSummary({ address }: StakingSummaryProps) {
  const [title, setTitle] = useState("Staking Summary");
  const [summary, setSummary] = useState<ApiSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/user-info/${address}?start_time=${encodeURIComponent(
            "2000-01-01 00:00",
          )}`,
        );
        if (!res.ok) throw new Error("Failed to load staking summary");
        const data = await res.json();
        const root = data?.staking_summary || {};
  
        const topKeys = Object.keys(root);

        if (topKeys.length) {
          const k = topKeys[0];
          const obj = root[k];
       

          if (!cancelled && obj && typeof obj === "object") {
            setTitle(k || "Staking Summary");
            setSummary(obj as ApiSummary);
          }
        } else if (!cancelled) {
          setSummary(null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address]);

  const entries = summary
    ? Object.entries(summary).map(([k, v]) => ({
        key: k,
        value:
          typeof v === "number"
            ? formatNumberCompact(v, 6)
            : (v ?? "-").toString() || "-",
      }))
    : [];

  const colSpan = Math.max(entries.length, 1);

  // Produce a shortened mobile-friendly label for long phrases
  const shortLabel = (label: string) => {
    const l = label.toLowerCase();
    return l
      .replace(/number/g, "no.")
      .replace(/total/g, "tot.")
      .replace(/pending/g, "pend.")
      .replace(/withdrawals/g, "wds")
      .replace(/withdrawal/g, "wd")
      .replace(/undelegated/g, "undeleg.")
      .replace(/delegated/g, "deleg.")
      .replace(/\s+/g, " ")
      .trim();
  };
  return (
    <section className="space-y-5 font-geist-sans max-w-6xl w-full mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>
        <p className="text-xs sm:text-sm text-gray-600">
          On-chain staking status
        </p>
      </div>

      <div className="rounded-2xl border border-[#DDE6FF] bg-white overflow-x-auto">
        <table className="w-full table-fixed text-left text-[11px] sm:text-xs md:text-sm">
          <thead className="bg-[#EAF1FF] w-full text-[9px] sm:text-xs text-black/70">
            <tr>
              {entries.map((e) => (
                <th
                  key={e.key}
                  className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 font-medium whitespace-nowrap"
                >
                  <span className="md:hidden capitalize">
                    {shortLabel(e.key)}
                  </span>
                  <span className="hidden md:inline">{e.key}</span>
                </th>
              ))}
              {!entries.length && (
                <th className="px-3 py-2 font-medium">Summary</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr className="animate-pulse">
                <td
                  colSpan={colSpan}
                  className="px-3 sm:px-5 py-6 text-center text-black/40"
                >
                  Loading…
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td
                  colSpan={colSpan}
                  className="px-3 sm:px-5 py-6 text-center text-red-500 text-xs sm:text-sm"
                >
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && entries.length > 0 && (
              <tr className="border-t border-[#EEF3FF]">
                {entries.map((e) => (
                  <td
                    key={e.key}
                    className="text-[10px] sm:text-[15px] px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 whitespace-nowrap"
                  >
                    {e.value}
                  </td>
                ))}
              </tr>
            )}
            {!loading && !error && entries.length === 0 && (
              <tr>
                <td
                  colSpan={colSpan}
                  className="px-3 sm:px-5 py-6 text-center text-gray-600 text-xs sm:text-sm"
                >
                  No staking data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
