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
  /** Selected range to drive x-axis tick density */
  dateRange?: "24h" | "7D" | "30D" | "3M" | "6M";
}

const SpotChart: React.FC<SpotChartProps> = ({
  data,
  maxPoints = 150,
  dateRange,
}) => {
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

  // Track viewport width early so we can adapt tick density for small screens
  const [vw, setVw] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setVw(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const isSmall = (vw ?? 1024) < 640;

  // --- Simplified adaptive ticks based ONLY on provided dateRange ---
  const parsed = useMemo(
    () =>
      thinned.map((d) => ({
        ...d,
        dt: new Date(d.ts ?? d.date),
      })),
    [thinned]
  );

  type Granularity =
    | "hourly"
    | "daily"
    | "weekly"
    | "biweekly"
    | "monthly"
    | "quarterly";

  const { ticks, granularity, crossesYear } = useMemo(() => {
    const res: number[] = [];
    const first = parsed[0];
    const last = parsed[parsed.length - 1];
    if (!first || !last)
      return {
        ticks: res,
        granularity: "daily" as Granularity,
        crossesYear: false,
      };

    const start = first.dt.getTime();
    const end = last.dt.getTime();

    // Decide initial base granularity; we'll thin after generation
    let g: Granularity;
    switch (dateRange) {
      case "24h":
        g = "hourly";
        break;
      case "7D":
        g = "daily";
        break;
      case "30D":
        g = "daily";
        break; // start daily then thin to ~weekly
      case "3M":
        g = "weekly";
        break; // start weekly then thin
      case "6M":
        g = "weekly";
        break; // start weekly then thin to monthly/quarterly
      default:
        g = "daily";
    }

    // Helpers
    const push = (t: number) => {
      if (!res.length || res[res.length - 1] !== t) res.push(t);
    };
    const d = new Date(start);
    // Align start for cleaner labels
    if (g === "hourly") {
      // start at first point hour
      d.setMinutes(0, 0, 0);
    } else if (g === "daily" || g === "weekly" || g === "biweekly") {
      d.setHours(0, 0, 0, 0);
      if (g !== "daily") {
        // align to Monday
        const day = d.getDay();
        const diff = (day + 6) % 7; // days since Monday
        d.setDate(d.getDate() - diff);
      }
    } else if (g === "monthly") {
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
    } else if (g === "quarterly") {
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      d.setMonth(Math.floor(d.getMonth() / 3) * 3);
    }

    const add = (cur: Date) => {
      switch (g) {
        case "hourly":
          cur.setHours(cur.getHours() + 1);
          break;
        case "daily":
          cur.setDate(cur.getDate() + 1);
          break;
        case "weekly":
          cur.setDate(cur.getDate() + 7);
          break;
        case "biweekly":
          cur.setDate(cur.getDate() + 14);
          break;
        case "monthly":
          cur.setMonth(cur.getMonth() + 1);
          break;
        case "quarterly":
          cur.setMonth(cur.getMonth() + 3);
          break;
      }
    };

    const cursor = new Date(d.getTime());
    while (cursor.getTime() <= end) {
      push(cursor.getTime());
      add(cursor);
    }
    if (res[res.length - 1] !== end) push(end); // ensure last point

    // Thinning to avoid overlapping labels (screen-aware)
    const maxLabels = (() => {
      switch (dateRange) {
        case "24h":
          return isSmall ? 8 : 12; // every ~2-3h
        case "7D":
          return isSmall ? 5 : 8; // daily vs all days
        case "30D":
          return isSmall ? 6 : 8; // ~5 day / weekly
        case "3M":
          return isSmall ? 6 : 8; // biweekly / monthly blend
        case "6M":
          return isSmall ? 6 : 9; // monthly / quarterly
        default:
          return isSmall ? 6 : 12;
      }
    })();
    if (res.length > maxLabels) {
      let filtered = res;
      if (dateRange === "30D") {
        // Show more labels: every ~5 days large, ~6 days small (start/end always kept)
        const targetLabels = isSmall ? 6 : 7; // start + 4-5 inner + end
        const totalDays = Math.max(1, Math.round((end - start) / 86400000));
        const stepDays = Math.max(5, Math.ceil(totalDays / (targetLabels - 1))); // ensure at least 5-day spacing
        filtered = res.filter((ts, idx) => {
          if (idx === 0 || idx === res.length - 1) return true;
          const diffDays = Math.round((ts - start) / 86400000);
          return diffDays % stepDays === 0;
        });
      } else if (dateRange === "3M") {
        const mod = isSmall ? 3 : 2; // every 3rd or 2nd week
        filtered = res.filter((ts, idx) => {
          if (idx === 0 || idx === res.length - 1) return true;
          const dObj = new Date(ts);
          // show month start regardless
          if (dObj.getDate() === 1) return true;
          return idx % mod === 0;
        });
      } else if (dateRange === "6M") {
        // prefer month starts; on small screens fallback to quarter starts
        const monthStarts = res.filter((ts) => new Date(ts).getDate() === 1);
        if (!isSmall && monthStarts.length <= maxLabels + 1) {
          filtered = [
            res[0],
            ...monthStarts.filter(
              (ts) => ts !== res[0] && ts !== res[res.length - 1]
            ),
            res[res.length - 1],
          ];
        } else {
          filtered = res.filter((ts) => {
            const dObj = new Date(ts);
            return dObj.getDate() === 1 && dObj.getMonth() % 3 === 0; // quarter starts
          });
          if (filtered[0] !== res[0]) filtered.unshift(res[0]);
          if (filtered[filtered.length - 1] !== res[res.length - 1])
            filtered.push(res[res.length - 1]);
          g = "quarterly";
        }
      } else {
        const step = Math.ceil(res.length / maxLabels);
        filtered = res.filter((_ts, idx) => idx % step === 0);
        if (filtered[filtered.length - 1] !== res[res.length - 1])
          filtered.push(res[res.length - 1]);
      }
      res.length = 0;
      res.push(...filtered);
    }

    const crossesYear =
      new Date(start).getFullYear() !== new Date(end).getFullYear();
    return { ticks: res, granularity: g, crossesYear };
  }, [parsed, dateRange, isSmall]);

  const xTickFormatter = useMemo(
    () => (value: any) => {
      const ts = Number(value);
      if (!Number.isFinite(ts)) return "";
      const d = new Date(ts);
      const month = d.toLocaleString(undefined, { month: "short" });
      const day = d.getDate();
      const yr = d.getFullYear().toString().slice(-2);
      switch (granularity) {
        case "hourly":
          return d.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        case "daily":
        case "weekly":
        case "biweekly":
          return `${month} ${day}`;
        case "monthly":
          return crossesYear ? `${month} '${yr}` : month;
        case "quarterly":
          return crossesYear
            ? `Q${Math.floor(d.getMonth() / 3) + 1} '${yr}`
            : `Q${Math.floor(d.getMonth() / 3) + 1}`;
        default:
          return `${month} ${day}`;
      }
    },
    [granularity, crossesYear]
  );

  const labelFormatter = (_label: any, payload: ReadonlyArray<any>) => {
    const p = payload?.[0]?.payload;
    const ts = p?.ts;
    if (typeof ts === "number") {
      if (granularity === "hourly") {
        return new Date(ts).toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }
      return new Date(ts).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    }
    return _label;
  };
  const xTickStyle = { fill: "#111827", fontSize: 10 };

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
              dataKey="ts"
              type="number"
              scale="time"
              domain={[
                parsed[0]?.dt.getTime(),
                parsed[parsed.length - 1]?.dt.getTime(),
              ]}
              ticks={ticks}
              tick={{ ...xTickStyle, fontSize: isSmall ? 9 : 10 }}
              tickLine={false}
              axisLine={false}
              interval={0}
              minTickGap={8}
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
                dataKey="ts"
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
