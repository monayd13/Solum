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

      const { conversationRecordId, systemPrompt } = await res.json();
      conversationRecordIdRef.current = conversationRecordId;

      // 2. Start ElevenLabs conversation via SDK
      const elAgentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!;
      console.log("[ElevenLabs] Starting session with agentId:", elAgentId);
      console.log("[ElevenLabs] System prompt length:", systemPrompt?.length);
      const conversation = await Conversation.startSession({
        agentId: elAgentId,
        connectionType: "websocket",
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
        onModeChange: ({ mode }) => {
          console.log("[ElevenLabs] Mode:", mode);
          setIsSpeaking(mode === "speaking");
        },
        onError: (err) => {
          console.error("[ElevenLabs] Error:", err);
          setError(typeof err === "string" ? err : "Connection error");
          setStatus("error");
          stopAudioLevelPolling();
        },
        onMessage: (msg) => {
          console.log("[ElevenLabs] Message:", msg);
        },
        onStatusChange: (status) => {
          console.log("[ElevenLabs] Status:", status);
        },
      });

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
