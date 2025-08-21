"use client";
import { useEffect, useState } from "react";
import GrowthTrends from "../stablecoins/GrowthTrends";
import StableCoinsDistribution from "../stablecoins/StableCoinsDistribution";
import type { StablecoinItem } from "@/types";

type TrendPoint = { date: string; USDC: number; USDT: number };

export default function Stablecoins() {
  const [distribution, setDistribution] = useState<StablecoinItem[] | null>(
    null
  );
  const [trends, setTrends] = useState<TrendPoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/stablecoins", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load stablecoin data");
        const json = await res.json();
        // Debug: log fetched payload and quick samples
        try {
          const t = json.rows ?? [];
          const d = json.distribution ?? [];
          console.log("[ui][stablecoins][fetch] rows:", t.slice(-3));
          console.log(
            "[ui][stablecoins][fetch] distribution:",
            d.map((x: any) => ({
              symbol: x.symbol,
              value: Math.round(x.value),
              pct: Number((x.percent ?? 0).toFixed?.(2) ?? x.percent),
            }))
          );
          if (json.current) {
            console.log("[ui][stablecoins][current]", {
              total: Math.round(json.current.total),
              USDC: Math.round(json.current.USDC),
              USDT: Math.round(json.current.USDT),
            });
          }
        } catch {}
        if (!cancelled) {
          const BRANDS: Record<string, { color: string; logo?: string }> = {
            USDC: {
              color: "#2775CA",
              logo: "https://res.cloudinary.com/dhvwthnzq/image/upload/v1755596889/hyperscope/usdc_vdcozh.svg",
            },
            USDT: {
              color: "#26A17B",
              logo: "https://res.cloudinary.com/dhvwthnzq/image/upload/v1755596886/hyperscope/Group_zwqult.svg",
            },
          };
          const dist = (json.distribution ?? []).map((d: any) => ({
            ...d,
            color: d.color ?? BRANDS[d.symbol]?.color,
            logo: d.logo ?? BRANDS[d.symbol]?.logo,
          }));
          setDistribution(dist);
          const rows = (json.rows ?? []) as Array<{
            date: string;
            USDC: number;
            USDT: number;
          }>;
          const mapped = rows.map((r) => ({
            date: String(r.date),
            USDC: Number(r.USDC) || 0,
            USDT: Number(r.USDT) || 0,
          }));
          setTrends(mapped);
        }
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

  return (
    <div className="py-6 flex flex-col gap-10">
      <div className="space-y-4">
        <StableCoinsDistribution
          title="Stablecoin Distribution"
          items={distribution ?? undefined}
        />
      </div>
      <section>
        <GrowthTrends
          trends={trends ?? undefined}
          distribution={distribution ?? undefined}
        />
      </section>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
