"use client";

import { useState, useCallback, useRef } from "react";
import { CallStatus } from "@/types";

export function useCall(agentId: string) {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const stopAudioLevel = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const startAudioLevelMonitor = useCallback((stream: MediaStream) => {
    try {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      audioContextRef.current = ctx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(avg / 128);
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // AudioContext not available
    }
  }, []);

  const connect = useCallback(async () => {
    setStatus("connecting");
    setError(null);

    try {
      const res = await fetch("/api/call/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start call");
      }

      const { conversationId: convId, websocketUrl } = await res.json();
      setConversationId(convId);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startAudioLevelMonitor(stream);

      const ws = new WebSocket(websocketUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
      };

      ws.onclose = () => {
        setStatus("idle");
        setIsSpeaking(false);
        stopAudioLevel();
      };

      ws.onerror = () => {
        setStatus("error");
        setError("Connection lost. Please try again.");
        stopAudioLevel();
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "audio") {
            setIsSpeaking(true);
            setTimeout(() => setIsSpeaking(false), 500);
          }
        } catch {
          // binary audio data — agent is speaking
          setIsSpeaking(true);
          setTimeout(() => setIsSpeaking(false), 500);
        }
      };

      // Stream microphone audio to ElevenLabs WebSocket
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorder.ondataavailable = (e) => {
        if (ws.readyState === WebSocket.OPEN && e.data.size > 0) {
          ws.send(e.data);
        }
      };
      mediaRecorder.start(250);
    } catch (err) {
      console.error("Call error:", err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to connect");
      stopAudioLevel();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    }
  }, [agentId, startAudioLevelMonitor, stopAudioLevel]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();
    stopAudioLevel();
    setStatus("idle");
    setIsSpeaking(false);
  }, [stopAudioLevel]);

  return {
    status,
    connect,
    disconnect,
    isSpeaking,
    audioLevel,
    conversationId,
    error,
  };
}
