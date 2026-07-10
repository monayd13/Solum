# Solum

[Live product](https://solum-olive.vercel.app/) · [Safety](https://solum-olive.vercel.app/safety) · [Privacy](https://solum-olive.vercel.app/privacy)

Solum is a voice-first AI companion platform. Authenticated users choose a companion, speak through ElevenLabs Conversational AI, and control the memories that carry into later calls. Supabase owns authentication and persistent data; Twilio supports optional phone and SMS flows; Vercel hosts the Next.js application.

## What is real

- Supabase authentication, profiles, companion assignments, conversations, and memories
- Database-driven public companion catalog—no duplicated catalog in the frontend
- ElevenLabs browser voice sessions with per-companion configuration
- Review, delete, and JSON export controls for saved memories
- Persisted profile and per-companion voice settings
- Twilio enrollment, inbound SMS, and phone personalization endpoints
- Signed ElevenLabs and Twilio webhooks, protected machine-to-machine routes, and row-level security
- Privacy, Terms, Safety, reduced-motion, responsive layouts, and a health endpoint
- No product data in `localStorage` or `sessionStorage`

Solum is an AI product, not a human, crisis service, or substitute for professional care.

## Architecture

```text
Browser ── Supabase Auth ── Next.js route handlers ── Supabase Postgres
   │                                │
   └── ElevenLabs voice session ────┤── signed post-call webhook
                                    └── Twilio SMS / phone webhooks
```

Server-only provider keys never use the `NEXT_PUBLIC_` prefix. Supabase row-level security restricts user-owned records, while service-role access is limited to verified provider and internal enrollment routes.

## Local setup

Requirements: Node.js 20+, npm, a Supabase project, and an ElevenLabs Conversational AI account. Twilio is optional unless phone/SMS flows are enabled.

```bash
git clone https://github.com/taranggoyal70/Solum.git
cd Solum
npm ci
cp .env.example .env.local
```

Fill every variable needed for the flows you enable. Generate independent machine secrets with `openssl rand -hex 32`; do not reuse provider keys.

Apply the database migrations in order with the Supabase CLI:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The health check is available at `/api/health`.

## Required production configuration

| Variable | Visibility | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Browser-safe | Canonical HTTPS origin |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-safe | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe | RLS-protected Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Verified webhook and enrollment operations |
| `ELEVENLABS_API_KEY` | Server only | Agent administration scripts |
| `ELEVENLABS_WEBHOOK_SECRET` | Server only | Post-call signature verification |
| `TWILIO_ACCOUNT_SID` | Server only | Twilio API access |
| `TWILIO_AUTH_TOKEN` | Server only | Twilio API access and request validation |
| `TWILIO_PHONE_NUMBER` | Server only | SMS sender |
| `ENROLLMENT_API_SECRET` | Server only | Internal enrollment endpoint bearer secret |
| `TWILIO_PERSONALIZATION_SECRET` | Server only | ElevenLabs phone-personalization bearer secret |

Configure ElevenLabs post-call events to either `/api/webhook/post-call` or the backward-compatible `/api/webhook/elevenlabs` alias. Configure the personalization integration with `Authorization: Bearer <TWILIO_PERSONALIZATION_SECRET>`.

## Quality gates

```bash
npm run lint
npm run test
npm run build
npm audit
```

The deployment should not proceed unless all four commands pass. After deployment, verify `/api/health`, signup/login redirects, the companion catalog, an authenticated call, post-call memory creation, settings persistence, memory export/deletion, and the provider signature rejection paths.

## Vercel deployment

1. Import this repository into Vercel.
2. Add the production variables above to the project.
3. Set `NEXT_PUBLIC_APP_URL` to the final HTTPS domain.
4. Apply Supabase migrations before promoting the deployment.
5. Update ElevenLabs and Twilio webhook URLs to the production domain.
6. Run the quality gates and the live smoke test checklist.

## Data and safety notes

- Conversation transcripts and extracted memories may contain sensitive personal information.
- Keep service-role and provider credentials server-only and rotate them if exposed.
- Do not disable webhook verification in production.
- Users can export and delete memories in the dashboard; account-level deletion should be handled through the product support channel until a self-serve deletion flow is added.
- Terms and policies in this repository are product copy, not legal advice; have counsel review them before broad commercial launch.

## License

MIT
