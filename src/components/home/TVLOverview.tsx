"use client";
import { useEffect, useMemo, useState } from "react";
import AreaChartComponent from "../common/AreaChart";
import DateRangeTabs from "../common/DateRangeTabs";

type ChartPoint = { date: string; value: number; displayValue: string };

export default function TVLOverview() {
  const [selectedRange, setSelectedRange] = useState<
    "24h" | "7D" | "30D" | "90D"
  >("7D");
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/tvl?range=${selectedRange}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load TVL");
        const json = await res.json();
        if (!cancelled) setData(json.items ?? []);
      } catch (e: any) {
        if (!cancelled && e.name !== "AbortError")
          setError(e?.message ?? "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [selectedRange]);

  const currentTVL = useMemo(() => data[data.length - 1], [data]);

  return (
    <section className="py-6 font-geist-sans">
      <div className="flex items-center justify-between mb-16">
        <div>
          <div>
            <h3 className="text-2xl font-medium ">Total Value Locked</h3>
            <p className="text-tertiary">
              TVL across all protocols on Hyperliquid L1
            </p>
          </div>
          <h2 className="font-semibold text-5xl mt-3">
            {currentTVL?.displayValue ?? "—"}
          </h2>
        </div>
        <div>
          <DateRangeTabs onChange={(range) => setSelectedRange(range)} />
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : (
          <AreaChartComponent
            data={data}
            height={400}
            color="#3B82F6"
            gradient={true}
            showTooltip={true}
            className="w-full"
          />
        )}
      </div>
    </section>
  );
}
