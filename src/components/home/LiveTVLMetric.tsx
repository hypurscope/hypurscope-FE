"use client";
import { useEffect, useState } from "react";
import MetricsOverview from "@/components/common/MetricsOverview";
import type { MetricData } from "@/types";

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
}: {
  className?: string;
}) {
  const [metric, setMetric] = useState<MetricData>({
    label: "Total Value Locked",
    value: "—",
    change: {
      percentage: "—",
      direction: "up",
      period: "last 24h",
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/tvl?range=24h", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load TVL");
        const json = await res.json();
        const items: Array<{ value: number }> = Array.isArray(json?.items)
          ? json.items
          : [];
        if (items.length >= 1) {
          const first = items[0];
          const last = items[items.length - 1];
          const current = Number(last.value) || 0;
          const base = Number(first.value) || 0;
          const diff = current - base;
          const pct = base > 0 ? (diff / base) * 100 : 0;
          if (!cancelled) {
            setMetric({
              label: "Total Value Locked",
              value: fmtUSD(current),
              change: {
                percentage: `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`,
                direction: pct >= 0 ? "up" : "down",
                period: "last 24h",
              },
            });
            setLoading(false);
          }
        } else if (!cancelled) {
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled){
          setLoading(false);
          console.error(e)
        }
        ;
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return (
    <MetricsOverview metric={metric} loading={loading} className={className} />
  );
}
