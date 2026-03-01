import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/twilio/client";

const SOLUM_INTRO = `Hi! 👋 I'm Solum — an AI companion that calls you for a real conversation.

Solum connects you with warm, thoughtful companions who remember you across calls. No app needed. We just call your phone.

To get started, visit:
${process.env.NEXT_PUBLIC_APP_URL}/signup

Or reply CALL ME and we'll reach out to you.

Reply STOP at any time to opt out.`;

const CALL_ME_RESPONSE = `Got it! Someone from our team will be in touch shortly to get you set up.

In the meantime you can also sign up at:
${process.env.NEXT_PUBLIC_APP_URL}/signup`;

const STOP_RESPONSE = `You've been unsubscribed from Solum messages. You won't receive any more texts or calls from us.

To re-subscribe, text START at any time.`;

const DEFAULT_RESPONSE = `Thanks for reaching out to Solum! 💛

We're an AI companion service — we call people for real, warm conversations. No app needed.

Reply INFO to learn more, or visit:
${process.env.NEXT_PUBLIC_APP_URL}`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const from = formData.get("From") as string;
    const body = (formData.get("Body") as string ?? "").trim().toUpperCase();

    if (!from) {
      return new NextResponse("Missing From number", { status: 400 });
    }

    let replyMessage = DEFAULT_RESPONSE;

    if (body === "INFO" || body === "HELLO" || body === "HI" || body === "HEY" || body === "WHAT IS SOLUM" || body === "SOLUM") {
      replyMessage = SOLUM_INTRO;
    } else if (body === "CALL ME" || body === "CALL") {
      replyMessage = CALL_ME_RESPONSE;
    } else if (body === "STOP" || body === "UNSUBSCRIBE" || body === "CANCEL") {
      replyMessage = STOP_RESPONSE;
    }

    await sendSMS(from, replyMessage);

    // Return empty TwiML response (Twilio expects this)
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
