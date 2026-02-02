import { useQuery } from "@tanstack/react-query";
import { StablecoinItem } from "@/types";

export interface StablecoinsResponse {
    rows: Array<{
        date: string;
        USDC: number;
        USDT: number;
        total: number;
    }>;
    distribution: StablecoinItem[];
    current: {
        total: number;
        USDC: number;
        USDT: number;
    };
    trendLast: {
        date: string;
        USDC: number;
        USDT: number;
        total: number;
    };
    totalChangePct: number;
}

export function useStablecoins(initialData?: StablecoinsResponse) {
    return useQuery({
        queryKey: ["stablecoins"],
        queryFn: async () => {
            const res = await fetch("/api/stablecoins");
            if (!res.ok) throw new Error("Failed to fetch stablecoins data");
            return res.json() as Promise<StablecoinsResponse>;
        },
        initialData,
    });
}
