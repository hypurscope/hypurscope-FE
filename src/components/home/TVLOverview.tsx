"use client";
import { useEffect, useMemo, useState } from "react";
import AreaChartComponent from "../common/AreaChart";
import DateRangeTabs, { DateRange } from "../common/DateRangeTabs";

type ChartPoint = { date: string; value: number; displayValue: string };

export default function TVLOverview() {
  const [selectedRange, setSelectedRange] = useState<DateRange>("7D");
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
        // Map UI ranges to API query values
        const apiRange =
          selectedRange === "3M"
            ? "90D"
            : selectedRange === "30D"
            ? "30D"
            : selectedRange === "6M"
            ? "180D"
            : selectedRange; // 24h / 7D
        const res = await fetch(`/api/tvl?range=${apiRange}`, {
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-0 mb-8 md:mb-16">
        <div>
          <div>
            <h3 className="text-xl md:text-2xl font-medium">
              Total Value Locked
            </h3>
            <p className="text-tertiary text-sm md:text-base">
              TVL across all protocols on Hyperliquid L1
            </p>
          </div>
          {loading ? (
            <div className="mt-4 h-10 md:h-12 w-40 md:w-56 rounded bg-gray-200 animate-pulse" />
          ) : (
            <h2 className="font-semibold text-4xl md:text-5xl mt-3">
              {currentTVL?.displayValue ?? "—"}
            </h2>
          )}
        </div>
        <div>
          <DateRangeTabs
            onChange={(range: DateRange) => setSelectedRange(range)}
          />
        </div>
      </div>

      {/* Chart Container */}
      <div className=" rounded-lg w-full md:p-6">
        {error && !loading && (
          <div className="text-sm text-red-500">{error}</div>
        )}
        {loading && (
          <div className="w-full h-[340px] md:h-[400px] rounded-lg bg-gray-100 flex flex-col justify-between p-4 animate-pulse">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="flex-1 flex items-center justify-center">
              <div className="h-32 w-full max-w-md bg-gray-200 rounded" />
            </div>
            <div className="h-3 w-full bg-gray-200 rounded" />
          </div>
        )}
        {!loading && !error && (
          <AreaChartComponent
            data={data}
            height={400}
            color="#3B82F6"
            gradient={true}
            showTooltip={true}
            className="w-full"
            dateRange={selectedRange}
          />
        )}
      </div>
    </section>
  );
}
