import { NextRequest, NextResponse } from "next/server";

export const revalidate = 300; // 5 min cache

type UpstreamResponse = {
    token: string;
    lastUpdate: string; // e.g., "25-08-20 11:00"
    holders: Record<string, number>;
};

const toNumber = (v: unknown): number =>
    typeof v === "number"
        ? v
        : typeof v === "string"
            ? Number(v.replace?.(/[^0-9.\-eE]/g, "") ?? v)
            : NaN;

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const token = (searchParams.get("token") || "").trim().toUpperCase();
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 20)));

    if (!token) {
        return NextResponse.json(
            { error: "Missing token parameter" },
            { status: 400 }
        );
    }

    const upstream = `https://hyper-dev-p1ob.onrender.com/api/get-holder/${encodeURIComponent(token)}`;
    const res = await fetch(upstream, { next: { revalidate } });
    if (!res.ok) return NextResponse.json("Upstream error", { status: 502 });
    const json = (await res.json()) as UpstreamResponse;

    const entries = Object.entries(json.holders || {});
    const totalHolders = entries.length;
    // compute total amount for percentages
    let totalAmount = 0;
    for (const [, v] of entries) {
        const n = toNumber(v);
        if (Number.isFinite(n)) totalAmount += n;
    }

    // sort descending by amount
    entries.sort((a, b) => (toNumber(b[1]) || 0) - (toNumber(a[1]) || 0));

    const totalPages = Math.max(1, Math.ceil(totalHolders / pageSize));
    const start = (page - 1) * pageSize;
    const pageSlice = entries.slice(start, start + pageSize);

    const rows = pageSlice.map(([address, amount], idx) => {
        const amt = toNumber(amount) || 0;
        const percentage = totalAmount > 0 ? (amt / totalAmount) * 100 : 0;
        return {
            rank: start + idx + 1,
            address,
            amount: amt,
            percentage,
        };
    });

    return NextResponse.json({
        token: json.token ?? token,
        lastUpdate: json.lastUpdate ?? null,
        totalHolders,
        totalAmount,
        page,
        pageSize,
        totalPages,
        rows,
    });
}
