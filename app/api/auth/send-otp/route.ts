import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { phone } = await req.json();

    if (!phone) {
        return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // MSG91 expects country code without '+', e.g. 91XXXXXXXXXX
    const mobile = `91${phone}`;

    const url = new URL("https://control.msg91.com/api/v5/otp");
    url.searchParams.set("template_id", process.env.MSG91_TEMPLATE_ID!);
    url.searchParams.set("mobile", mobile);
    url.searchParams.set("authkey", process.env.MSG91_AUTH_KEY!);

    const msg91Response = await fetch(url.toString(), { method: "POST" });
    const data = await msg91Response.json();

    console.log("MSG91 send-otp response:", data);

    if (data.type !== "success") {
        return NextResponse.json({ error: data.message || "Failed to send OTP" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP sent" });
}