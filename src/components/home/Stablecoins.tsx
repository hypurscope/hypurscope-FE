"use client";
import GrowthTrends from "../stablecoins/GrowthTrends";
import StableCoinsDistribution from "../stablecoins/StableCoinsDistribution";
import { useStablecoins, type StablecoinsResponse } from "@/hooks";

type TrendPoint = { date: string; USDC: number; USDT: number };

export default function Stablecoins({
  initialData,
}: {
  initialData?: StablecoinsResponse;
}) {
  const { data, isLoading, error } = useStablecoins(initialData);

  const distribution = data?.distribution ?? [];
  const trends =
    data?.rows?.map((r) => ({
      date: String(r.date),
      USDC: Number(r.USDC) || 0,
      USDT: Number(r.USDT) || 0,
    })) ?? [];

  return (
    <section className="py-6 font-geist-sans">
      {error && (
        <div className="text-center text-red-600 py-8" role="alert">
          {error.message || "Failed to load stablecoin data"}
        </div>
      )}
      {!error && (
        <div className="grid grid-cols-1 gap-6 lg:gap-12">
          <StableCoinsDistribution
            title="Stablecoin Distribution"
            items={distribution}
          />
          <GrowthTrends trends={trends} distribution={distribution} />
        </div>
      )}
    </section>
  );
}
