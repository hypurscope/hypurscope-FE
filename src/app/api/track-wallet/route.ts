import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const { address, email } = await req.json();

        if (!address || !email) {
            return NextResponse.json(
                { error: "Address and email are required" },
                { status: 400 }
            );
        }

        const res = await fetch("https://hyper-e1nj.onrender.com/api/track-wallet", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: address, email }),
        });

        if (!res.ok) {
            const errorText = await res.text(); // getting error details
            return NextResponse.json(
                { error: "Failed to track wallet", details: errorText },
                { status: 500 }
            );
        }

        const data = await res.json(); // getting backend response
        return NextResponse.json({
            message: "Wallet tracked successfully",
            success: true,
            data,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Invalid request body or server error" },
            { status: 500 }
        );
    }
};
