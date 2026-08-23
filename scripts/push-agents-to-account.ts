/**
 * Push all 11 agents to a new ElevenLabs account using backup config + voice prompts.
 *
 * Usage:
 *   ELEVENLABS_API_KEY=<new_key> npx tsx scripts/push-agents-to-account.ts
 */

import * as fs from "fs";
import * as path from "path";

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error("❌ Set ELEVENLABS_API_KEY env var");
  process.exit(1);
}

const WEBHOOK_URL = process.env.WEBHOOK_URL;
if (!WEBHOOK_URL) {
  console.error("❌ Set WEBHOOK_URL env var");
  process.exit(1);
}
const API_URL = "https://api.elevenlabs.io/v1/convai/agents/create";
const PROMPTS_DIR = path.resolve(__dirname, "../personalities/voice-prompts");
const BACKUP_PATH = path.resolve(__dirname, "../elevenlabs-agents-backup.json");

// Read backup for reference configs
const backup = JSON.parse(fs.readFileSync(BACKUP_PATH, "utf-8"));

interface AgentDef {
  name: string;
  promptFile: string;
  voiceId: string;
  language: string;
  hinglishMode?: boolean;
}

const AGENTS: AgentDef[] = [
  { name: "Maya Thompson",   promptFile: "MayaThompson.md",   voiceId: "EXAVITQu4vr4xnSDxMaL", language: "en" },
  { name: "Daniel Mercer",   promptFile: "DanielMercer.md",   voiceId: "VR6AewLTigWG4xSOukaG", language: "en" },
  { name: "Claire Donovan",  promptFile: "ClaireDonovan.md",  voiceId: "pNInz6obpgDQGcFmaJgB", language: "en" },
  { name: "Tom Gallagher",   promptFile: "TomGallagher.md",   voiceId: "ErXwobaYiN019PkySvjV", language: "en" },
  { name: "Harold Bennett",  promptFile: "HaroldBennett.md",  voiceId: "pNInz6obpgDQGcFmaJgB", language: "en" },
  { name: "Mateo Rivera",    promptFile: "MateoRivera.md",    voiceId: "VR6AewLTigWG4xSOukaG", language: "en" },
  { name: "Dr. Ana Morales", promptFile: "Dr.AnaMorales.md",  voiceId: "EXAVITQu4vr4xnSDxMaL", language: "en" },
  { name: "Rosa Gutierrez",  promptFile: "RosaGutierrez.md",  voiceId: "pNInz6obpgDQGcFmaJgB", language: "es" },
  { name: "Priya Sharma",    promptFile: "PriyaSharma.md",    voiceId: "EXAVITQu4vr4xnSDxMaL", language: "hi", hinglishMode: true },
  { name: "Kavita Devi",     promptFile: "KavitaDevi.md",     voiceId: "pNInz6obpgDQGcFmaJgB", language: "hi", hinglishMode: true },
  { name: "Jimmy Carter",    promptFile: "JimmyCarter.md",    voiceId: "VR6AewLTigWG4xSOukaG", language: "en" },
];

async function createAgent(agent: AgentDef): Promise<{ name: string; agentId: string } | null> {
  // Read the full voice prompt
  const promptPath = path.join(PROMPTS_DIR, agent.promptFile);
  if (!fs.existsSync(promptPath)) {
    console.error(`  ⚠️  Missing prompt file: ${promptPath}`);
    return null;
  }
  const prompt = fs.readFileSync(promptPath, "utf-8");

  // Get backup config for reference (ASR, turn, TTS settings)
  const backupAgent = backup.agents[agent.name]?.config;
  const backupConvConfig = backupAgent?.conversation_config;

  const body: Record<string, unknown> = {
    name: agent.name,
    conversation_config: {
      asr: backupConvConfig?.asr
        ? {
            quality: backupConvConfig.asr.quality,
            provider: backupConvConfig.asr.provider,
            user_input_audio_format: backupConvConfig.asr.user_input_audio_format,
          }
        : { quality: "high", provider: "scribe_realtime", user_input_audio_format: "pcm_16000" },
      agent: {
        prompt: {
          prompt: prompt,
          llm: "gemini-2.5-flash",
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
        expressive_mode: true,
      },
      conversation: {
        max_duration_seconds: 600,
      },
      turn: backupConvConfig?.turn
        ? {
            turn_timeout: backupConvConfig.turn.turn_timeout ?? 7,
            silence_end_call_timeout: backupConvConfig.turn.silence_end_call_timeout ?? 30,
            mode: backupConvConfig.turn.mode ?? "turn",
            turn_eagerness: backupConvConfig.turn.turn_eagerness ?? "normal",
          }
        : { turn_timeout: 7, silence_end_call_timeout: 30 },
    },
    platform_settings: {
      widget: {
        variant: "compact",
        avatar: { type: "orb" },
      },
      webhooks: {
        post_call: { url: WEBHOOK_URL },
      },
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

async function main() {
  console.log(`\n🚀 Pushing ${AGENTS.length} agents to new account...\n`);
  console.log(`   API Key: ${API_KEY!.slice(0, 8)}...${API_KEY!.slice(-4)}`);
  console.log(`   Webhook: ${WEBHOOK_URL}\n`);

  const results: { name: string; agentId: string }[] = [];

  for (const agent of AGENTS) {
    const result = await createAgent(agent);
    if (result) results.push(result);
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

    // Also save results to a file
    const outPath = path.resolve(__dirname, "../new-agent-ids.json");
    fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
    console.log(`💾 Agent IDs saved to ${outPath}\n`);
  }
}

main();
