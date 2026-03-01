/**
 * Setup script: Creates all 11 ElevenLabs conversational agents via API.
 *
 * Usage:
 *   ELEVENLABS_API_KEY=your_key npx tsx scripts/setup-elevenlabs-agents.ts
 *
 * After running, copy the output SQL to update agent_templates with the returned agent IDs.
 */

import * as fs from "fs";
import * as path from "path";

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error("❌ Set ELEVENLABS_API_KEY env var");
  process.exit(1);
}

const WEBHOOK_URL = process.env.WEBHOOK_URL; // e.g. https://<your-ngrok-or-prod-domain>/api/webhook/post-call
if (!WEBHOOK_URL) {
  console.warn("⚠️  WEBHOOK_URL not set — agents will be created without a post-call webhook.");
}

const API_URL = "https://api.elevenlabs.io/v1/convai/agents/create";
const PROMPTS_DIR = path.resolve(__dirname, "../personalities/voice-prompts");

// ─── Agent definitions ───────────────────────────────────────
// voice_id placeholders — replace with real ElevenLabs voice IDs before running.
// Browse voices at: https://elevenlabs.io/voice-library

interface AgentDef {
  name: string;
  promptFile: string;        // filename in voice-prompts/
  voiceId: string;           // ElevenLabs voice ID
  language: string;          // primary language code
  hinglishMode?: boolean;    // for Hindi agents that mix Hindi+English
}

const AGENTS: AgentDef[] = [
  // English
  { name: "Maya Thompson",   promptFile: "MayaThompson.md",   voiceId: "EXAVITQu4vr4xnSDxMaL", language: "en" },
  { name: "Daniel Mercer",   promptFile: "DanielMercer.md",   voiceId: "VR6AewLTigWG4xSOukaG", language: "en" },
  { name: "Claire Donovan",  promptFile: "ClaireDonovan.md",  voiceId: "pNInz6obpgDQGcFmaJgB", language: "en" },
  { name: "Tom Gallagher",   promptFile: "TomGallagher.md",   voiceId: "ErXwobaYiN019PkySvjV", language: "en" },
  { name: "Harold Bennett",  promptFile: "HaroldBennett.md",  voiceId: "pNInz6obpgDQGcFmaJgB", language: "en" },
  // Spanish / English
  { name: "Mateo Rivera",    promptFile: "MateoRivera.md",    voiceId: "VR6AewLTigWG4xSOukaG", language: "en" },
  { name: "Dr. Ana Morales", promptFile: "Dr.AnaMorales.md",  voiceId: "EXAVITQu4vr4xnSDxMaL", language: "en" },
  { name: "Rosa Gutierrez",  promptFile: "RosaGutierrez.md",  voiceId: "pNInz6obpgDQGcFmaJgB", language: "es" },
  // Hindi / English
  { name: "Priya Sharma",    promptFile: "PriyaSharma.md",    voiceId: "EXAVITQu4vr4xnSDxMaL", language: "hi", hinglishMode: true },
  { name: "Kavita Devi",     promptFile: "KavitaDevi.md",     voiceId: "pNInz6obpgDQGcFmaJgB", language: "hi", hinglishMode: true },
  // Black / Southern
  { name: "Jimmy Carter",    promptFile: "JimmyCarter.md",    voiceId: "VR6AewLTigWG4xSOukaG", language: "en" },
];

// ─── Create one agent ────────────────────────────────────────

async function createAgent(agent: AgentDef): Promise<{ name: string; agentId: string } | null> {
  const promptPath = path.join(PROMPTS_DIR, agent.promptFile);
  if (!fs.existsSync(promptPath)) {
    console.error(`  ⚠️  Missing prompt file: ${promptPath}`);
    return null;
  }
  const prompt = fs.readFileSync(promptPath, "utf-8");

  const body = {
    name: agent.name,
    conversation_config: {
      agent: {
        prompt: {
          prompt: prompt,
          llm: "gemini-2.0-flash",
          temperature: 0.7,
        },
        first_message: "{{first_message}}",
        language: agent.language,
        ...(agent.hinglishMode ? { hinglish_mode: true } : {}),
        dynamic_variables: {
          dynamic_variable_placeholders: {
            user_name: "Friend",
            user_context: "New user, no additional context yet.",
            memories: "No previous conversations yet — this is your first time meeting them.",
            first_message: "Hey! Nice to meet you. What's on your mind today?",
          },
        },
      },
      tts: {
        model_id: "eleven_v3_conversational",
        voice_id: agent.voiceId,
        stability: 0.5,
        similarity_boost: 0.8,
        speed: 1.0,
      },
      conversation: {
        max_duration_seconds: 600,
      },
      turn: {
        turn_timeout: 7,
        silence_end_call_timeout: 30,
      },
    },
    platform_settings: {
      widget: {
        variant: "compact",
        avatar: { type: "orb" },
      },
      ...(WEBHOOK_URL
        ? {
            webhooks: {
              post_call: { url: WEBHOOK_URL },
            },
          }
        : {}),
    },
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": API_KEY!,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`  ❌ ${agent.name}: ${res.status} — ${errText}`);
      return null;
    }

    const data = (await res.json()) as { agent_id: string };
    console.log(`  ✅ ${agent.name} → ${data.agent_id}`);
    return { name: agent.name, agentId: data.agent_id };
  } catch (err) {
    console.error(`  ❌ ${agent.name}: ${err}`);
    return null;
  }
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  console.log(`\n🚀 Creating ${AGENTS.length} ElevenLabs agents...\n`);

  const results: { name: string; agentId: string }[] = [];

  for (const agent of AGENTS) {
    const result = await createAgent(agent);
    if (result) results.push(result);
    // Small delay to avoid rate limits
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n✅ Created ${results.length}/${AGENTS.length} agents.\n`);

  if (results.length > 0) {
    console.log("── SQL to update Supabase ──────────────────────────");
    for (const r of results) {
      const escaped = r.name.replace(/'/g, "''");
      console.log(
        `UPDATE public.agent_templates SET elevenlabs_agent_id = '${r.agentId}' WHERE name = '${escaped}';`
      );
    }
    console.log("────────────────────────────────────────────────────\n");

    console.log("── .env update ─────────────────────────────────────");
    console.log("# You can remove NEXT_PUBLIC_ELEVENLABS_AGENT_ID once all agents have their own ID.");
    console.log("# First agent ID (fallback):");
    console.log(`NEXT_PUBLIC_ELEVENLABS_AGENT_ID=${results[0].agentId}`);
    console.log("────────────────────────────────────────────────────\n");
  }
}

main();
