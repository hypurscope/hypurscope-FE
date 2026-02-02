"use client";
import { useMemo } from "react";
import MetricsOverview from "@/components/common/MetricsOverview";
import type { MetricData } from "@/types";
import { useTVL, type TVLResponse } from "@/hooks";

function fmtUSD(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function LiveTVLMetric({
  className = "",
  initialData,
}: {
  className?: string;
  initialData?: TVLResponse;
}) {
  const { data, isLoading } = useTVL("24h", undefined, initialData);

  const metric = useMemo<MetricData>(() => {
    if (!data || !data.items || data.items.length === 0) {
      return {
        label: "Total Value Locked",
        value: "—",
        change: {
          percentage: "—",
          direction: "up",
          period: "last 24h",
        },
      };
    }

    const items = data.items;
    const first = items[0];
    const last = items[items.length - 1];
    const current = Number(last.value) || 0;
    const base = Number(first.value) || 0;
    const diff = current - base;
    const pct = base > 0 ? (diff / base) * 100 : 0;

    return {
      label: "Total Value Locked",
      value: fmtUSD(current),
      change: {
        percentage: `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`,
        direction: pct >= 0 ? "up" : "down",
        period: "last 24h",
      },
    };
  }, [data]);

  return (
    <MetricsOverview
      metric={metric}
      loading={isLoading}
      className={className}
    />
  );
}
