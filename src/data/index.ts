import { ChartDataPoint } from "@/types";

export const generateTVLData = (range: string): ChartDataPoint[] => {
  const baseData = [
    { date: "Jan 01", value: 1000000000, displayValue: "$1.0B" },
    { date: "Jan 02", value: 1100000000, displayValue: "$1.1B" },
    { date: "Jan 03", value: 1250000000, displayValue: "$1.25B" },
    { date: "Jan 04", value: 1400000000, displayValue: "$1.4B" },
    { date: "Jan 05", value: 1600000000, displayValue: "$1.6B" },
    { date: "Jan 06", value: 1800000000, displayValue: "$1.8B" },
    { date: "Jan 07", value: 2400000000, displayValue: "$2.4B" },
  ];

  // Simulate different data ranges
  switch (range) {
    case "24h":
      return baseData.slice(-2);
    case "7D":
      return baseData;
    case "30D":
      return [...baseData, 
        { date: "Jan 08", value: 2500000000, displayValue: "$2.5B" },
        { date: "Jan 15", value: 2700000000, displayValue: "$2.7B" },
        { date: "Jan 22", value: 2900000000, displayValue: "$2.9B" },
        { date: "Jan 30", value: 3100000000, displayValue: "$3.1B" },
      ];
    case "90D":
      return [...baseData,
        { date: "Feb 01", value: 3200000000, displayValue: "$3.2B" },
        { date: "Mar 01", value: 3800000000, displayValue: "$3.8B" },
        { date: "Apr 01", value: 4200000000, displayValue: "$4.2B" },
      ];
    default:
      return baseData;
  }
};
