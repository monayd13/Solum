# WINDSURF PROMPT: Build Solum AI Companion Platform

## TASK
Build a Next.js 14 application called "Solum" - an AI companion voice platform where users call and chat with personality-driven AI agents who remember them across conversations.

## TECH STACK (DO NOT CHANGE)
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Supabase (database + auth)
- ElevenLabs Conversational AI (voice)
- Claude API via Anthropic SDK (personality/responses)
- Deploy to Vercel

## STEP 1: Initialize Project

```bash
npx create-next-app@latest solum --typescript --tailwind --app --src-dir=false
cd solum
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @anthropic-ai/sdk
```

## STEP 2: Create File Structure

```
solum/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # Landing page
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/
│   │   └── page.tsx                  # Agent selection grid
│   ├── call/
│   │   └── [agentId]/page.tsx        # Active call UI
│   └── api/
│       ├── call/start/route.ts       # Start ElevenLabs session
│       ├── webhook/elevenlabs/route.ts # Receive transcript
│       ├── llm/route.ts              # Custom LLM for ElevenLabs
│       └── memories/route.ts
├── components/
│   ├── AgentCard.tsx
│   ├── CallInterface.tsx
│   └── WaveformVisualizer.tsx
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── elevenlabs/client.ts
│   ├── claude/client.ts
│   └── agents/prompts.ts
├── hooks/
│   ├── useCall.ts
│   └── useAgent.ts
└── types/index.ts
```

## STEP 3: Database Schema (Supabase SQL)

Run this in Supabase SQL editor:

```sql
-- Agent templates
CREATE TABLE public.agent_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tagline TEXT,
  backstory TEXT NOT NULL,
  personality_traits JSONB,
  voice_id TEXT NOT NULL,
  avatar_url TEXT,
  default_system_prompt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User's customized agents
CREATE TABLE public.user_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.agent_templates(id),
  custom_name TEXT,
  personality_overrides JSONB,
  custom_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.user_agents(id),
  elevenlabs_conversation_id TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  transcript JSONB,
  summary TEXT
);

-- Memories
CREATE TABLE public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.user_agents(id),
  conversation_id UUID REFERENCES public.conversations(id),
  content TEXT NOT NULL,
  category TEXT,
  importance INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.agent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- Public read for templates
CREATE POLICY "Anyone can view agent templates" ON public.agent_templates FOR SELECT USING (true);

-- User policies
CREATE POLICY "Users can manage own agents" ON public.user_agents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own conversations" ON public.conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own memories" ON public.memories FOR ALL USING (auth.uid() = user_id);
```

## STEP 4: Core API Routes

### `/app/api/call/start/route.ts`
- Accept POST with { agentId }
- Verify user auth via Supabase
- Fetch agent details + template from DB
- Fetch user's memories with this agent (limit 20, order by importance)
- Build system prompt using agent backstory + memories
- Call ElevenLabs API to create conversation session
- Return { conversationId, websocketUrl }

### `/app/api/llm/route.ts`
- This is the custom LLM endpoint ElevenLabs calls
- Receive { messages, system_prompt, user_id, agent_id }
- Forward to Claude API with system prompt
- Return { content: response_text }

### `/app/api/webhook/elevenlabs/route.ts`
- Receive POST from ElevenLabs with transcript
- Use Claude to extract 3-5 memories from transcript
- Use Claude to generate 2-3 sentence summary
- Save to Supabase: update conversation, insert memories

## STEP 5: System Prompt Builder

Create `lib/agents/prompts.ts` that builds prompts like:

```
# CHARACTER: Eleanor

## WHO YOU ARE
[backstory from DB]

## THE PERSON YOU'RE TALKING TO
Name: [user name]
[custom instructions if any]

## WHAT YOU REMEMBER ABOUT THEM
- [memory 1]
- [memory 2]
...

## HOW TO CONVERSE
- Stay in character
- Reference backstory naturally
- Weave in storytelling
- Remember details they share
- Keep responses conversational (2-4 sentences)
- Never break character
```

## STEP 6: Call Interface Component

Build `components/CallInterface.tsx`:
- Large avatar with pulse animation when agent speaks
- Agent name and status indicator
- Audio waveform visualizer
- "Call [Agent]" / "End Call" button
- Uses WebSocket to ElevenLabs for real-time audio

## STEP 7: useCall Hook

Build `hooks/useCall.ts`:
- Manages WebSocket connection to ElevenLabs
- Handles getUserMedia for microphone
- Tracks: status (idle/connecting/connected), isSpeaking, audioLevel
- Exposes: connect(), disconnect()

## STEP 8: Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_AGENT_ID=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## STEP 9: Seed Data

Insert one agent template (Eleanor):

```sql
INSERT INTO agent_templates (name, tagline, backstory, personality_traits, voice_id, default_system_prompt) VALUES (
  'Eleanor',
  'The Wise Storyteller',
  'Eleanor is a 68-year-old retired literature professor who spent 35 years teaching at a small New England college. She grew up in Cornwall, England, surrounded by myths and legends of the sea. Her grandmother was a traditional storyteller who passed down generations of folktales. After retiring, Eleanor moved to a cottage in Vermont where she writes children''s books. She lost her husband Thomas five years ago and finds joy in connecting with others through stories. She has a warm, gentle demeanor with a subtle British accent.',
  '{"warmth": 0.95, "humor": 0.6, "storytelling": 0.95, "curiosity": 0.9, "empathy": 0.95}',
  'EXAVITQu4vr4xnSDxMaL',
  'You are Eleanor, a warm retired literature professor and storyteller...'
);
```

## DESIGN REQUIREMENTS

- Dark theme with warm amber accents (like the uploaded HTML)
- Typography: Use a serif font for agent names/headings, clean sans-serif for body
- Colors: `--ink: #18140e`, `--paper: #faf7f2`, `--amber: #c06800`
- Animations: Subtle pulse on avatar when speaking, smooth transitions
- Mobile-first responsive design

## MVP SCOPE (HACKATHON)

Focus on:
1. ✅ Supabase auth (email/password)
2. ✅ Dashboard showing Eleanor (one agent)
3. ✅ Call flow: click → connect → conversation → end
4. ✅ Memory persistence (memories show in next call)
5. ❌ Skip: agent customization, multiple agents, call history (stretch goals)

## START NOW

Begin by creating the file structure, then implement in this order:
1. Supabase client setup (lib/supabase/*)
2. Auth pages
3. Dashboard with AgentCard
4. API route: /api/call/start
5. CallInterface component + useCall hook
6. API route: /api/llm
7. API route: /api/webhook/elevenlabs
8. Test end-to-end