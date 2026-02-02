import { useMutation } from "@tanstack/react-query";

export interface TrackWalletRequest {
    address: string;
    email: string;
}

export interface TrackWalletResponse {
    success: boolean;
    message: string;
}

export function useTrackWallet() {
    return useMutation({
        mutationFn: async (data: TrackWalletRequest) => {
            const res = await fetch("/api/track-wallet", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({ message: "Failed to track wallet" }));
                throw new Error(error.message || "Failed to track wallet");
            }

            return res.json() as Promise<TrackWalletResponse>;
        },
    });
}
