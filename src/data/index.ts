import { ChartDataPoint, StablecoinItem, HoldersTrendPoint } from "@/types";

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



export const defaultData: StablecoinItem[] = [
  {
    symbol: "USDC",
    value: 1.68e9,
    percent: 59.0,
    changePct: 3.2,
    color: "#2775CA",
    logo: "https://res.cloudinary.com/dhvwthnzq/image/upload/v1755596889/hyperscope/usdc_vdcozh.svg",
  },
  {
    symbol: "USDT",
    value: 0.85e9,
    percent: 30.0,
    changePct: -1.5,
    color: "#26A17B",
    logo: "https://res.cloudinary.com/dhvwthnzq/image/upload/v1755596886/hyperscope/Group_zwqult.svg",
  },
  {
    symbol: "DAI",
    value: 0.31e9,
    percent: 11.0,
    changePct: 7.8,
    color: "#F5AC37",
    logo: "https://res.cloudinary.com/dhvwthnzq/image/upload/v1755596884/hyperscope/dai_jvy3md.svg",
  },
];

// Token holders table data (sample)
export interface TokenHolderRow {
  rank: number;
  address: string;
  amount: number; // raw amount (not USD)
  percentage: number; // 0-100
}

export const tokenHoldersRows: TokenHolderRow[] = [
  { rank: 1, address: "0x0000...1829", amount: 553936058, percentage: 43.85 },
  { rank: 2, address: "0x0000...58c0", amount: 35095, percentage: 27.68 },
  { rank: 3, address: "0x0000...58c0", amount: 35095, percentage: 27.68 },
  { rank: 4, address: "0x0000...58c0", amount: 35095, percentage: 27.68 },
  { rank: 5, address: "0x0000...58c0", amount: 35095, percentage: 27.68 },
  { rank: 6, address: "0x0000...58c0", amount: 35095, percentage: 27.68 },
  { rank: 7, address: "0x0000...58c0", amount: 35095, percentage: 27.68 },
  { rank: 8, address: "0x0000...58c0", amount: 35095, percentage: 27.68 },
  { rank: 9, address: "0x0000...58c0", amount: 35095, percentage: 27.68 },
  { rank: 10, address: "0x0000...58c0", amount: 35095, percentage: 27.68 },
];

export const tokenHoldersSummary = [
  { label: "Token", value: "PURR" },
  { label: "Total Holders", value: "450" },
  { label: "Total Supply", value: "126,098" },
];

// Spot USDC holders/amount sample datasets by tab
export const holdersTrendsByTab: Record<string, HoldersTrendPoint[]> = {
  "Spot USDC Holders": [
    { date: "Jan 01", spotUSDCM: 10.5, holders: 32000, hip2M: 1.2 },
    { date: "Jan 02", spotUSDCM: 19.85, holders: 42053, hip2M: 4.175 },
    { date: "Jan 03", spotUSDCM: 18.0, holders: 36000, hip2M: 3.1 },
    { date: "Jan 04", spotUSDCM: 17.5, holders: 34000, hip2M: 2.2 },
  ],
  "Token Holders": [
    { date: "Jan 01", spotUSDCM: 8.2, holders: 25000, hip2M: 0.9 },
    { date: "Jan 02", spotUSDCM: 12.4, holders: 30000, hip2M: 1.7 },
    { date: "Jan 03", spotUSDCM: 13.9, holders: 28000, hip2M: 1.2 },
    { date: "Jan 04", spotUSDCM: 15.1, holders: 31000, hip2M: 1.8 },
  ],
};

export const spotSummaryMetrics = [
  { label: "Total Spot USDC", value: "$19.85M" },
  { label: "Total Holders", value: "47,053" },
  { label: "HIP-2 Amount", value: "$4.18M" },
  { label: "Last Updated", value: "7/25/2024" },
];