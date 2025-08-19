"use client";
import React from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { HoldersTrendPoint } from "@/types";

export interface SpotChartProps {
  data: HoldersTrendPoint[];
}

const SpotChart: React.FC<SpotChartProps> = ({ data }) => {
  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
        >
          <defs>
            <linearGradient id="spotArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.06} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#111827" }}
            tickLine={false}
            axisLine={false}
          />
          {/* Left Y axis for amounts in M */}
          <YAxis
            yAxisId="left"
            tick={{ fill: "#111827" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}`}
          />
          {/* Right Y axis for holders */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#10B981" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip />
          {/* Area: Total Spot USDC (M) */}
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="spotUSDCM"
            stroke="#3B82F6"
            fill="url(#spotArea)"
            strokeWidth={2}
          />
          {/* Line: HIP-2 amount (M) */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="hip2M"
            stroke="#F59E0B"
            strokeWidth={3}
            dot={{ r: 2 }}
          />
          {/* Line: Number of holders */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="holders"
            stroke="#22C55E"
            strokeWidth={3}
            dot={{ r: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-[#3B82F6]">
          <span className="h-2 w-2 rounded-full bg-[#3B82F6]" /> Total Spot USDC
        </div>
        <div className="flex items-center gap-2 text-[#22C55E]">
          <span className="h-2 w-2 rounded-full bg-[#22C55E]" /> Number of
          Holders
        </div>
        <div className="flex items-center gap-2 text-[#F59E0B]">
          <span className="h-2 w-2 rounded-full bg-[#F59E0B]" /> HIP-2 Amount
        </div>
      </div>
    </div>
  );
};

export default SpotChart;
