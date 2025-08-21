"use client";
import React, { useEffect, useMemo, useState } from "react";
import SpotChart from "@/components/common/SpotChart";
import MetricCard from "./MetricCard";
import type { HoldersTrendPoint } from "@/types";
import DateRangeTabs from "@/components/common/DateRangeTabs";

type ApiItem = {
  lastUpdate: number; // unix seconds
  totalSpotUSDC: number;
  holdersCount: number;
  "HIP-2": number;
};

const fmtMillionsUSD = (n: number) => `$${n.toFixed(2)}M`;
const fmtNumber = (n: number) => new Intl.NumberFormat().format(Math.round(n));

const USDCSpotHolders: React.FC = () => {
  const [raw, setRaw] = useState<ApiItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/spot-info", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load spot info");
        const json = await res.json();
        const arr: ApiItem[] = Array.isArray(json?.items) ? json.items : [];
        if (!cancelled) setRaw(arr);
      } catch (e: any) {
        if (!cancelled && e.name !== "AbortError")
          setError(e?.message ?? "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const [range, setRange] = useState<"24h" | "7D" | "30D" | "90D">("7D");

  const chartData: HoldersTrendPoint[] = useMemo(() => {
    if (!raw) return [];
    const all = raw.map((r) => {
      const tsMs = (Number(r.lastUpdate) || 0) * 1000; // seconds -> ms
      const d = new Date(tsMs);
      const date = d.toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
      });
      return {
        date,
        ts: tsMs,
        spotUSDCM: (Number(r.totalSpotUSDC) || 0) / 1e6,
        holders: Number(r.holdersCount) || 0,
        hip2M: (Number(r["HIP-2"]) || 0) / 1e6,
      } as HoldersTrendPoint;
    });
    if (all.length === 0) return all;
    const maxTs = Math.max(...all.map((p) => p.ts ?? 0));
    const dayMs = 24 * 60 * 60 * 1000;
    const windowMs =
      range === "24h"
        ? dayMs
        : range === "7D"
        ? 7 * dayMs
        : range === "30D"
        ? 30 * dayMs
        : 90 * dayMs;
    const threshold = maxTs - windowMs;
    const sliced = all.filter((p) => (p.ts ?? 0) >= threshold);
    return sliced.length > 0 ? sliced : all.slice(-1);
  }, [raw, range]);

  const metrics = useMemo(() => {
    if (!raw || raw.length === 0) return null;
    const latest = raw[raw.length - 1];
    const tsMs = (Number(latest.lastUpdate) || 0) * 1000;
    const dateStr = new Date(tsMs).toLocaleDateString();
    const totalSpotUSDCM = (Number(latest.totalSpotUSDC) || 0) / 1e6;
    const hip2M = (Number(latest["HIP-2"]) || 0) / 1e6;
    return [
      { label: "Total Spot USDC", value: fmtMillionsUSD(totalSpotUSDCM) },
      {
        label: "Total Holders",
        value: fmtNumber(Number(latest.holdersCount) || 0),
      },
      { label: "HIP-2 Amount", value: fmtMillionsUSD(hip2M) },
      { label: "Last Updated", value: dateStr },
    ];
  }, [raw]);

  return (
    <section className="space-y-8 font-geist-sans flex flex-col items-center mt-8 ">
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 w-full max-w-5xl ">
        {loading || !metrics
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[10px] min-w-[200px] border border-[#DFDFDF] bg-white py-5 px-[40px] w-fit"
              >
                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-6 w-28 bg-gray-200 rounded" />
              </div>
            ))
          : metrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} />
            ))}
      </div>

      {/* Title */}
      <section className="max-w-[1137px] mt-8  w-full flex flex-col ">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-black">
            Spot USDC Trends
          </h3>
          <DateRangeTabs onChange={(r) => setRange(r)} />
        </div>
        <p className="text-[#9CA3AF] text-base font-regular mb-10">
          Historical data showing total USDC, holder count, and HIP-2
          distribution
        </p>

        {/* Chart */}
        <SpotChart data={chartData} />
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </section>
    </section>
  );
};

export default USDCSpotHolders;
