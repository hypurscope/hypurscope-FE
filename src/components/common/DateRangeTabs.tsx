"use client";
import { useState } from "react";
import { motion } from "framer-motion";

type DateRange = "24h" | "7D" | "30D" | "90D";

interface DateRangeTabsProps {
  onChange?: (range: DateRange) => void;
}

const DateRangeTabs = ({ onChange }: DateRangeTabsProps) => {
  const [active, setActive] = useState<DateRange>("7D");
  
  const ranges: DateRange[] = ["24h", "7D", "30D", "90D"];

  const handleClick = (range: DateRange) => {
    setActive(range);
    onChange?.(range);
  };

  return (
    <div className="flex gap-2">
      {ranges.map((range) => (
        <button
          key={range}
          className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
            active === range 
              ? "text-white" 
              : "text-gray-500 hover:text-black border border-gray-200"
          }`}
          onClick={() => handleClick(range)}
        >
          {active === range && (
            <motion.div
              layoutId="date-active"
              className="absolute inset-0 rounded-xl bg-black"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{range}</span>
        </button>
      ))}
    </div>
  );
};

export default DateRangeTabs;
