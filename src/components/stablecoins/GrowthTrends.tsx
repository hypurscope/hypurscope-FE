"use client";
import React, { useEffect } from "react";
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

type TrendPoint = { date: string; USDC: number; USDT: number };

export interface GrowthTrendsProps {
  trends?: TrendPoint[];
  distribution?: StablecoinItem[];
}

const sampleTrends: TrendPoint[] = [
  { date: "Jan 01", USDC: 350, USDT: 600 },
  { date: "Jan 02", USDC: 380, USDT: 650 },
  { date: "Jan 03", USDC: 450, USDT: 700 },
];

const GrowthTrends: React.FC<GrowthTrendsProps> = ({
  trends = sampleTrends,
  distribution = defaultStablecoins,
}) => {
  const colors = {
    USDC: "#2775CA", // USDC brand
    USDT: "#26A17B", // USDT brand
  } as const;

  // Debug: print last few trend points (USDC/USDT)
  useEffect(() => {
    try {
      const tail = (trends ?? []).slice(-5);
      console.log("[ui][GrowthTrends][trends tail]", tail);
    } catch {}
  }, [trends]);

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
                dataKey="date"
                tick={{ fill: "#111827" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#111827" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  const n = Number(v);
                  if (!Number.isFinite(n)) return String(v);
                  const abs = Math.abs(n);
                  if (abs >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
                  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
                  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
                  return `${n}`;
                }}
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
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 flex items-center justify-center gap-8">
          <div
            className="flex items-center gap-2"
            style={{ color: colors.USDT }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: colors.USDT }}
            />{" "}
            USDT
          </div>
          <div
            className="flex items-center gap-2"
            style={{ color: colors.USDC }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: colors.USDC }}
            />{" "}
            USDC
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
                      entry.color ??
                      (entry.symbol === "USDC"
                        ? colors.USDC
                        : entry.symbol === "USDT"
                        ? colors.USDT
                        : "#9CA3AF")
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
