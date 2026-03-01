# Solum — Developer Guide

## Quick Start

```bash
# 1. Clone and install
cd /Users/mohiniyadav/Documents/Solum
npm install

# 2. Create your env file (copy the block below into .env.local)
touch .env.local

# 3. Run dev server
npm run dev
# → http://localhost:3000
```

---

## Environment Variables

Create `.env.local` in the project root (`./Solum/`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# ElevenLabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_AGENT_ID=agent_2001kjkadpvafxdr0bge744sh1kq

# Anthropic (Claude)
ANTHROPIC_API_KEY=your_anthropic_api_key

# App URL (update for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Database Setup (Supabase)

Run these in order in the **Supabase SQL Editor** (supabase.com → your project → SQL Editor):

```
1. supabase/schema.sql   ← Creates all tables + RLS policies + auto-profile trigger
2. supabase/seed.sql     ← Inserts the 4 agent templates (Eleanor, Marcus, Sage, Felix)
```

Tables created:
| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (auto-created on signup) |
| `agent_templates` | The 4 base agent personalities (public read) |
| `user_agents` | Each user's personal copy of an agent |
| `conversations` | Call session records |
| `memories` | Facts extracted from each conversation |

---

## Adding a New Agent (Persona)

### Step 1 — Add to seed data
Edit `supabase/seed.sql` and add a new `INSERT` block:

```sql
INSERT INTO public.agent_templates (name, tagline, backstory, personality_traits, voice_id, avatar_emoji, accent_color, default_system_prompt) VALUES (
  'Your Agent Name',
  'Their Tagline',
  'Full backstory paragraph...',
  '{"warmth": 0.9, "humor": 0.7, "formality": 0.5, "storytelling": 0.8, "curiosity": 0.85, "empathy": 0.9}',
  'ELEVENLABS_VOICE_ID_HERE',
  '🧙',
  '#your_hex_color',
  'You are [Name], a [brief description]. Stay fully in character. Keep responses conversational (2-4 sentences), and never break character or mention being an AI.'
);
```

Then run the updated SQL in Supabase.

### Step 2 — Add to local backstories (optional, for prompt building)
Edit `lib/agents/backstories.ts` and add to the `AGENT_TEMPLATES` array:

```typescript
{
  name: "Your Agent Name",
  tagline: "Their Tagline",
  voice_id: "ELEVENLABS_VOICE_ID",
  avatar_emoji: "🧙",
  accent_color: "#your_hex_color",
  backstory: `Full backstory...`,
  personality_traits: {
    warmth: 0.9,
    humor: 0.7,
    formality: 0.5,
    storytelling: 0.8,
    curiosity: 0.85,
    empathy: 0.9,
  },
  avatar_url: null,
  default_system_prompt: `You are [Name]...`,
},
```

**ElevenLabs Voice IDs** — find them at elevenlabs.io → Voices. Example IDs:
- `EXAVITQu4vr4xnSDxMaL` — Sarah (warm female)
- `VR6AewLTigWG4xSOukaG` — Arnold (strong male)
- `pNInz6obpgDQGcFmaJgB` — Adam (calm male)
- `ErXwobaYiN019PkySvjV` — Antoni (well-rounded male)

---

## Frontend — Adding / Editing Pages

### File structure
```
app/
├── page.tsx                  ← Landing page
├── (auth)/
│   ├── login/page.tsx        ← Login form
│   └── signup/page.tsx       ← Signup form
├── dashboard/page.tsx        ← Agent selection grid
└── call/[agentId]/page.tsx   ← Active voice call UI
```

### Adding a new page
Create `app/your-route/page.tsx`:

```tsx
export default function YourPage() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
      {/* use CSS vars for all colors — see Design System below */}
    </div>
  );
}
```

### Design System — CSS Variables
Always use these variables, never hardcode colors:

| Variable | Dark | Light | Use for |
|----------|------|-------|---------|
| `--bg` | `#0d0b08` | `#faf7f0` | Page background |
| `--bg2` | `#131008` | `#f3ede2` | Secondary background |
| `--surface` | `#1a1610` | `#ffffff` | Cards, panels |
| `--surface2` | `#201c12` | `#f0ead8` | Inputs, hover states |
| `--border` | `#2a2415` | `#e0d8c8` | Subtle borders |
| `--border2` | `#3d3520` | `#c8bfa8` | Card borders |
| `--text` | `#f0ead8` | `#18140e` | Body text |
| `--muted` | `#7a6e55` | `#7a6e55` | Secondary text, labels |
| `--amber` | `#d4880a` | `#c06800` | Primary accent |
| `--amber-l` | amber 10% | amber 10% | Tinted backgrounds |
| `--amber-m` | amber 25% | amber 25% | Borders on tinted bg |
| `--teal` | `#2a9d8f` | `#1e7a6e` | Teal accent (Marcus) |
| `--rose` | `#c9637a` | `#b04060` | Rose accent (Felix) |
| `--green` | `#5a9e6a` | `#3a7a4a` | Green accent (Sage) |

### Fonts
```tsx
// Headings, agent names, large display text
style={{ fontFamily: "var(--font-cormorant)" }}

// Body text (default — already set on body)
style={{ fontFamily: "var(--font-dm-sans)" }}

// Timestamps, tags, monospace labels
style={{ fontFamily: "var(--font-dm-mono)" }}
```

### Reusable Components
```
components/
├── AgentCard.tsx          ← Agent selection card with Call button
├── CallInterface.tsx      ← Full-screen active call UI
├── WaveformVisualizer.tsx ← Audio level bars
├── ThemeToggle.tsx        ← Sun/moon theme switcher
└── ThemeProvider.tsx      ← Wraps app, handles dark/light persistence
```

---

## Backend — Adding / Editing API Routes

### File structure
```
app/api/
├── call/start/route.ts         ← POST: start ElevenLabs session
├── webhook/elevenlabs/route.ts ← POST: receive transcript, save memories
└── memories/route.ts           ← GET: fetch user memories
```

### Adding a new API route
Create `app/api/your-route/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // your logic here

  return NextResponse.json({ data: "..." });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // ...
}
```

### Supabase — Server vs Browser client
- **In API routes / Server Components** → `import { createClient } from "@/lib/supabase/server"`
- **In Client Components** → `import { createClient } from "@/lib/supabase/client"`
- **In webhook routes** (no user session) → `import { createServiceClient } from "@/lib/supabase/server"`

### Call Flow (how a voice call works end-to-end)

```
1. User clicks "Call Eleanor" on dashboard
   └─ Creates user_agents row if not exists

2. POST /api/call/start  { agentId }
   ├─ Fetches user_agents + agent_templates from Supabase
   ├─ Fetches top 20 memories for this user+agent
   ├─ Calls buildSystemPrompt() → injects backstory + memories
   ├─ Calls ElevenLabs API → gets { conversation_id, websocket_url }
   ├─ Inserts conversations row in Supabase
   └─ Returns { conversationId, websocketUrl }

3. Browser (useCall hook) connects WebSocket to websocketUrl
   └─ Streams microphone audio to ElevenLabs
   └─ Receives audio back and plays it

4. User clicks "End Call"
   └─ WebSocket closes

5. ElevenLabs POSTs to POST /api/webhook/elevenlabs
   ├─ Receives { conversation_id, transcript, duration_seconds }
   ├─ Uses Claude to extract 3-5 memories from transcript
   ├─ Uses Claude to generate a 2-3 sentence summary
   ├─ Updates conversations row with transcript + summary
   └─ Inserts memories rows into Supabase
```

### Editing the System Prompt
The prompt is built in `lib/agents/prompts.ts` → `buildSystemPrompt()`.

Structure injected per call:
```
# CHARACTER: Eleanor
## WHO YOU ARE       ← agent backstory from DB
## YOUR PERSONALITY  ← derived from personality_traits JSON
## THE PERSON YOU'RE TALKING TO  ← user's full_name + custom_instructions
## WHAT YOU REMEMBER ABOUT THEM  ← top 20 memories by importance
## HOW TO CONVERSE   ← static conversation rules
```

---

## ElevenLabs Setup

1. Go to [elevenlabs.io](https://elevenlabs.io) → **Conversational AI** → your agent
2. Set the LLM to **Claude** (Anthropic)
3. In **Dynamic Variables**, add: `system_prompt` (string)
4. In the agent's **System Prompt** field, reference it as `{{system_prompt}}`
5. Your `ELEVENLABS_AGENT_ID` is the agent ID shown in the URL: `agent_2001kjkadpvafxdr0bge744sh1kq`

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
cd /Users/mohiniyadav/Documents/Solum
vercel

# Set environment variables in Vercel dashboard:
# Settings → Environment Variables → add all vars from .env.local
```

After deploying, update `NEXT_PUBLIC_APP_URL` in Vercel env vars to your production URL.

Also update the ElevenLabs webhook URL in your agent settings to:
`https://your-app.vercel.app/api/webhook/elevenlabs`

---

## Stretch Goals (not yet built)

- `app/dashboard/history/page.tsx` — conversation history with summaries
- `app/agents/[id]/customize/page.tsx` — personality slider UI
- `app/api/llm/route.ts` — custom LLM endpoint (full Claude control, bypasses EL built-in)
- `components/MemoryTimeline.tsx` — visual memory display per agent
