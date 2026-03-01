import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendSMS } from "@/lib/twilio/client";

interface EnrollPayload {
  full_name: string;
  phone: string;
  age?: number;
  gender?: string;
  dob?: string;
  message?: string;
}

function buildWelcomeMessage(name: string, customMessage?: string): string {
  const firstName = name.split(" ")[0];

  if (customMessage) return customMessage;

  return `Hi ${firstName}! 👋 This is Solum.

Someone who cares about you thought you might enjoy having a companion to talk to — someone who listens, remembers, and is always happy to hear from you.

Solum will call you for warm, real conversations. No app, no smartphone needed. Just answer when we call.

Your first call will be coming soon. We can't wait to chat with you! 💛

Reply STOP at any time to opt out.`;
}

export async function POST(req: NextRequest) {
  try {
    const body: EnrollPayload = await req.json();
    const { full_name, phone, age, gender, dob, message } = body;

    if (!full_name || !phone) {
      return NextResponse.json(
        { error: "full_name and phone are required" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    // Check if user already exists by phone
    const { data: existing } = await supabase
      .from("profiles")
      .select("id, phone")
      .eq("phone", phone)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "A user with this phone number is already enrolled" },
        { status: 409 }
      );
    }

    // Create auth user with phone as identifier (use phone@solum.app as email placeholder)
    const sanitizedPhone = phone.replace(/[^0-9+]/g, "");
    const placeholderEmail = `${sanitizedPhone.replace("+", "")}@solum.enrolled`;
    const tempPassword = crypto.randomUUID();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: placeholderEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (authError || !authData.user) {
      console.error("Auth user creation failed:", authError);
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    // Update profile with all details
    await supabase
      .from("profiles")
      .update({
        full_name,
        phone: sanitizedPhone,
        age: age ?? null,
        gender: gender ?? null,
        dob: dob ?? null,
        email: placeholderEmail,
        updated_at: new Date().toISOString(),
      })
      .eq("id", authData.user.id);

    // Send welcome SMS
    const welcomeMessage = buildWelcomeMessage(full_name, message);
    await sendSMS(sanitizedPhone, welcomeMessage);

    console.log(`Enrolled and SMS sent to ${full_name} at ${sanitizedPhone}`);

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
      message: `Welcome SMS sent to ${sanitizedPhone}`,
    });

  } catch (err) {
    console.error("Outbound SMS error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
