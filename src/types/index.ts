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