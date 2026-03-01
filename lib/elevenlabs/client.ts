const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

export async function getConversation(conversationId: string) {
  const response = await fetch(
    `${ELEVENLABS_API_BASE}/convai/conversations/${conversationId}`,
    {
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status}`);
  }

  return response.json();
}
