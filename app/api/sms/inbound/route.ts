import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/twilio/client";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const from = formData.get("From") as string;
    const body = (formData.get("Body") as string ?? "").trim().toUpperCase();

    if (!from) {
      return new NextResponse("Missing From number", { status: 400 });
    }

    let reply = "";

    if (body === "REGISTER") {
      reply = `Hi! 👋 Welcome to Solum.

To create your account, visit:
${process.env.NEXT_PUBLIC_APP_URL}/signup

Reply STOP at any time to opt out.`;
    } else {
      reply = `Hi! Text REGISTER to get your Solum sign-up link.

Reply STOP to opt out.`;
    }

    await sendSMS(from, reply);

    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      { headers: { "Content-Type": "text/xml" } }
    );
  } catch (err) {
    console.error("Inbound SMS error:", err);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      { headers: { "Content-Type": "text/xml" } }
    );
  }
}
