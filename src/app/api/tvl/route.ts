import { parseUpstreamDate, toNumber } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 10; // cache 10 seconds

type ChartPoint = { date: string; value: number; displayValue: string };

const fmtUSD = (n: number): string => {
    if (!Number.isFinite(n)) return "$0";
    const abs = Math.abs(n);
    if (abs >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (abs >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
    return `$${n.toFixed(0)}`;
};

// Accepts dates like "YYYY-MM-DD HH:mm", "YY:MM:DD HH:mm", etc.

const thresholdFor = (range?: string): number | null => {
    const now = Date.now();
    switch (range) {
        case "24h":
            return now - 24 * 60 * 60 * 1000;
        case "7D":
            return now - 7 * 24 * 60 * 60 * 1000;
        case "30D":
            return now - 30 * 24 * 60 * 60 * 1000;
        case "90D":
            return now - 90 * 24 * 60 * 60 * 1000;
        default:
            return null;
    }
};

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const chainFilter = searchParams.get("chain") ?? undefined; // optional chain
    const range = searchParams.get("range") ?? undefined; // 24h|7D|30D|90D

    const upstream = "https://hyper-e1nj.onrender.com/api/defi";
    const res = await fetch(upstream, { next: { revalidate } });
    if (!res.ok) return NextResponse.json("Upstream error", { status: 502 });
    const json = await res.json();

    const protocols: any[] = Array.isArray(json) ? json : [json];
    const byTs = new Map<number, number>();

    // Aggregate values by timestamp
    for (const p of protocols) {
        const ct = p?.chainTvls ?? {};
        const chains = chainFilter ? [chainFilter] : Object.keys(ct);
        for (const ch of chains) {
            const series = ct?.[ch]?.tvl ?? [];
            for (const item of series) {
                const ts = parseUpstreamDate(String(item?.date ?? ""));
                if (!Number.isFinite(ts)) continue;
                let value = toNumber(item?.totalLiquidityUSD);
                if (!Number.isFinite(value) || value === 0) {
                    const tokens = item?.tokens && typeof item.tokens === "object" ? item.tokens : undefined;
                    if (tokens) {
                        value = Object.values(tokens as Record<string, unknown>)
                            .map(toNumber)
                            .filter((n): n is number => Number.isFinite(n))
                            .reduce((acc, n) => acc + n, 0);
                    }
                }
                if (!Number.isFinite(value)) continue;
                byTs.set(ts, (byTs.get(ts) ?? 0) + value);
            }
        }
    }

    // Sort and range-filter
    const rows = Array.from(byTs.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([ts, value]) => ({ ts, value }));

    const threshold = thresholdFor(range || undefined);
    const filtered = threshold ? rows.filter((r) => r.ts >= threshold) : rows;

    const items: ChartPoint[] = filtered.map(({ ts, value }) => ({
        date: new Date(ts).toLocaleDateString(undefined, { month: "short", day: "2-digit" }),
        value,
        displayValue: fmtUSD(value),
    }));

    return NextResponse.json({ items });
}
