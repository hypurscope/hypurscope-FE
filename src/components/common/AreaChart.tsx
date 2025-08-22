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

  // Dynamic X axis tick formatting based on dateRange & viewport
  const buildTickFormatter = () => {
    if (!dateRange) return (v: any) => v;
    return (value: any) => {
      // Expect value as a date string like 'Aug 21' or ISO; attempt parse
      const raw = String(value);
      const parsed = new Date(raw);
      if (!isNaN(parsed.getTime())) {
        const month = parsed.toLocaleString(undefined, { month: "short" });
        const day = parsed.getDate();
        const yearShort = parsed.getFullYear().toString().slice(-2);
        if (dateRange === "24h" || dateRange === "7D") {
          return `${month} ${day}`; // show month + day
        }
        if (dateRange === "30D") {
          return `${month} ${day}`; // still granular
        }
        if (dateRange === "3M") {
          return `${month} '${yearShort}`; // month + 'yy
        }
        if (dateRange === "6M") {
          return `${month} '${yearShort}`; // rely on interval thinning
        }
      }
      return raw;
    };
  };

  // Decide interval: larger ranges show fewer ticks
  const xInterval: any = (() => {
    if (isSmall) return "preserveStartEnd"; // let Recharts reduce automatically
    switch (dateRange) {
      case "24h":
        return 0; // show all
      case "7D":
        return 0; // daily points
      case "30D":
        return 2; // every 3rd label approx
      case "3M":
        return 5; // monthly-ish depending on data density
      case "6M":
        return 10; // show sparse months
      default:
        return 0;
    }
  })();

  const xTickFormatter = buildTickFormatter();

  // Hide vertical grid lines on small for clarity
  const showVerticalGrid = !isSmall;

  // Unique gradient id (supports multiple charts on a page)
  const gradientId = useId().replace(/:/g, "");

  // Build thinned tick array to avoid overlap across ranges / widths
  const ticks = React.useMemo(() => {
    if (!data || data.length === 0) return [] as any[];
    const labels = data.map((d) => d.date);
    if (!dateRange) return labels; // fallback (may be thinned later by interval)

    const avail = width ?? 1024;
    const approxLabelW = isSmall ? 34 : 50; // px heuristic
    const maxLabels = Math.max(2, Math.floor(avail / approxLabelW));

    // Month-based handling for multi‑month ranges
    if (dateRange === "3M" || dateRange === "6M") {
      const monthFirstLabel: { key: string; label: string }[] = [];
      const seen = new Set<string>();
      for (const lbl of labels) {
        const d = new Date(lbl);
        if (isNaN(d.getTime())) continue;
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (!seen.has(key)) {
          seen.add(key);
          monthFirstLabel.push({ key, label: lbl });
        }
      }
      let selected = monthFirstLabel.map((m) => m.label);
      if (dateRange === "6M" && selected.length > maxLabels) {
        // pick every 2nd month, always include last
        const alt: string[] = [];
        for (let i = 0; i < selected.length; i += 2) alt.push(selected[i]);
        if (alt[alt.length - 1] !== selected[selected.length - 1]) {
          alt.push(selected[selected.length - 1]);
        }
        selected = alt;
      }
      return selected;
    }

    // Shorter ranges (24h, 7D, 30D) – generic thinning by step
    const step = Math.max(1, Math.ceil(labels.length / maxLabels));
    const out: string[] = [];
    for (let i = 0; i < labels.length; i += step) out.push(labels[i]);
    if (out[out.length - 1] !== labels[labels.length - 1])
      out.push(labels[labels.length - 1]);
    return out;
  }, [data, dateRange, width, isSmall]);

  return (
    <div className={className} style={{ height: effectiveHeight }}>
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
            // Provide explicit ticks to control density & prevent overlap
            ticks={ticks}
            interval={0}
            tick={{ fontSize: tickFontSize, fill: "#9CA3AF" }}
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
