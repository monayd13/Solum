import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { agentId, voiceSettings } = await req.json();

    if (!agentId) {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 });
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

    console.log("[VoiceSettings] Updated for agent:", agentId, validated);
    return NextResponse.json({ agent });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
