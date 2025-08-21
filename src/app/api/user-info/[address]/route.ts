import { NextRequest, NextResponse } from "next/server";

export const revalidate = 60; // cache for 1 minute

type Params = {
    // This might be a promise that resolves to an object containing the address parameter
    params: Promise<{
        address: string;
    }>;
}

export async function GET(
    req: NextRequest,
    { params }: Params
) {
    const { address } = await params;
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start_time") || "2000-01-01 00:00"; // go way back by default

    const upstream = `https://hyper-dev-p1ob.onrender.com/api/user-info/${encodeURIComponent(
        address
    )}?start_time=${encodeURIComponent(start)}`;

    try {
        const res = await fetch(upstream, { next: { revalidate } });
        if (!res.ok) {
            return NextResponse.json(
                { error: `Upstream error: ${res.status}` },
                { status: res.status }
            );
        }
        const data = await res.json();
        return NextResponse.json(data, {
            headers: {
                "Cache-Control": `public, s-maxage=${revalidate}, stale-while-revalidate=${revalidate}`,
            },
        });
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message || "Failed to fetch user info" },
            { status: 500 }
        );
    }
}
