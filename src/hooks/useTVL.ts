import { useQuery } from "@tanstack/react-query";

export interface TVLResponse {
    items: Array<{
        date: string;
        value: number;
        displayValue: string;
    }>;
}

export function useTVL(
    range: string = "24h",
    chain?: string,
    initialData?: TVLResponse
) {
    return useQuery({
        queryKey: ["tvl", range, chain],
        queryFn: async () => {
            const params = new URLSearchParams({ range });
            if (chain) params.append("chain", chain);

            const res = await fetch(`/api/tvl?${params}`);
            if (!res.ok) throw new Error("Failed to fetch TVL data");
            return res.json() as Promise<TVLResponse>;
        },
        initialData,
        refetchInterval: 30000, // 30 seconds for live updates
        refetchIntervalInBackground: false, // Pause when tab is hidden
    });
}
