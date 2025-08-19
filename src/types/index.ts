export interface MetricData {
  label: string;
  value: string;
  description?: string;
  change?: {
    percentage: string;
    direction: 'up' | 'down';
    period: string;
  };
}


export interface ChartDataPoint {
  date: string;
  value: number;
  displayValue?: string; // For formatted display (e.g., "$1.9B")
}

export type StablecoinItem = {
  symbol: string; // e.g., USDC
  value: number; // raw USD value (e.g., 1680000000)
  percent: number; // share of total (0-100)
  changePct: number; // daily/period change in % (can be negative)
  color?: string; // optional brand color for icon chip
  logo?: string; // optional logo URL for the stablecoin
};

// Holders/spot trends for composite chart (area + lines)
export interface HoldersTrendPoint {
  date: string; // e.g., "Jan 01"
  spotUSDCM: number; // Total spot USDC in millions (left axis)
  holders: number; // Number of holders (right axis)
  hip2M: number; // HIP-2 amount in millions (left axis)
}
