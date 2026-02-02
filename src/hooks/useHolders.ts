import { useQuery } from "@tanstack/react-query";

export interface HoldersResponse {
    token: string;
    lastUpdate: string | null;
    totalHolders: number;
    totalAmount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    rows: Array<{
        rank: number;
        address: string;
        amount: number;
        percentage: number;
    }>;
}

export function useHolders(
    token: string,
    page: number = 1,
    pageSize: number = 20,
    initialData?: HoldersResponse
) {
    return useQuery({
        queryKey: ["holders", token, page, pageSize],
        queryFn: async () => {
            const params = new URLSearchParams({
                token,
                page: page.toString(),
                pageSize: pageSize.toString(),
            });

            const res = await fetch(`/api/holders?${params}`);
            if (!res.ok) throw new Error("Failed to fetch holders data");
            return res.json() as Promise<HoldersResponse>;
        },
        initialData,
        enabled: !!token, // Only run if token is provided
    });
}
