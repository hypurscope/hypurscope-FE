"use client";
import React, { useMemo } from "react";
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
import { formatUSDCompact, formatNumberCompact } from "@/lib/utils";

export type TrendPoint = { date: string; USDC: number; USDT: number };

export interface GrowthTrendsProps {
  trends?: TrendPoint[]; // timeseries rows
  distribution?: StablecoinItem[]; // donut segments
}

const GrowthTrends: React.FC<GrowthTrendsProps> = ({
  trends,
  distribution = defaultStablecoins,
}) => {
  const colors = useMemo(() => ({ USDC: "#2775CA", USDT: "#26A17B" }), []);

  const parseLooseDate = (v: unknown): number => {
    if (v == null) return NaN;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    const s = String(v).trim();
    const t = Date.parse(s);
    if (Number.isFinite(t)) return t;
    const parts = s
      .split(/[^0-9]/)
      .filter(Boolean)
      .map(Number);
    if (parts.length < 3) return NaN;
    const [rawY, m, d, hh = 0, mm = 0] = parts;
    const y = rawY < 100 ? rawY + 2000 : rawY;
    return Date.UTC(y, Math.max(0, (m ?? 1) - 1), d ?? 1, hh ?? 0, mm ?? 0, 0);
  };

  const processed = useMemo(() => {
    if (!Array.isArray(trends))
      return [] as Array<{ ts: number; USDC: number; USDT: number }>;
    return trends.map((p, i) => {
      const ts = parseLooseDate(p.date);
      return {
        ts: Number.isFinite(ts) ? ts : i,
        USDC: +p.USDC || 0,
        USDT: +p.USDT || 0,
      };
    });
  }, [trends]);

  const { monthlyTicks, labelFmt, isDense } = useMemo(() => {
    if (!processed.length)
      return {
        monthlyTicks: [] as number[],
        labelFmt: (_: number) => "",
        isDense: false,
      };
    const seen = new Set<string>();
    const months: number[] = [];
    for (const row of processed) {
      const d = new Date(row.ts);
      if (!Number.isFinite(d.getTime())) continue;
      const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
      if (!seen.has(key)) {
        seen.add(key);
        months.push(row.ts);
      }
    }
    const step = months.length > 60 ? 4 : months.length > 24 ? 3 : 2;
    const monthlyTicks = months.filter((_, i) => i % step === 0);
    const labelFmt = (ts: number) =>
      new Date(ts).toLocaleDateString(undefined, {
        month: "short",
        year: "2-digit",
      });
    const isDense = processed.length > 200;
    return { monthlyTicks, labelFmt, isDense };
  }, [processed]);

  return (
    <section className="grid grid-cols-1 font-geist-sans mt-12 gap-12 md:grid-cols-2">
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
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
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
