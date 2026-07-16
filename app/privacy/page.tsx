import { LegalPage } from "@/components/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Privacy" title="Your conversations deserve clear boundaries.">
      <section><h2>What Solum collects</h2><p>We collect account details you provide, companion choices, voice settings, call metadata, conversation transcripts and summaries, and memories created from conversations. We also receive operational diagnostics needed to keep calls reliable and secure.</p></section>
      <section><h2>How information is used</h2><p>Information is used to authenticate you, provide and personalize conversations, maintain memory between calls, prevent abuse, and operate the service. Solum does not use localStorage or sessionStorage for product data.</p></section>
      <section><h2>Service providers</h2><p>Supabase provides authentication and database infrastructure. ElevenLabs provides conversational voice processing. Twilio provides optional telephone and SMS delivery. These providers process information only as needed to deliver their part of the service.</p></section>
      <section><h2>Your controls</h2><p>You can review, export, and permanently delete saved memories from your account. Settings also provides self-service permanent account deletion, including the profile, companion assignments, conversations, transcripts, and memories.</p></section>
      <section><h2>Retention and security</h2><p>Conversation data is retained while your account is active or until you delete it, subject to limited security, backup, and legal retention needs. Access is restricted through account authentication, database row-level security, and signed provider webhooks.</p></section>
      <section><h2>Important limits</h2><p>No online service can guarantee absolute security. Do not share emergency, financial-account, government-ID, or other information that is not needed for a conversation.</p></section>
    </LegalPage>
  );
}
