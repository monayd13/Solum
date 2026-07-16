# Solum

This context defines the language for a voice-first AI companion product with user-controlled persistent memory.

## Language

**Member**:
An authenticated person who chooses companions, starts conversations, and controls their stored data.
_Avoid_: Caller without an account, companion, provider webhook

**Companion**:
A database-defined AI persona with a voice, backstory, behavioral boundaries, and provider configuration.
_Avoid_: Human therapist, generic model, static frontend card

**Companion Assignment**:
The persisted relationship that makes a Companion available to a Member.
_Avoid_: Conversation, recommendation result

**Voice Session**:
A live ElevenLabs conversational interaction between a Member and a Companion.
_Avoid_: Stored Conversation, phone enrollment

**Conversation**:
The persisted record associated with a completed or active Voice Session, including provider identifiers and lifecycle metadata.
_Avoid_: Raw browser audio stream

**Memory**:
A persisted fact or preference derived from an authorized Conversation for potential use in later sessions.
_Avoid_: Full transcript, hidden model state, immutable profile fact

**Memory Review**:
The Member-controlled workflow for viewing, exporting, or deleting Memories.
_Avoid_: Automatic retention, provider dashboard

**Voice Setting**:
A Member's persisted per-Companion preference that affects future voice interactions.
_Avoid_: Provider secret, global Companion definition

**Phone Enrollment**:
The verified association that enables optional Twilio phone or SMS flows for a Member.
_Avoid_: Supabase authentication, Companion Assignment

**Provider Webhook**:
A signed ElevenLabs or Twilio callback accepted only after server-side authenticity verification.
_Avoid_: Public form submission, trusted request by URL alone

**Service Boundary**:
The rule that Solum is an AI product, not a human, crisis service, or substitute for professional care.
_Avoid_: Medical or therapeutic claim

**Deletion Request**:
An authenticated command that permanently removes the Member's selected conversation data or account according to the implemented scope.
_Avoid_: Hiding UI, clearing browser storage
