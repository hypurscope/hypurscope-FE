"use client";
import { useMemo, useState } from "react";
import AreaChartComponent from "../common/AreaChart";
import DateRangeTabs, { DateRange } from "../common/DateRangeTabs";
import { useTVL, type TVLResponse } from "@/hooks";

type ChartPoint = { date: string; value: number; displayValue: string };

export default function TVLOverview({
  initialData,
}: {
  initialData?: TVLResponse;
}) {
  const [selectedRange, setSelectedRange] = useState<DateRange>("7D");

  // Map UI ranges to API query values
  const apiRange = useMemo(() => {
    switch (selectedRange) {
      case "3M":
        return "90D";
      case "30D":
        return "30D";
      case "6M":
        return "180D";
      default:
        return selectedRange; // 24h / 7D
    }
  }, [selectedRange]);

  const { data, isLoading, error } = useTVL(
    apiRange,
    undefined,
    selectedRange === "7D" ? initialData : undefined,
  );

  const chartData: ChartPoint[] = data?.items ?? [];
  const currentTVL = useMemo(
    () => chartData[chartData.length - 1],
    [chartData],
  );

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
          {isLoading ? (
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
        {error && !isLoading && (
          <div className="text-sm text-red-500" role="alert">
            {error.message || "Failed to load data"}
          </div>
        )}
        {isLoading && (
          <div className="w-full h-[340px] md:h-[400px] rounded-lg bg-gray-100 flex flex-col justify-between p-4 animate-pulse">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="flex-1 flex items-center justify-center">
              <div className="h-32 w-full max-w-md bg-gray-200 rounded" />
            </div>
            <div className="h-3 w-full bg-gray-200 rounded" />
          </div>
        )}
        {!isLoading && !error && (
          <AreaChartComponent
            data={chartData}
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
