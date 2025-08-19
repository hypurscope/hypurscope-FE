"use client";
import React, { useMemo } from "react";
import SpotChart from "@/components/common/SpotChart";
import { holdersTrendsByTab, spotSummaryMetrics } from "@/data";
import MetricCard from "./MetricCard";

const USDCSpotHolders: React.FC<{
  datasetKey?: keyof typeof holdersTrendsByTab;
}> = ({ datasetKey = "Spot USDC Holders" }) => {
  const data = useMemo(
    () => holdersTrendsByTab[datasetKey] || [],
    [datasetKey]
  );

  return (
    <section className="space-y-8 font-geist-sans flex flex-col items-center mt-8 ">
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 w-full max-w-5xl ">
        {spotSummaryMetrics.map((m) => (
          <MetricCard key={m.label} label={m.label} value={m.value} />
        ))}
      </div>

      {/* Title */}
      <section className="max-w-[1137px] mt-8  w-full flex flex-col ">
        <div className="mb-20">
          <h3 className="text-2xl font-semibold text-black">
            Spot USDC Trends
          </h3>
          <p className="text-[#9CA3AF] text-base font-regular">
            Historical data showing total USDC, holder count, and HIP-2
            distribution
          </p>
        </div>

        {/* Chart */}
        <SpotChart data={data} />
      </section>
    </section>
  );
};

export default USDCSpotHolders;
