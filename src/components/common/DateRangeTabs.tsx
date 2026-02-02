"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export type DateRange = "24h" | "7D" | "30D" | "3M" | "6M";

export interface DateRangeTabsProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  className?: string;
}

const ranges: DateRange[] = ["24h", "7D", "30D", "3M", "6M"];

function DateRangeTabs({
  value,
  onChange,
  className = "",
}: DateRangeTabsProps) {
  const [internal, setInternal] = useState<DateRange>(value || "7D");
  const active = value ?? internal;

  const handleClick = (range: DateRange) => {
    if (!value) setInternal(range);
    onChange?.(range);
  };

  return (
    <div
      role="group"
      aria-label="Select time range"
      className={`flex gap-2 overflow-x-auto md:overflow-visible scrollbar-thin scrollbar-thumb-gray-300 pr-1 -ml-1 md:ml-0 md:pr-0 ${className}`}
    >
      {ranges.map((range) => {
        const isActive = active === range;
        return (
          <button
            key={range}
            type="button"
            aria-label={`Select ${range} time range`}
            aria-pressed={isActive}
            className={`relative rounded-xl transition-colors font-medium whitespace-nowrap px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm border ${
              isActive
                ? "text-white border-black"
                : "text-gray-500 hover:text-black border-gray-200"
            }`}
            onClick={() => handleClick(range)}
          >
            {isActive && (
              <motion.div
                layoutId="date-active"
                className="absolute inset-0 rounded-xl bg-black"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{range}</span>
          </button>
        );
      })}
    </div>
  );
}

export default DateRangeTabs;
