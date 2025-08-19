"use client";
import React, { useMemo } from "react";
import SpotChart from "@/components/common/SpotChart";
import { holdersTrendsByTab, spotSummaryMetrics } from "@/data";
import MetricCard from "./MetricCard";

const USDCSpotHolders: React.FC<{ datasetKey?: keyof typeof holdersTrendsByTab }>
  = ({ datasetKey = "Spot USDC Holders" }) => {
  const data = useMemo(() => holdersTrendsByTab[datasetKey] || [], [datasetKey]);

  return (
    <section className="space-y-8">
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {spotSummaryMetrics.map((m) => (
          <MetricCard key={m.label} label={m.label} value={m.value} />
        ))}
      </div>

      {/* Title */}
      <div>
        <h3 className="text-2xl font-semibold text-black">Spot USDC Trends</h3>
        <p className="text-[#9CA3AF]">Historical data showing total USDC, holder count, and HIP-2 distribution</p>
      </div>

      {/* Chart */}
      <SpotChart data={data} />
    </section>
  );
};

export default USDCSpotHolders;
