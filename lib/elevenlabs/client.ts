const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

export async function startConversation(params: {
  agentId: string;
  systemPrompt: string;
  userId: string;
  userAgentId: string;
}): Promise<{ conversation_id: string; websocket_url: string }> {
  const response = await fetch(
    `${ELEVENLABS_API_BASE}/convai/conversations`,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: params.agentId,
        dynamic_variables: {
          system_prompt: params.systemPrompt,
          user_id: params.userId,
          agent_id: params.userAgentId,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} ${error}`);
  }

  return response.json();
}

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
