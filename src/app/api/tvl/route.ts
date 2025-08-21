import { NextRequest } from "next/server";

export const revalidate = 300; // cache 5 minutes

type ChartPoint = { date: string; value: number; displayValue: string };

// Small helpers
const toNum = (v: unknown): number =>
    typeof v === "number"
        ? v
        : typeof v === "string"
            ? ((n) => (Number.isFinite(n) ? n : NaN))(Number(v.replace?.(/[^0-9.\-eE]/g, "") ?? v))
            : NaN;

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
const parseUpstreamDate = (s: string): number => {
    if (!s) return NaN;
    const parts = s.split(/[^0-9]/).filter(Boolean); // [y, m, d, hh, mm]
    if (parts.length < 3) return NaN;
    let y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    const hh = Number(parts[3] ?? 0);
    const mm = Number(parts[4] ?? 0);
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return NaN;
    if (y < 100) y += 2000; // 24 => 2024
    return Date.UTC(y, Math.max(0, m - 1), d, hh, mm, 0);
};

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

    const upstream = "https://hyper-dev-p1ob.onrender.com/api/defi";
    const res = await fetch(upstream, { next: { revalidate } });
    if (!res.ok) return new Response("Upstream error", { status: 502 });
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
                let value = toNum(item?.totalLiquidityUSD);
                if (!Number.isFinite(value) || value === 0) {
                    const tokens = item?.tokens && typeof item.tokens === "object" ? item.tokens : undefined;
                    if (tokens) {
                        value = Object.values(tokens as Record<string, unknown>)
                            .map(toNum)
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

    return Response.json({ items });
}
