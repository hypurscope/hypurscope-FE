import { MetricData } from "@/types";
import { TrendingDown, TrendingUp } from "lucide-react";
import React from "react";

interface MetricsOverviewProps {
  metric: MetricData;
  className?: string;
}

// Component
const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  metric,
  className = "",
}) => {
  return (
    <div className="rounded-[10px] font-geist-sans text-black border-[0.5px] border-[#DFDFDF] px-10 py-5 flex flex-col gap-2 w-full max-w-">
      <span className="font-medium">{metric.label}</span>

      <h3 className="font-semibold text-3xl ">{metric.value}</h3>

      {metric.change ? (
        <div className="flex items-center gap-2">
          <span
            className={` flex items-center gap-1  ${
              metric.change.direction === "up"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
           {metric.change.direction === "up" ? <TrendingUp /> : <TrendingDown />} {metric.change.percentage}
          </span>
          <span className=" text-gray-500">{metric.change.period}</span>
        </div>
      ) : (
        <span className="text-gray-500">{metric.description}</span>
      )}
    </div>
  );
};

export default MetricsOverview;
