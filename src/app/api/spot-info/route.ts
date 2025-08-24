import { NextRequest, NextResponse } from "next/server";

export const revalidate = 10; // 10 seconds cache

type ApiItem = {
    lastUpdate: number;
    totalSpotUSDC: number;
    holdersCount: number;
    "HIP-2": number;
};

export async function GET(_req: NextRequest) {
    const upstream = "https://hyper-e1nj.onrender.com/api/get-spot-info";
    const res = await fetch(upstream, { next: { revalidate } });
    if (!res.ok) return NextResponse.json("Upstream error", { status: 502 });
    const json = await res.json();
    const arr: ApiItem[] = Array.isArray(json) ? json : [];
    // sort ascending by lastUpdate to ease charting
    arr.sort((a, b) => (Number(a.lastUpdate) || 0) - (Number(b.lastUpdate) || 0));
    return NextResponse.json({ items: arr });
}
