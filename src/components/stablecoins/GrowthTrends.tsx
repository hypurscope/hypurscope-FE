"use client";
import React, { useEffect, useMemo } from "react";
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
  Brush,
} from "recharts";
import { defaultData as defaultStablecoins } from "@/data";
import type { StablecoinItem } from "@/types";
import { formatUSDCompact, formatNumberCompact } from "@/lib/utils";

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

  // Parse a wide range of date strings (e.g. "25:06:19 00:00", ISO, "2025-06-19") to UTC timestamp
  const parseLooseDate = (v: unknown): number => {
    if (v == null) return NaN;
    if (typeof v === "number" && Number.isFinite(v)) return v; // already ts
    const s = String(v).trim();
    // First try built-in parsing
    const t = Date.parse(s);
    if (Number.isFinite(t)) return t;
    // Fallback: split non-digits and reconstruct (y, m, d, hh?, mm?)
    const parts = s
      .split(/[^0-9]/)
      .filter(Boolean)
      .map(Number);
    if (parts.length >= 3) {
      let [y, m, d, hh = 0, mm = 0] = parts;
      if (y < 100) y += 2000;
      return Date.UTC(
        y,
        Math.max(0, (m ?? 1) - 1),
        d ?? 1,
        hh ?? 0,
        mm ?? 0,
        0
      );
    }
    return NaN;
  };

  // Normalize data: compute numeric timestamps and keep values
  const processed = useMemo(
    () =>
      (Array.isArray(trends) ? trends : []).map((p, i) => {
        const ts = parseLooseDate(p.date);
        return {
          ts: Number.isFinite(ts) ? ts : i, // fallback to index if unparseable
          USDC: Number(p.USDC) || 0,
          USDT: Number(p.USDT) || 0,
        };
      }),
    [trends]
  );

  // Determine monthly ticks and sparsify (every 2–4 months depending on density)
  const {
    ticks: monthlyTicks,
    labelFmt,
    isDense,
  } = useMemo(() => {
    const arr = processed;
    const seen = new Set<string>();
    const monthly: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      const d = new Date(arr[i].ts);
      if (!Number.isFinite(d.getTime())) continue;
      const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
      if (!seen.has(key)) {
        seen.add(key);
        monthly.push(arr[i].ts);
      }
    }
    // choose step based on number of months present
    const count = monthly.length;
    const step = count > 60 ? 4 : count > 24 ? 3 : 2; // every 2–4 months
    const ticks = monthly.filter((_, idx) => idx % step === 0);
    const labelFmt = (ts: number) =>
      new Date(ts).toLocaleDateString(undefined, {
        month: "short",
        year: "2-digit",
      }); // e.g., Aug '24
    const isDense = arr.length > 200; // hide dots for dense data
    return { ticks, labelFmt, isDense };
  }, [processed]);

  return (
    <section className="grid grid-cols-1 font-geist-sans mt-12 gap-12 md:grid-cols-2">
      {/* Left: Growth Trends */}
      <div>
        <h3 className="text-2xl font-medium text-black">Growth Trends</h3>
        <p className="text-[#9CA3AF]">Historical growth by stablecoin</p>
        <div className="mt-6 h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={processed}
              margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="ts"
                type="number"
                domain={["dataMin", "dataMax"]}
                tick={{ fill: "#111827", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                ticks={monthlyTicks}
                tickFormatter={labelFmt}
              />
              <YAxis
                tick={{ fill: "#111827", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatNumberCompact(Number(v), 1)}
              />
              <Tooltip
                cursor={{ stroke: "#E5E7EB" }}
                labelFormatter={(v) =>
                  new Date(Number(v)).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })
                }
                formatter={(value: any, name: any) => [
                  formatUSDCompact(Number(value), 2),
                  String(name),
                ]}
              />
              <Line
                type="monotone"
                dataKey="USDC"
                stroke={colors.USDC}
                strokeWidth={3}
                dot={isDense ? false : { r: 2, strokeWidth: 1 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="USDT"
                stroke={colors.USDT}
                strokeWidth={3}
                dot={isDense ? false : { r: 2, strokeWidth: 1 }}
                isAnimationActive={false}
              />
              {/* Horizontal pan/zoom via Brush */}
              {/* <Brush
                dataKey="ts"
                height={28}
                travellerWidth={10}
                stroke="#D1D5DB"
                tickFormatter={labelFmt} // format ticks in the mini-axis
                alwaysShowText={false} // hide the big raw timestamp text boxes
              /> */}
            </LineChart>
          </ResponsiveContainer>
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

      {/* Shared legend centered at bottom across both charts */}
      <div className="md:col-span-2 mt-4 flex items-center justify-center gap-8">
        <div className="flex items-center gap-2" style={{ color: colors.USDT }}>
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: colors.USDT }}
          />
          USDT
        </div>
        <div className="flex items-center gap-2" style={{ color: colors.USDC }}>
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: colors.USDC }}
          />
          USDC
        </div>
      </div>
    </section>
  );
};

export default GrowthTrends;
