import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UUID_PATTERN } from "@/lib/validation";

const SUPPORTED_LANGUAGES = new Set(["en", "en-US", "en-GB", "es", "fr", "de", "it", "pt", "hi", "ja"]);

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { agentId, voiceSettings } = await req.json();

    if (typeof agentId !== "string" || !UUID_PATTERN.test(agentId) || !voiceSettings || typeof voiceSettings !== "object") {
      return NextResponse.json({ error: "A valid agent and voice settings are required" }, { status: 400 });
    }

    // Validate voice settings values
    const validated: Record<string, unknown> = {};
    if (voiceSettings.speed != null) {
      const speed = Number(voiceSettings.speed);
      if (speed < 0.5 || speed > 2.0) {
        return NextResponse.json({ error: "Speed must be between 0.5 and 2.0" }, { status: 400 });
      }
      validated.speed = speed;
    }
    if (voiceSettings.stability != null) {
      const stability = Number(voiceSettings.stability);
      if (stability < 0 || stability > 1) {
        return NextResponse.json({ error: "Stability must be between 0 and 1" }, { status: 400 });
      }
      validated.stability = stability;
    }
    if (voiceSettings.similarityBoost != null) {
      const sim = Number(voiceSettings.similarityBoost);
      if (sim < 0 || sim > 1) {
        return NextResponse.json({ error: "Similarity boost must be between 0 and 1" }, { status: 400 });
      }
      validated.similarityBoost = sim;
    }
    if (voiceSettings.language && !SUPPORTED_LANGUAGES.has(voiceSettings.language)) {
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
    }
    if (voiceSettings.language) {
      validated.language = voiceSettings.language;
    }

    const { data: agent, error } = await supabase
      .from("user_agents")
      .update({ voice_settings: validated })
      .eq("id", agentId)
      .eq("user_id", user.id)
      .select("id, voice_settings")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ agent });
  } catch {
    return NextResponse.json(
      { error: "Unable to update voice settings" },
      { status: 500 }
    );
  }
}
