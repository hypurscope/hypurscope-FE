import { ChartDataPoint } from "@/types";
import React from "react";
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
  height?: number;
  color?: string;
  gradient?: boolean;
  showTooltip?: boolean;
  className?: string;
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
}: AreaChartProps) => {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <defs>
            {gradient && (
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            )}
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#f0f0f0" 
            horizontal={true}
            vertical={true}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
            tickMargin={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
            tickFormatter={(value) => `$${(value / 1e9).toFixed(1)}B`}
            domain={["dataMin - dataMin * 0.1", "dataMax + dataMax * 0.1"]}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={gradient ? "url(#colorGradient)" : color}
            dot={false}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChartComponent;
