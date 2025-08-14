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

