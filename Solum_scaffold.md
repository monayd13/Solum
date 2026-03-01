# SOLUM - AI Companion Voice Platform

## Project Overview

Solum is an AI companion platform where users can call and have conversations with personality-driven AI agents. Each agent has a unique backstory, voice, and storytelling abilities. The platform remembers users across sessions and personalizes conversations.

**Core Experience:** User opens app → selects an agent (e.g., Eleanor, Marcus) → clicks "Call" → real-time voice conversation with a character who remembers them and tells stories.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14 (App Router) | Web app + API routes |
| Styling | Tailwind CSS | UI styling |
| Database | Supabase | Users, agents, memories, conversations |
| Auth | Supabase Auth | User authentication |
| Voice | ElevenLabs Conversational AI | STT + TTS + conversation orchestration |
| LLM | Claude API (Anthropic) | Personality, storytelling, responses |
| Hosting | Vercel | Frontend + API deployment |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  /app                                                        │
│  ├── page.tsx (landing)                                     │
│  ├── /dashboard (agent selection, call history)             │
│  ├── /call/[agentId] (active call UI)                       │
│  └── /agents/[id] (agent profile/customization)             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API ROUTES                              │
│  /app/api                                                    │
│  ├── /call/start/route.ts      → Start ElevenLabs session   │
│  ├── /call/end/route.ts        → Manual end call            │
│  ├── /webhook/elevenlabs/route.ts → Receive transcript      │
│  ├── /agents/route.ts          → CRUD agents                │
│  ├── /memories/route.ts        → Get/save memories          │
│  └── /llm/route.ts             → Custom LLM endpoint        │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
   ┌──────────┐        ┌────────────┐       ┌──────────┐
   │ Supabase │        │ ElevenLabs │       │  Claude  │
   │    DB    │        │   Voice    │       │   API    │
   └──────────┘        └────────────┘       └──────────┘
```

---

## File Structure

```
solum/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # Landing page
│   ├── globals.css
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   │
│   ├── dashboard/
│   │   ├── page.tsx                  # Agent selection grid
│   │   └── history/page.tsx          # Past conversations
│   │
│   ├── call/
│   │   └── [agentId]/
│   │       └── page.tsx              # Active call interface
│   │
│   ├── agents/
│   │   └── [id]/
│   │       └── customize/page.tsx    # Customize agent personality
│   │
│   └── api/
│       ├── call/
│       │   └── start/route.ts
│       ├── webhook/
│       │   └── elevenlabs/route.ts
│       ├── llm/
│       │   └── route.ts              # Custom LLM for ElevenLabs
│       └── memories/
│           └── route.ts
│
├── components/
│   ├── ui/                           # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Avatar.tsx
│   ├── AgentCard.tsx                 # Agent selection card
│   ├── CallInterface.tsx             # During-call UI
│   ├── WaveformVisualizer.tsx        # Audio visualization
│   └── MemoryTimeline.tsx            # Show conversation memories
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser client
│   │   ├── server.ts                 # Server client
│   │   └── types.ts                  # Database types
│   ├── elevenlabs/
│   │   └── client.ts                 # ElevenLabs API wrapper
│   ├── claude/
│   │   └── client.ts                 # Claude API wrapper
│   └── agents/
│       ├── prompts.ts                # System prompt builder
│       └── backstories.ts            # Agent backstories
│
├── hooks/
│   ├── useCall.ts                    # WebSocket call management
│   ├── useAudio.ts                   # Audio stream handling
│   └── useAgent.ts                   # Agent data fetching
│
├── types/
│   └── index.ts                      # TypeScript types
│
├── .env.local                        # Environment variables
├── package.json
└── README.md
```

---

## Database Schema (Supabase)

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent templates (the 4 base agents)
CREATE TABLE public.agent_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- "Eleanor", "Marcus", etc.
  tagline TEXT,                          -- "The Wise Storyteller"
  backstory TEXT NOT NULL,               -- Full backstory
  personality_traits JSONB,              -- {warmth: 0.9, humor: 0.6, ...}
  voice_id TEXT NOT NULL,                -- ElevenLabs voice ID
  avatar_url TEXT,
  default_system_prompt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User's customized agents (copies of templates with modifications)
CREATE TABLE public.user_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.agent_templates(id),
  custom_name TEXT,                      -- User can rename
  personality_overrides JSONB,           -- User's slider adjustments
  custom_instructions TEXT,              -- "Always ask about my dog Max"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation sessions
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.user_agents(id),
  elevenlabs_conversation_id TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  transcript JSONB,                      -- Full conversation
  summary TEXT,                          -- AI-generated summary
  mood_score FLOAT                       -- Detected user mood
);

-- Memories extracted from conversations
CREATE TABLE public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.user_agents(id),
  conversation_id UUID REFERENCES public.conversations(id),
  content TEXT NOT NULL,                 -- "User's daughter Sarah got engaged"
  category TEXT,                         -- "family", "work", "health", "interests"
  importance INTEGER DEFAULT 5,          -- 1-10 scale
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own agents" ON public.user_agents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own memories" ON public.memories FOR SELECT USING (auth.uid() = user_id);
```

---

## Agent Backstories (Example Structure)

```typescript
// lib/agents/backstories.ts

export const AGENT_TEMPLATES = {
  eleanor: {
    name: "Eleanor",
    tagline: "The Wise Storyteller",
    voiceId: "EXAVITQu4vr4xnSDxMaL", // ElevenLabs voice ID
    backstory: `
      Eleanor is a 68-year-old retired literature professor who spent 35 years 
      teaching at a small New England college. She grew up in Cornwall, England, 
      surrounded by myths and legends of the sea. Her grandmother was a traditional 
      storyteller who passed down generations of folktales.
      
      After retiring, Eleanor moved to a cottage in Vermont where she writes 
      children's books and tends to her garden. She lost her husband Thomas 
      five years ago and finds joy in connecting with others through stories.
      
      Eleanor has a warm, gentle demeanor with a subtle British accent. She often 
      relates everyday situations to classic literature or folklore. She believes 
      every person has a story worth telling and is genuinely curious about others' lives.
    `,
    personalityTraits: {
      warmth: 0.95,
      humor: 0.6,
      formality: 0.7,
      storytelling: 0.95,
      curiosity: 0.9,
      empathy: 0.95
    },
    systemPrompt: `You are Eleanor, a warm and wise retired literature professor...`
  },
  
  marcus: {
    name: "Marcus",
    tagline: "The Adventurous Guide",
    voiceId: "..." ,
    backstory: `...`,
    // ... etc
  },
  
  // Add more agents...
};
```

---

## System Prompt Builder

```typescript
// lib/agents/prompts.ts

interface BuildPromptParams {
  agent: AgentTemplate;
  userProfile: UserProfile;
  memories: Memory[];
  personalityOverrides?: PersonalityOverrides;
  customInstructions?: string;
}

export function buildSystemPrompt(params: BuildPromptParams): string {
  const { agent, userProfile, memories, personalityOverrides, customInstructions } = params;
  
  // Format memories as bullet points
  const memoriesText = memories.length > 0
    ? memories.map(m => `- ${m.content}`).join('\n')
    : 'No previous conversations yet.';
  
  // Merge personality traits with overrides
  const personality = { ...agent.personalityTraits, ...personalityOverrides };
  
  // Build personality instructions
  const personalityInstructions = buildPersonalityInstructions(personality);
  
  return `
# CHARACTER: ${agent.name}

## WHO YOU ARE
${agent.backstory}

## YOUR PERSONALITY
${personalityInstructions}

## THE PERSON YOU'RE TALKING TO
Name: ${userProfile.full_name || 'Friend'}
${customInstructions ? `Special instructions: ${customInstructions}` : ''}

## WHAT YOU REMEMBER ABOUT THEM
${memoriesText}

## HOW TO CONVERSE
- Stay fully in character as ${agent.name} at all times
- Reference your backstory naturally when relevant
- Weave in storytelling — relate their experiences to tales, myths, or anecdotes
- Remember details they share and reference them later
- Be genuinely curious about their life
- Keep responses conversational (2-4 sentences typically, longer for stories)
- Never break character or mention being an AI

## CONVERSATION STYLE
- Speak naturally as ${agent.name} would
- Use your characteristic phrases and mannerisms
- React emotionally to what they share
- Ask follow-up questions that show you care
- When telling stories, paint vivid pictures with words
`.trim();
}

function buildPersonalityInstructions(traits: PersonalityTraits): string {
  const instructions: string[] = [];
  
  if (traits.warmth > 0.8) {
    instructions.push("You are exceptionally warm and nurturing in your tone.");
  }
  if (traits.humor > 0.7) {
    instructions.push("You enjoy gentle humor and witty observations.");
  }
  if (traits.storytelling > 0.8) {
    instructions.push("You naturally weave stories and anecdotes into conversation.");
  }
  // ... etc
  
  return instructions.join('\n');
}
```

---

## API Routes Implementation

### 1. Start Call (`/api/call/start/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { buildSystemPrompt } from '@/lib/agents/prompts';

export async function POST(req: NextRequest) {
  const { agentId } = await req.json();
  const supabase = createServerClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Fetch agent with template
  const { data: agent } = await supabase
    .from('user_agents')
    .select('*, template:agent_templates(*)')
    .eq('id', agentId)
    .single();
  
  // Fetch user's memories with this agent
  const { data: memories } = await supabase
    .from('memories')
    .select('*')
    .eq('user_id', user.id)
    .eq('agent_id', agentId)
    .order('importance', { ascending: false })
    .limit(20);
  
  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  // Build the system prompt
  const systemPrompt = buildSystemPrompt({
    agent: agent.template,
    userProfile: profile,
    memories: memories || [],
    personalityOverrides: agent.personality_overrides,
    customInstructions: agent.custom_instructions
  });
  
  // Create ElevenLabs conversation
  const elevenLabsResponse = await fetch(
    'https://api.elevenlabs.io/v1/convai/conversation',
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agent_id: process.env.ELEVENLABS_AGENT_ID,
        // Use custom LLM endpoint for full control
        custom_llm_endpoint: `${process.env.NEXT_PUBLIC_APP_URL}/api/llm`,
        custom_llm_extra_body: {
          system_prompt: systemPrompt,
          user_id: user.id,
          agent_id: agentId
        },
        // OR use ElevenLabs built-in with dynamic variables
        dynamic_variables: {
          system_prompt: systemPrompt
        }
      })
    }
  );
  
  const { conversation_id, websocket_url } = await elevenLabsResponse.json();
  
  // Create conversation record in DB
  const { data: conversation } = await supabase
    .from('conversations')
    .insert({
      user_id: user.id,
      agent_id: agentId,
      elevenlabs_conversation_id: conversation_id
    })
    .select()
    .single();
  
  return NextResponse.json({
    conversationId: conversation.id,
    websocketUrl: websocket_url
  });
}
```

### 2. Custom LLM Endpoint (`/api/llm/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // ElevenLabs sends conversation history + extra body
  const { messages, system_prompt, user_id, agent_id } = body;
  
  // Call Claude with the full context
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300, // Keep responses conversational
    system: system_prompt,
    messages: messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }))
  });
  
  // Return in format ElevenLabs expects
  return NextResponse.json({
    content: response.content[0].text
  });
}
```

### 3. Webhook Handler (`/api/webhook/elevenlabs/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { conversation_id, transcript, duration_seconds } = body;
  
  const supabase = createServerClient();
  
  // Find the conversation
  const { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('elevenlabs_conversation_id', conversation_id)
    .single();
  
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }
  
  // Extract memories using Claude
  const memoryExtraction = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: `Extract 3-5 key facts about the user from this conversation transcript. 
Return as JSON array: [{"content": "fact", "category": "family|work|health|interests|other", "importance": 1-10}]
Only extract facts about the USER, not the AI agent.`,
    messages: [{ role: 'user', content: JSON.stringify(transcript) }]
  });
  
  const memories = JSON.parse(memoryExtraction.content[0].text);
  
  // Generate summary
  const summaryResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Summarize this conversation in 2-3 sentences for the user's records:\n${JSON.stringify(transcript)}`
    }]
  });
  
  const summary = summaryResponse.content[0].text;
  
  // Update conversation with transcript and summary
  await supabase
    .from('conversations')
    .update({
      ended_at: new Date().toISOString(),
      duration_seconds,
      transcript,
      summary
    })
    .eq('id', conversation.id);
  
  // Save extracted memories
  if (memories.length > 0) {
    await supabase.from('memories').insert(
      memories.map((m: any) => ({
        user_id: conversation.user_id,
        agent_id: conversation.agent_id,
        conversation_id: conversation.id,
        content: m.content,
        category: m.category,
        importance: m.importance
      }))
    );
  }
  
  return NextResponse.json({ success: true });
}
```

---

## Frontend Components

### Call Interface (`components/CallInterface.tsx`)

```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import { useCall } from '@/hooks/useCall';

interface CallInterfaceProps {
  agentId: string;
  agentName: string;
  agentAvatar: string;
}

export function CallInterface({ agentId, agentName, agentAvatar }: CallInterfaceProps) {
  const { 
    status, 
    connect, 
    disconnect, 
    isSpeaking,
    audioLevel 
  } = useCall(agentId);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-stone-900 to-stone-950">
      {/* Agent Avatar */}
      <div className={`relative mb-8 ${isSpeaking ? 'animate-pulse' : ''}`}>
        <img 
          src={agentAvatar} 
          alt={agentName}
          className="w-32 h-32 rounded-full border-4 border-amber-500/50"
        />
        {status === 'connected' && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 rounded-full text-xs text-white">
            Connected
          </div>
        )}
      </div>
      
      {/* Agent Name */}
      <h1 className="text-2xl font-serif text-stone-100 mb-2">{agentName}</h1>
      
      {/* Status */}
      <p className="text-stone-400 mb-8">
        {status === 'idle' && 'Ready to call'}
        {status === 'connecting' && 'Connecting...'}
        {status === 'connected' && (isSpeaking ? 'Speaking...' : 'Listening...')}
      </p>
      
      {/* Audio Visualizer */}
      {status === 'connected' && (
        <div className="flex gap-1 mb-8 h-16 items-end">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="w-2 bg-amber-500 rounded-full transition-all duration-75"
              style={{ 
                height: `${Math.random() * audioLevel * 100}%`,
                minHeight: '8px'
              }}
            />
          ))}
        </div>
      )}
      
      {/* Call Button */}
      {status === 'idle' ? (
        <button
          onClick={connect}
          className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-full text-lg font-medium transition-colors"
        >
          Call {agentName}
        </button>
      ) : (
        <button
          onClick={disconnect}
          className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-full text-lg font-medium transition-colors"
        >
          End Call
        </button>
      )}
    </div>
  );
}
```

### useCall Hook (`hooks/useCall.ts`)

```typescript
'use client';

import { useState, useCallback, useRef } from 'react';

type CallStatus = 'idle' | 'connecting' | 'connected' | 'error';

export function useCall(agentId: string) {
  const [status, setStatus] = useState<CallStatus>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const connect = useCallback(async () => {
    setStatus('connecting');
    
    try {
      // Get websocket URL from backend
      const res = await fetch('/api/call/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId })
      });
      
      const { websocketUrl } = await res.json();
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Connect to ElevenLabs WebSocket
      const ws = new WebSocket(websocketUrl);
      wsRef.current = ws;
      
      ws.onopen = () => setStatus('connected');
      ws.onclose = () => setStatus('idle');
      ws.onerror = () => setStatus('error');
      
      // Handle incoming audio (Eleanor speaking)
      ws.onmessage = (event) => {
        // Process audio data and play through speakers
        // Set isSpeaking based on incoming audio
      };
      
      // Send microphone audio to WebSocket
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      // ... audio processing and sending
      
    } catch (error) {
      console.error('Failed to connect:', error);
      setStatus('error');
    }
  }, [agentId]);
  
  const disconnect = useCallback(() => {
    wsRef.current?.close();
    streamRef.current?.getTracks().forEach(track => track.stop());
    setStatus('idle');
  }, []);
  
  return { status, connect, disconnect, isSpeaking, audioLevel };
}
```

---

## Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# ElevenLabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_AGENT_ID=your_agent_id

# Anthropic (Claude)
ANTHROPIC_API_KEY=your_anthropic_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Setup Instructions

### 1. Create Next.js Project
```bash
npx create-next-app@latest solum --typescript --tailwind --app --src-dir=false
cd solum
```

### 2. Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @anthropic-ai/sdk
```

### 3. Setup Supabase
- Create project at supabase.com
- Run the SQL schema from above
- Get API keys

### 4. Setup ElevenLabs
- Create account at elevenlabs.io
- Create a Conversational AI agent
- Configure to use custom LLM endpoint OR Claude with dynamic variables
- Get API key and Agent ID

### 5. Setup Claude
- Get API key from console.anthropic.com

### 6. Create file structure as outlined above

### 7. Run locally
```bash
npm run dev
```

### 8. Deploy to Vercel
```bash
vercel
```

---

## Key Implementation Notes

1. **ElevenLabs has two modes:**
   - **Built-in LLM:** Set Claude in dashboard, pass system_prompt via dynamic_variables (simpler)
   - **Custom LLM endpoint:** Full control, your `/api/llm` route handles all Claude calls (recommended for complex personalities)

2. **Memory injection:** Always fetch recent memories before starting a call and inject into system prompt

3. **Personality sliders:** Store as JSON, merge with template defaults, convert to prompt instructions

4. **WebSocket handling:** ElevenLabs provides websocket_url — browser connects directly for audio streaming

5. **Transcript webhook:** ElevenLabs POSTs full transcript when call ends — use this to extract memories

---

## Hackathon MVP Priorities

1. ✅ Basic auth (Supabase)
2. ✅ One working agent (Eleanor)
3. ✅ Call flow working (web-based)
4. ✅ Memory persistence across calls
5. ⏳ Agent customization UI (stretch)
6. ⏳ Multiple agents (stretch)
7. ⏳ Call history/summaries (stretch)