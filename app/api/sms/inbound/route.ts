import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/twilio/client";
import twilio from "twilio";

function isValidTwilioRequest(req: NextRequest, params: Record<string, string>): boolean {
  const token = process.env.TWILIO_AUTH_TOKEN;
  const signature = req.headers.get("x-twilio-signature");
  if (!token || !signature) return false;

  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL;
  const url = configuredOrigin
    ? new URL(req.nextUrl.pathname + req.nextUrl.search, configuredOrigin).toString()
    : req.url;
  return twilio.validateRequest(token, signature, url, params);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const params = Object.fromEntries(
      Array.from(formData.entries()).map(([key, value]) => [key, String(value)]),
    );
    if (!isValidTwilioRequest(req, params)) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const from = params.From;
    const body = (params.Body ?? "").trim().toUpperCase();

    if (!from) {
      return new NextResponse("Missing From number", { status: 400 });
    }

    let reply = "";

    if (body === "REGISTER") {
      reply = `Hi! 👋 Welcome to Solum.

To create your account, visit:
${process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin}/signup

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
