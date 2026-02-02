import { useQuery } from "@tanstack/react-query";
import { HoldersTrendPoint } from "@/types";

export interface SpotInfoResponse {
    trends: HoldersTrendPoint[];
    summary: {
        totalSpotUSDC: number;
        totalHolders: number;
        totalHIP2: number;
    };
    lastUpdate?: string;
}

export function useSpotInfo(initialData?: SpotInfoResponse) {
    return useQuery({
        queryKey: ["spotInfo"],
        queryFn: async () => {
            const res = await fetch("/api/spot-info");
            if (!res.ok) throw new Error("Failed to fetch spot info");
            return res.json() as Promise<SpotInfoResponse>;
        },
        initialData,
    });
}
