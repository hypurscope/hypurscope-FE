"use client";
import { ChartDataPoint } from "@/types";
import React, { useEffect, useId, useState } from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface AreaChartProps {
  data: ChartDataPoint[];
  /** Desired desktop height (>= md). Mobile/tablet auto-scale below. */
  height?: number;
  color?: string;
  gradient?: boolean;
  showTooltip?: boolean;
  className?: string;
  /** Override responsive breakpoints (Tailwind-like). */
  smallMaxWidth?: number; // defaults to 640 (sm)
  mediumMaxWidth?: number; // defaults to 768 (md)
  /** Active date range to drive adaptive x-axis ticks */
  dateRange?: "24h" | "7D" | "30D" | "3M" | "6M";
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-blue-600">
          TVL: {data.displayValue || `$${(data.value / 1e9).toFixed(1)}B`}
        </p>
      </div>
    );
  }
  return null;
};

const AreaChartComponent = ({
  data,
  height = 400,
  color = "#3B82F6",
  gradient = true,
  showTooltip = true,
  className,
  smallMaxWidth = 640,
  mediumMaxWidth = 768,
  dateRange,
}: AreaChartProps) => {
  // Track viewport width (client-only) for responsive adjustments
  const [width, setWidth] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const isSmall = (width ?? 9999) < smallMaxWidth; // < sm
  const isMedium = !isSmall && (width ?? 9999) < mediumMaxWidth; // between sm & md

  // Preserve desktop (md+) design exactly: same height & margins
  const effectiveHeight = isSmall
    ? Math.min(height, 260)
    : isMedium
      ? Math.min(height, 320)
      : height;
  const margin = isSmall
    ? { top: 10, right: 12, left: 0, bottom: 10 }
    : isMedium
      ? { top: 16, right: 20, left: 16, bottom: 16 }
      : { top: 20, right: 30, left: 20, bottom: 20 };
  const tickFontSize = isSmall ? 10 : 12;
  const xTickMargin = isSmall ? 6 : 10;

  // Build parsed date helpers once
  const parsed = React.useMemo(
    () =>
      data.map((d) => {
        const dt = new Date(d.date);
        return { raw: d.date, dt };
      }),
    [data],
  );

  // Adaptive tick selection & label formatting strategy
  type Granularity =
    | "hourly"
    | "daily"
    | "weekly"
    | "biweekly"
    | "monthly"
    | "quarterly"
    | "raw";

  const { ticks, granularity, crossesYear, hourlyWithMinutes } =
    React.useMemo(() => {
      if (!dateRange) {
        return {
          ticks: data.map((d) => d.date),
          granularity: "raw" as Granularity,
          crossesYear: false,
          hourlyWithMinutes: false,
        };
      }

      const result: string[] = [];
      const years = new Set<number>();
      parsed.forEach((p) => years.add(p.dt.getFullYear()));
      const crossesYear = years.size > 1;

      const pushUnique = (s: string) => {
        if (!result.length || result[result.length - 1] !== s) result.push(s);
      };

      const dayKey = (dt: Date) =>
        `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
      const monthKey = (dt: Date) => `${dt.getFullYear()}-${dt.getMonth()}`;
      const weekKey = (dt: Date) => {
        // ISO week approximation: Thursday-based
        const tmp = new Date(
          Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()),
        );
        const day = tmp.getUTCDay() || 7;
        tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
        const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil(
          ((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
        );
        return `${tmp.getUTCFullYear()}-W${weekNo}`;
      };

      let granularity: Granularity = "daily";
      let hourlyWithMinutes = false;

      if (dateRange === "24h") {
        granularity = "hourly";
        // Pick roughly every 2 hours (or each hour if small dataset)
        const hours: string[] = [];
        const seenHour = new Set<string>();
        parsed.forEach((p) => {
          if (isNaN(p.dt.getTime())) return;
          const key = `${p.dt.getFullYear()}-${p.dt.getMonth()}-${p.dt.getDate()}-${p.dt.getHours()}`;
          if (!seenHour.has(key)) {
            seenHour.add(key);
            hours.push(p.raw);
          }
        });
        const step = hours.length > 14 ? 2 : 1;
        for (let i = 0; i < hours.length; i += step) pushUnique(hours[i]);
        if (result[result.length - 1] !== hours[hours.length - 1])
          pushUnique(hours[hours.length - 1]);
        // If dataset has minute resolution (determine by diff of first two points < 1h) show minutes on tooltip only
        hourlyWithMinutes =
          parsed.length >= 2 &&
          parsed[1].dt.getTime() - parsed[0].dt.getTime() < 3600_000;
      } else if (dateRange === "7D") {
        granularity = "daily";
        const seen = new Set<string>();
        parsed.forEach((p) => {
          if (isNaN(p.dt.getTime())) return;
          const key = dayKey(p.dt);
          if (!seen.has(key)) {
            seen.add(key);
            pushUnique(p.raw);
          }
        });
      } else if (dateRange === "30D") {
        // Weekly markers (ISO week first occurrence)
        granularity = "weekly";
        const seenWeek = new Set<string>();
        parsed.forEach((p) => {
          if (isNaN(p.dt.getTime())) return;
          const wk = weekKey(p.dt);
          if (!seenWeek.has(wk)) {
            seenWeek.add(wk);
            pushUnique(p.raw);
          }
        });
      } else if (dateRange === "3M") {
        // Bi-weekly if manageable else monthly
        const seenWeek = new Set<string>();
        const byWeek: string[] = [];
        parsed.forEach((p) => {
          if (isNaN(p.dt.getTime())) return;
          const wk = weekKey(p.dt);
          if (!seenWeek.has(wk)) {
            seenWeek.add(wk);
            byWeek.push(p.raw);
          }
        });
        if (byWeek.length <= 16) {
          granularity = "biweekly";
          // take every 2nd week marker
          for (let i = 0; i < byWeek.length; i += 2) pushUnique(byWeek[i]);
          if (result[result.length - 1] !== byWeek[byWeek.length - 1])
            pushUnique(byWeek[byWeek.length - 1]);
        } else {
          granularity = "monthly";
          const seenMonth = new Set<string>();
          parsed.forEach((p) => {
            const mk = monthKey(p.dt);
            if (!seenMonth.has(mk)) {
              seenMonth.add(mk);
              pushUnique(p.raw);
            }
          });
        }
      } else if (dateRange === "6M") {
        // Monthly; if too many ( > 8 ) reduce to quarterly
        let months: string[] = [];
        const seenMonth = new Set<string>();
        parsed.forEach((p) => {
          if (isNaN(p.dt.getTime())) return;
          const mk = monthKey(p.dt);
          if (!seenMonth.has(mk)) {
            seenMonth.add(mk);
            months.push(p.raw);
          }
        });
        if (months.length > 8) {
          granularity = "quarterly";
          const quarterFirst: string[] = [];
          const seenQuarter = new Set<string>();
          parsed.forEach((p) => {
            if (isNaN(p.dt.getTime())) return;
            const q = Math.floor(p.dt.getMonth() / 3) + 1;
            const key = `${p.dt.getFullYear()}-Q${q}`;
            if (!seenQuarter.has(key)) {
              seenQuarter.add(key);
              quarterFirst.push(p.raw);
            }
          });
          months = quarterFirst;
        } else {
          granularity = "monthly";
        }
        months.forEach(pushUnique);
      }

      return { ticks: result, granularity, crossesYear, hourlyWithMinutes };
    }, [dateRange, data, parsed]);

  const xTickFormatter = React.useCallback(
    (value: any) => {
      const dt = new Date(value);
      if (isNaN(dt.getTime())) return value;
      const month = dt.toLocaleString(undefined, { month: "short" });
      const day = dt.getDate();
      const yearShort = dt.getFullYear().toString().slice(-2);
      switch (granularity) {
        case "hourly":
          return dt.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        case "daily":
          return `${month} ${day}`;
        case "weekly":
        case "biweekly":
          return `${month} ${day}`; // show start of week / marker day
        case "monthly":
          return crossesYear ? `${month} '${yearShort}` : month;
        case "quarterly": {
          const q = Math.floor(dt.getMonth() / 3) + 1;
          return crossesYear ? `Q${q} '${yearShort}` : `Q${q}`;
        }
        default:
          return `${month} ${day}`;
      }
    },
    [granularity, crossesYear],
  );

  // Hide vertical grid lines on small for clarity
  const showVerticalGrid = !isSmall;

  // Unique gradient id (supports multiple charts on a page)
  const gradientId = useId().replace(/:/g, "");

  // ticks already computed in memo; ensure fallback for no data
  const ticksToUse = ticks && ticks.length ? ticks : data.map((d) => d.date);

  // Accessibility: compute summary for screen readers
  const chartSummary = React.useMemo(() => {
    if (!data.length) return "No data available";
    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const first = values[0];
    const last = values[values.length - 1];
    const trend =
      last > first ? "increasing" : last < first ? "decreasing" : "stable";

    return `TVL chart showing ${trend} trend from ${data[0].displayValue || `$${(first / 1e9).toFixed(1)}B`} to ${data[data.length - 1].displayValue || `$${(last / 1e9).toFixed(1)}B`} over ${data.length} data points`;
  }, [data]);

  return (
    <div
      className={className}
      style={{ height: effectiveHeight }}
      role="img"
      aria-label={chartSummary}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={margin}>
          <defs>
            {gradient && (
              <linearGradient
                id={`grad-${gradientId}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            )}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f0f0f0"
            horizontal={true}
            vertical={showVerticalGrid}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            ticks={ticksToUse}
            interval={0}
            tick={{ fontSize: tickFontSize, fill: "#6B7280" }}
            tickMargin={xTickMargin}
            tickFormatter={xTickFormatter}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            hide={false}
            tick={{ fontSize: isSmall ? 10 : tickFontSize, fill: "#9CA3AF" }}
            tickFormatter={(value) => `$${(value / 1e9).toFixed(1)}B`}
            domain={["dataMin - dataMin * 0.1", "dataMax + dataMax * 0.1"]}
            width={isSmall ? 44 : undefined}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={gradient ? `url(#grad-${gradientId})` : color}
            dot={false}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChartComponent;
