import { parseUpstreamDate, toNumber } from "@/lib/utils";
import { NextResponse } from "next/server";

export const revalidate = 10; // 10 seconds


const DATE_FMT = (ts: number) =>
    new Date(ts).toLocaleDateString(undefined, { month: "short", day: "2-digit" });


export async function GET() {
    try {
        const res = await fetch("https://hyper-e1nj.onrender.com/api/defi", {
            next: { revalidate },
        });
        if (!res.ok) return NextResponse.json({ error: "Upstream error" }, { status: 502 });
        const data = await res.json();

        const root = Array.isArray(data) ? data[0] : data;
        const chainTvls = root?.chainTvls ?? {};
        const chain = chainTvls["Hyperliquid L1"] ?? chainTvls[Object.keys(chainTvls)[0]];
        if (!chain) return NextResponse.json({ error: "Chain not found" }, { status: 404 });

        const tvl = Array.isArray(chain.tvl) ? chain.tvl : [];
        const tokensInUsd = Array.isArray(chain.tokensInUsd) ? chain.tokensInUsd : null;

        // Normalize rows from tokensInUsd; fallback to tvl.tokens
        let rows: { date: string; USDC: number; USDT: number; total: number }[] = [];
        if (tokensInUsd) {
            rows = tokensInUsd.map((entry: any) => {
                const t = entry?.tokens ?? {};
                const USDC = toNumber((t as any).USDC) || 0;
                const USDT = toNumber((t as any).USDT) || 0;
                return { date: String(entry.date), USDC, USDT, total: USDC + USDT };
            });
        } else {
            rows = tvl
                .map((entry: any) => {
                    const t = entry?.tokens ?? {};
                    const USDC = toNumber((t as any).USDC) || 0;
                    const USDT = toNumber((t as any).USDT) || 0;
                    const total = USDC + USDT;
                    const ts = parseUpstreamDate(String(entry.date ?? ""));
                    const date = Number.isFinite(ts) ? DATE_FMT(ts) : String(entry.date ?? "");
                    return { date, USDC, USDT, total };
                })
                .filter((r: { date: string; USDC: number; USDT: number; total: number }) => r.total > 0);
        }

        // Compute 24h change using timestamps parsed from date
        const rowsWithTs = rows
            .map((r) => ({ ...r, ts: parseUpstreamDate(String(r.date)) }))
            .filter((r) => Number.isFinite(r.ts))
            .sort((a, b) => (a.ts as number) - (b.ts as number));

        const lastRow = rowsWithTs[rowsWithTs.length - 1];
        const dayMs = 24 * 60 * 60 * 1000;
        const cutoff = lastRow ? (lastRow.ts as number) - dayMs : NaN;
        // Choose the row at or before cutoff; fallback to previous row
        let prevRow = rowsWithTs.slice(0, -1).reverse().find((r) => (r.ts as number) <= cutoff);
        if (!prevRow && rowsWithTs.length >= 2) prevRow = rowsWithTs[rowsWithTs.length - 2];

        const pctChange = (curr: number, prev?: number) => (prev && prev > 0 ? ((curr - prev) / prev) * 100 : 0);
        const totalChangePct = lastRow ? pctChange(lastRow.total, prevRow?.total) : 0;

        // Latest token row (may have missing tokens)
        const latest = [...rows].reverse().find((r) => r.total > 0) ?? rows[rows.length - 1];

        // Compute current total from currentChainTvls
        const currentTotal = (() => {
            const cct = (root?.currentChainTvls ?? {}) as Record<string, unknown>;
            const vals = Object.values(cct).map((v) => (typeof v === "number" ? v : Number(v)));
            const sum = vals.reduce((a, b) => (Number.isFinite(b) ? a + (b as number) : a), 0);
            return Number.isFinite(sum) ? sum : 0;
        })();

        // Use the last row that actually had a non-zero USDT (or any non-zero split) to derive shares
        const lastSplit = (() => {
            for (let i = rows.length - 1; i >= 0; i--) {
                const r = rows[i];
                const s = (r?.USDC ?? 0) + (r?.USDT ?? 0);
                if (s > 0 && (r?.USDC ?? 0) > 0 && (r?.USDT ?? 0) > 0) return r;
            }
            for (let i = rows.length - 1; i >= 0; i--) {
                const r = rows[i];
                const s = (r?.USDC ?? 0) + (r?.USDT ?? 0);
                if (s > 0) return r; // fallback to any non-zero split
            }
            return latest;
        })();

        const splitSum = (lastSplit?.USDC ?? 0) + (lastSplit?.USDT ?? 0);
        const shareUSDC = splitSum > 0 ? (lastSplit.USDC / splitSum) : 0;
        const shareUSDT = splitSum > 0 ? (lastSplit.USDT / splitSum) : 0;

        // Prefer current total if available, else latest row total
        const totalNow = currentTotal > 0 ? currentTotal : latest?.total ?? 0;
        const current = {
            total: totalNow,
            USDC: totalNow > 0 ? totalNow * shareUSDC : (latest?.USDC ?? 0),
            USDT: totalNow > 0 ? totalNow * shareUSDT : (latest?.USDT ?? 0),
            shareUSDC: shareUSDC * 100,
            shareUSDT: shareUSDT * 100,
        };

        const LOGOS: Record<string, string> = {
            USDC: "https://res.cloudinary.com/dhvwthnzq/image/upload/v1755596889/hyperscope/usdc_vdcozh.svg",
            USDT: "https://res.cloudinary.com/dhvwthnzq/image/upload/v1755596886/hyperscope/Group_zwqult.svg",
        };
        const COLORS: Record<string, string> = {
            USDC: "#2775CA",
            USDT: "#26A17B",
        };

        const distribution = [
            {
                symbol: "USDC",
                value: current.USDC,
                percent: totalNow ? (current.USDC / totalNow) * 100 : 0,
                changePct: pctChange(latest?.USDC ?? 0, prevRow?.USDC),
                logo: LOGOS.USDC,
                color: COLORS.USDC,
            },
            {
                symbol: "USDT",
                value: current.USDT,
                percent: totalNow ? (current.USDT / totalNow) * 100 : 0,
                changePct: pctChange(latest?.USDT ?? 0, prevRow?.USDT),
                logo: LOGOS.USDT,
                color: COLORS.USDT,
            },
        ];

        // console.log("[stablecoins][rows]", rows.slice(-5));
        // console.log("[stablecoins][trend last]", latest);
        // console.log("[stablecoins][distribution]", distribution);
        // console.log("[stablecoins][current]", current);

        return NextResponse.json({
            rows, // all token rows
            trendLast: latest,
            distribution,
            current,
            totalLiquidity: tvl, // keep full tvl history too
            totalChangePct,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Failed to fetch stablecoins data" },
            { status: 500 }
        );
    }
}
