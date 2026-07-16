import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdultDob, normalizeOptionalPhone, PROFILE_GENDERS } from "@/lib/validation";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json(
      { error: "Unable to load profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates: Record<string, unknown> = {};
    const body = await req.json();

    if ("full_name" in body) {
      if (body.full_name !== null && (typeof body.full_name !== "string" || !body.full_name.trim() || body.full_name.trim().length > 100)) {
        return NextResponse.json({ error: "Name must be between 1 and 100 characters" }, { status: 400 });
      }
      updates.full_name = body.full_name?.trim() ?? null;
    }
    if ("phone" in body) {
      const phone = normalizeOptionalPhone(body.phone);
      if (phone === undefined) {
        return NextResponse.json({ error: "Phone must be a valid international number" }, { status: 400 });
      }
      updates.phone = phone;
    }
    if ("dob" in body) {
      if (body.dob !== null && !isAdultDob(body.dob)) {
        return NextResponse.json({ error: "Solum is currently available to adults 18 and older" }, { status: 400 });
      }
      updates.dob = body.dob;
    }
    if ("gender" in body) {
      if (body.gender !== null && !PROFILE_GENDERS.has(body.gender)) {
        return NextResponse.json({ error: "Invalid gender value" }, { status: 400 });
      }
      updates.gender = body.gender;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json(
      { error: "Unable to update profile" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const serviceClient = await createServiceClient();
    const { error } = await serviceClient.auth.admin.deleteUser(user.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete the account" }, { status: 500 });
  }
}
