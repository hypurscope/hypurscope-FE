"use client"
import { useState } from "react";
import  AreaChartComponent from "../common/AreaChart";
import DateRangeTabs from "../common/DateRangeTabs";
import { generateTVLData } from "@/data";

// Sample TVL data - replace with real API data

export default function TVLOverview() {
  const [selectedRange, setSelectedRange] = useState<"24h" | "7D" | "30D" | "90D">("7D");
  const chartData = generateTVLData(selectedRange);
  const currentTVL = chartData[chartData.length - 1];

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
          <h2 className="font-semibold text-5xl mt-3">{currentTVL.displayValue}</h2>
        </div>
        <div>
          <DateRangeTabs
            onChange={(range) => setSelectedRange(range)}
          />
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <AreaChartComponent
          data={chartData}
          height={400}
          color="#3B82F6"
          gradient={true}
          showTooltip={true}
          className="w-full"
        />
      </div>
    </section>
  );
}
