"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Brush,
} from "recharts";
import type { HoldersTrendPoint } from "@/types";

export interface SpotChartProps {
  data: HoldersTrendPoint[];
  maxPoints?: number; // optional cap to thin dense datasets
}

const SpotChart: React.FC<SpotChartProps> = ({ data, maxPoints = 150 }) => {
  const thinned = useMemo(() => {
    if (!Array.isArray(data)) return [] as HoldersTrendPoint[];
    if (data.length <= maxPoints) return data;
    const step = data.length / maxPoints;
    const out: HoldersTrendPoint[] = [];
    for (let i = 0; i < maxPoints; i++) {
      out.push(data[Math.floor(i * step)]);
    }
    // always include the last point
    if (out[out.length - 1] !== data[data.length - 1])
      out.push(data[data.length - 1]);
    return out;
  }, [data, maxPoints]);

  const fmtLeftAxis = (v: number) => `${Number(v).toFixed(1)}`; // values already in M
  const fmtRightAxis = (v: number) =>
    new Intl.NumberFormat().format(Math.round(Number(v) || 0));
  const fmtRightAxisSmall = (v: number) => {
    const n = Math.round(Number(v) || 0);
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"; // 1.2M
    if (n >= 1000) return Math.round(n / 1000) + "k"; // 450k
    return String(n);
  };
  const tooltipFormatter = (value: any, name: string) => {
    const n = Number(value) || 0;
    if (name === "spotUSDCM" || name === "hip2M")
      return [
        `$${n.toFixed(2)}M`,
        name === "spotUSDCM" ? "Total Spot USDC" : "HIP-2 Amount",
      ];
    if (name === "holders") return [fmtRightAxis(n), "Holders"];
    return [String(value), name];
  };

  // X-axis ticks: adaptive formatting using ts range
  const tsValues = thinned
    .map((d) => d.ts)
    .filter((t): t is number => typeof t === "number" && Number.isFinite(t));
  const hasTs = tsValues.length >= 2;
  const minTs = hasTs ? Math.min(...tsValues) : undefined;
  const maxTs = hasTs ? Math.max(...tsValues) : undefined;
  const windowMs = hasTs ? maxTs! - minTs! : undefined;
  const dayMs = 24 * 60 * 60 * 1000;
  const windowDays = windowMs ? windowMs / dayMs : undefined;
  const isIntraDay = !!windowMs && windowMs <= 2 * dayMs;
  const is7D = !!windowDays && windowDays > 2 && windowDays <= 10;
  const is30D = !!windowDays && windowDays > 10 && windowDays <= 45;
  const is90D = !!windowDays && windowDays > 45;

  const targetTicks = isIntraDay ? 8 : is7D ? 7 : is30D ? 10 : is90D ? 6 : 8;
  const skipN = Math.max(1, Math.ceil((thinned.length || 1) / targetTicks));

  const xTickFormatter = (value: any, index: number) => {
    if (index % skipN !== 0) return "";
    if (hasTs) {
      const ts = typeof value === "number" ? value : thinned[index]?.ts;
      if (!Number.isFinite(ts)) return "";
      const d = new Date(Number(ts));
      if (isIntraDay)
        return d.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        });
      if (is90D) return d.toLocaleDateString(undefined, { month: "short" });
      // 7D / 30D
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
      });
    }
    const label = thinned[index]?.date || "";
    return is90D ? String(label).split(" ")[0] || label : label;
  };
  const xTickStyle =
    isIntraDay || is7D || is30D || is90D
      ? { fill: "#111827", fontSize: 10 }
      : { fill: "#111827" };
  const labelFormatter = (_label: any, payload: ReadonlyArray<any>) => {
    const p = payload && payload[0] && payload[0].payload;
    const ts = p?.ts as number | undefined;
    if (typeof ts === "number" && Number.isFinite(ts)) {
      if (isIntraDay) {
        // show full date and time for intraday
        return new Date(ts).toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return new Date(ts).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    }
    return p?.date ?? _label;
  };

  // Track viewport width to adjust axis/legend for small screens
  const [vw, setVw] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setVw(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const isSmall = (vw ?? 1024) < 640;
  const isTablet = !isSmall && (vw ?? 1024) < 768;

  const leftTickFont = isSmall ? 10 : 12;
  const rightTickFont = isSmall ? 9 : 11;
  const rightAxisTick = { fill: "#10B981", fontSize: rightTickFont };
  const leftAxisTick = { fill: "#111827", fontSize: leftTickFont };

  return (
    <div className="w-full">
      <div className="h-[300px] sm:h-[360px] md:h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={thinned}
            margin={{ top: 6, right: isSmall ? 12 : 24, left: 6, bottom: 18 }}
          >
            <defs>
              <linearGradient id="spotArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.06} />
              </linearGradient>
              <linearGradient id="hip2Area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.06} />
              </linearGradient>
              <linearGradient id="holdersArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.06} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" />
            <XAxis
              dataKey={hasTs ? "ts" : "date"}
              tick={{
                ...xTickStyle,
                fontSize: isSmall ? 9 : xTickStyle.fontSize || 10,
              }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={isSmall ? 10 : 20}
              tickFormatter={xTickFormatter}
            />
            {/* Left Y axis for amounts in M */}
            <YAxis
              yAxisId="left"
              tick={leftAxisTick}
              tickLine={false}
              axisLine={false}
              width={isSmall ? 32 : 40}
              tickFormatter={fmtLeftAxis}
            />
            {/* Right Y axis for holders */}
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={rightAxisTick}
              tickLine={false}
              axisLine={false}
              width={isSmall ? 36 : 50}
              tickFormatter={isSmall ? fmtRightAxisSmall : fmtRightAxis}
            />
            <Tooltip
              formatter={tooltipFormatter}
              labelFormatter={labelFormatter}
            />
            {/* Area: Total Spot USDC (M) */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="spotUSDCM"
              stroke="#3B82F6"
              fill="url(#spotArea)"
              strokeWidth={2}
            />
            {/* Area: HIP-2 amount (M) */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="hip2M"
              stroke="#F59E0B"
              fill="url(#hip2Area)"
              strokeWidth={2}
            />
            {/* Area: Number of holders */}
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="holders"
              stroke="#22C55E"
              fill="url(#holdersArea)"
              strokeWidth={2}
              // dot={{ r: 2 }}
            />
            {thinned.length > 80 && !isSmall && (
              <Brush
                dataKey={hasTs ? "ts" : "date"}
                height={16}
                stroke="#D1D5DB"
                travellerWidth={8}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {/* Legend outside fixed-height wrapper so it's always visible */}
      <div className="mt-3 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-center gap-2 sm:gap-4 md:gap-6 text-[11px] sm:text-xs md:text-sm">
        <div className="flex items-center gap-1.5 sm:gap-2 text-[#3B82F6]">
          <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
          <span>Total Spot USDC</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[#22C55E]">
          <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
          <span>Number of Holders</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[#F59E0B]">
          <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
          <span>HIP-2 Amount</span>
        </div>
      </div>
    </div>
  );
};

export default SpotChart;
