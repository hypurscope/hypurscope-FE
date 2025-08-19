"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { defaultData as defaultStablecoins } from "@/data";
import type { StablecoinItem } from "@/types";

type TrendPoint = { month: string; USDC: number; USDT: number; DAI: number };

export interface GrowthTrendsProps {
  trends?: TrendPoint[];
  distribution?: StablecoinItem[];
}

const sampleTrends: TrendPoint[] = [
  { month: "Jan", USDC: 350, USDT: 600, DAI: 950 },
  { month: "Feb", USDC: 380, USDT: 650, DAI: 1000 },
  { month: "Mar", USDC: 450, USDT: 700, DAI: 1180 },
];

const GrowthTrends: React.FC<GrowthTrendsProps> = ({
  trends = sampleTrends,
  distribution = defaultStablecoins,
}) => {
  const colors = {
    USDC: "#3B82F6", // blue
    USDT: "#F59E0B", // amber-like to match screenshot
    DAI: "#22C55E", // green
  } as const;

  return (
    <section className="grid grid-cols-1 font-geist-sans mt-12 gap-12 md:grid-cols-2">
      {/* Left: Growth Trends */}
      <div>
        <h3 className="text-2xl font-medium text-black">Growth Trends</h3>
        <p className="text-[#9CA3AF]">Historical growth by stablecoin</p>
        <div className="mt-6 h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trends}
              margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="month"
                tick={{ fill: "#111827" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#111827" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip cursor={{ stroke: "#E5E7EB" }} />
              <Line
                type="monotone"
                dataKey="USDC"
                stroke={colors.USDC}
                strokeWidth={3}
                dot={{ r: 3, strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="USDT"
                stroke={colors.USDT}
                strokeWidth={3}
                dot={{ r: 3, strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="DAI"
                stroke={colors.DAI}
                strokeWidth={3}
                dot={{ r: 3, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 flex items-center justify-center gap-8">
          <div className="flex items-center gap-2 text-[#22C55E]">
            <span className="h-2 w-2 rounded-full bg-[#22C55E]" /> DAI
          </div>
          <div className="flex items-center gap-2 text-[#F59E0B]">
            <span className="h-2 w-2 rounded-full bg-[#F59E0B]" /> USDT
          </div>
          <div className="flex items-center gap-2 text-[#3B82F6]">
            <span className="h-2 w-2 rounded-full bg-[#3B82F6]" /> USDC
          </div>
        </div>
      </div>

      {/* Right: Stablecoin Distribution (donut) */}
      <div className="flex flex-col items-center">
        <h3 className="text-2xl font-medium text-black">
          Stablecoin Distribution
        </h3>
        <p className="text-[#9CA3AF]">Share of total liquidity by stablecoin</p>
        <div className="mt-6 h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distribution}
                dataKey="percent"
                nameKey="symbol"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
              >
                {distribution.map((entry) => (
                  <Cell
                    key={entry.symbol}
                    fill={
                      entry.symbol === "USDC"
                        ? colors.USDC
                        : entry.symbol === "USDT"
                        ? colors.USDT
                        : colors.DAI
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default GrowthTrends;
