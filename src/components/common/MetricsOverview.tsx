import { MetricData } from "@/types";
import { TrendingDown, TrendingUp } from "lucide-react";
import React from "react";

interface MetricsOverviewProps {
  metric: MetricData;
  className?: string;
  loading?: boolean; // show skeleton placeholders
}

// Component
const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  metric,
  className = "",
  loading = false,
}) => {
  return (
    <div
      className={`rounded-[10px] font-geist-sans text-black border-[0.5px] border-[#DFDFDF] px-5 py-4 sm:px-8 md:px-12 md:py-5 flex flex-col justify-center gap-2 w-full ${className}`}
    >
      {loading ? (
        <>
          <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="h-7 md:h-8 w-32 md:w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
        </>
      ) : (
        <>
          <span className="font-medium w-fit text-sm md:text-base">
            {metric.label}
          </span>
          <h3 className="font-semibold text-2xl md:text-3xl w-fit">
            {metric.value}
          </h3>
          {metric.change ? (
            <div className="flex items-center w-fit gap-2 text-xs md:text-sm">
              <span
                className={` flex items-center gap-1  ${
                  metric.change.direction === "up"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {metric.change.direction === "up" ? (
                  <TrendingUp />
                ) : (
                  <TrendingDown />
                )}{" "}
                {metric.change.percentage}
              </span>
              <span className=" text-gray-500">{metric.change.period}</span>
            </div>
          ) : (
            <span className="text-gray-500">{metric.description}</span>
          )}
        </>
      )}
    </div>
  );
};

export default MetricsOverview;
