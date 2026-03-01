"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Conversation } from "@elevenlabs/client";
import { CallStatus } from "@/types";

export function useCall(agentId: string) {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const conversationRef = useRef<Conversation | null>(null);
  const conversationRecordIdRef = useRef<string | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Poll audio levels from SDK while connected
  const startAudioLevelPolling = useCallback((conv: Conversation) => {
    const tick = async () => {
      try {
        const output = await conv.getOutputVolume();
        const input = await conv.getInputVolume();
        setAudioLevel(Math.max(output, input));
      } catch {
        // conversation may have ended
      }
      animFrameRef.current = requestAnimationFrame(() => tick());
    };
    tick();
  }, []);

  const stopAudioLevelPolling = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const connect = useCallback(async () => {
    setStatus("connecting");
    setError(null);

    try {
      // 1. Get system prompt + conversation record from backend
      const res = await fetch("/api/call/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start call");
      }

      const { conversationRecordId, elevenlabsAgentId, dynamicVariables, voiceSettings } = await res.json();
      conversationRecordIdRef.current = conversationRecordId;

      // 2. Start ElevenLabs conversation via SDK
      const elAgentId = elevenlabsAgentId || process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!;
      console.log("[ElevenLabs] Starting session with agentId:", elAgentId);
      console.log("[ElevenLabs] Dynamic variables (keys):", Object.keys(dynamicVariables || {}));
      console.log("[ElevenLabs] Dynamic variables (full):", JSON.stringify(dynamicVariables, null, 2));

      // Request microphone permission before starting session
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("[ElevenLabs] Microphone permission granted");
      } catch (micErr) {
        console.error("[ElevenLabs] Microphone permission denied:", micErr);
        throw new Error("Microphone access is required. Please allow microphone permission and try again.");
      }

      // Build TTS overrides from per-user voice settings (ElevenLabs API uses snake_case)
      // Skip defaults (speed=1, stability=0.5, similarityBoost=0.75) — they duplicate agent config
      const isDefault = !voiceSettings ||
        (voiceSettings.speed === 1 && voiceSettings.stability === 0.5 && voiceSettings.similarityBoost === 0.75 && !voiceSettings.language);

      let overrides: Record<string, unknown> | undefined;
      if (!isDefault && voiceSettings) {
        const ttsOverrides: Record<string, number | string> = {};
        if (voiceSettings.speed != null && voiceSettings.speed !== 1) ttsOverrides.speed = voiceSettings.speed;
        if (voiceSettings.stability != null && voiceSettings.stability !== 0.5) ttsOverrides.stability = voiceSettings.stability;
        if (voiceSettings.similarityBoost != null && voiceSettings.similarityBoost !== 0.75) ttsOverrides.similarity_boost = voiceSettings.similarityBoost;

        const agentOverrides: Record<string, string> = {};
        if (voiceSettings.language) agentOverrides.language = voiceSettings.language;

        const hasOverrides = Object.keys(ttsOverrides).length > 0 || Object.keys(agentOverrides).length > 0;
        if (hasOverrides) {
          overrides = {
            ...(Object.keys(ttsOverrides).length > 0 ? { tts: ttsOverrides } : {}),
            ...(Object.keys(agentOverrides).length > 0 ? { agent: agentOverrides } : {}),
          };
        }
      }

      console.log("[ElevenLabs] Overrides:", overrides ?? "none (using agent defaults)");

      const sessionConfig: Record<string, unknown> = {
        agentId: elAgentId,
        dynamicVariables: dynamicVariables || undefined,
        onConnect: () => {
          console.log("[ElevenLabs] Connected");
          setStatus("connected");
        },
        onDisconnect: () => {
          console.log("[ElevenLabs] Disconnected");
          setStatus("idle");
          setIsSpeaking(false);
          stopAudioLevelPolling();
          conversationRef.current = null;
        },
        onModeChange: ({ mode }: { mode: string }) => {
          console.log("[ElevenLabs] Mode:", mode);
          setIsSpeaking(mode === "speaking");
        },
        onError: (err: unknown) => {
          console.error("[ElevenLabs] Error:", err);
          setError(typeof err === "string" ? err : "Connection error");
          setStatus("error");
          stopAudioLevelPolling();
        },
        onMessage: (msg: unknown) => {
          console.log("[ElevenLabs] Message:", msg);
        },
        onStatusChange: (status: unknown) => {
          console.log("[ElevenLabs] Status:", status);
        },
      };
      if (overrides) {
        sessionConfig.overrides = overrides;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const conversation = await Conversation.startSession(sessionConfig as any);

      conversationRef.current = conversation;
      startAudioLevelPolling(conversation);

      // 3. Link ElevenLabs conversation ID to Supabase record
      const elConversationId = conversation.getId();
      setConversationId(elConversationId);

      if (conversationRecordIdRef.current && elConversationId) {
        fetch("/api/call/link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationRecordId: conversationRecordIdRef.current,
            elevenlabsConversationId: elConversationId,
          }),
        }).catch(console.error);
      }
    } catch (err) {
      console.error("Call error:", err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to connect");
      stopAudioLevelPolling();
    }
  }, [agentId, startAudioLevelPolling, stopAudioLevelPolling]);

  const disconnect = useCallback(async () => {
    try {
      await conversationRef.current?.endSession();
    } catch {
      // already disconnected
    }
    conversationRef.current = null;
    stopAudioLevelPolling();
    setStatus("idle");
    setIsSpeaking(false);
  }, [stopAudioLevelPolling]);

  const toggleMute = useCallback(() => {
    if (conversationRef.current) {
      const newMuted = !isMuted;
      conversationRef.current.setMicMuted(newMuted);
      setIsMuted(newMuted);
    }
  }, [isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      conversationRef.current?.endSession().catch(() => {});
      stopAudioLevelPolling();
    };
  }, [stopAudioLevelPolling]);

  return {
    status,
    connect,
    disconnect,
    isSpeaking,
    audioLevel,
    conversationId,
    error,
    isMuted,
    toggleMute,
  };
}
