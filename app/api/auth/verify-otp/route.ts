import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
        return NextResponse.json({ error: "Phone and OTP are required" }, { status: 400 });
    }

    const mobile = `91${phone}`;

    const url = new URL("https://control.msg91.com/api/v5/otp/verify");
    url.searchParams.set("mobile", mobile);
    url.searchParams.set("otp", otp);
    url.searchParams.set("authkey", process.env.MSG91_AUTH_KEY!);

    const msg91Response = await fetch(url.toString(), { method: "GET" });
    const data = await msg91Response.json();

    console.log("MSG91 verify-otp response:", data);

    if (data.type !== "success") {
        return NextResponse.json({ error: data.message || "Invalid OTP" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "OTP verified" });
}