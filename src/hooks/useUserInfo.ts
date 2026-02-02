import { useQuery } from "@tanstack/react-query";

export interface UserInfoResponse {
    address: string;
    openPositions: Array<{
        token: string;
        amount: number;
        value: number;
        pnl: number;
        pnlPercent: number;
    }>;
    tradingHistory: Array<{
        date: string;
        type: "buy" | "sell";
        token: string;
        amount: number;
        price: number;
        total: number;
    }>;
    spotHoldings: Array<{
        token: string;
        amount: number;
        value: number;
    }>;
    delegations: Array<{
        validator: string;
        amount: number;
        rewards: number;
    }>;
    staking: {
        totalStaked: number;
        totalRewards: number;
        activeValidators: number;
    };
    lastUpdate?: string;
}

export function useUserInfo(
    address: string,
    startTime?: string,
    initialData?: UserInfoResponse
) {
    return useQuery({
        queryKey: ["userInfo", address, startTime],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (startTime) params.append("start_time", startTime);

            const res = await fetch(`/api/user-info/${address}?${params}`);
            if (!res.ok) throw new Error("Failed to fetch user info");
            return res.json() as Promise<UserInfoResponse>;
        },
        initialData,
        enabled: !!address, // Only run if address is provided
        refetchOnWindowFocus: true, // Refetch when user returns to tab
    });
}
