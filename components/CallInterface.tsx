"use client";

import { useCall } from "@/hooks/useCall";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { UserAgent } from "@/types";
import { Phone, PhoneOff, ArrowLeft, Mic, MicOff } from "lucide-react";
import Link from "next/link";

interface CallInterfaceProps {
  agent: UserAgent;
}

export function CallInterface({ agent }: CallInterfaceProps) {
  const { status, connect, disconnect, isSpeaking, audioLevel, error, isMuted, toggleMute } =
    useCall(agent.id);

  const template = agent.template;
  const name = agent.custom_name || template?.name || "Unknown";
  const emoji = template?.avatar_emoji || "🤖";
  const accentColor = template?.accent_color || "var(--amber)";
  const tagline = template?.tagline || "";

  const statusLabel = {
    idle: "Ready to call",
    connecting: "Connecting…",
    connected: isSpeaking ? `${name} is speaking…` : "Listening…",
    error: error || "Something went wrong",
  }[status];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${accentColor}10 0%, transparent 65%)`,
        }}
      />

      {/* Back link */}
      <Link
        href="/dashboard"
        className="absolute top-6 left-6 flex items-center gap-2 text-xs uppercase tracking-widest transition-colors duration-200"
        style={{ color: "var(--muted)" }}
      >
        <ArrowLeft size={14} />
        Dashboard
      </Link>

      <div className="flex flex-col items-center gap-8 z-10 px-4 w-full max-w-sm">
        {/* Avatar with ripple */}
        <div className="relative flex items-center justify-center">
          {status === "connected" && (
            <>
              <div
                className="absolute rounded-full"
                style={{
                  inset: "-16px",
                  border: `1px solid ${accentColor}30`,
                  animation: "ripple 2.5s infinite",
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  inset: "-32px",
                  border: `1px solid ${accentColor}20`,
                  animation: "ripple 2.5s 0.6s infinite",
                }}
              />
            </>
          )}
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center text-5xl transition-transform duration-300"
            style={{
              background: `${accentColor}15`,
              border: `3px solid ${accentColor}${status === "connected" ? "80" : "30"}`,
              transform: isSpeaking ? "scale(1.06)" : "scale(1)",
              boxShadow:
                status === "connected"
                  ? `0 0 40px ${accentColor}25`
                  : "none",
            }}
          >
            {emoji}
          </div>
        </div>

        {/* Name + status */}
        <div className="text-center">
          <h1
            className="text-3xl font-light mb-1"
            style={{ fontFamily: "var(--font-cormorant)", color: accentColor }}
          >
            {name}
          </h1>
          <p
            className="text-xs uppercase tracking-widest mb-3"
            style={{ color: "var(--muted)" }}
          >
            {tagline}
          </p>

          <div className="flex items-center justify-center gap-2">
            {status === "connected" && (
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: "#5a9e6a",
                  animation: "pulse 2s infinite",
                }}
              />
            )}
            <span
              className="text-sm"
              style={{
                color:
                  status === "error"
                    ? "var(--rose)"
                    : status === "connected"
                    ? "var(--text)"
                    : "var(--muted)",
              }}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Waveform */}
        <div className="h-12 flex items-center justify-center">
          <WaveformVisualizer
            audioLevel={audioLevel}
            isActive={status === "connected"}
            color={accentColor}
            bars={24}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {status === "connected" && (
            <button
              onClick={toggleMute}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: isMuted ? "var(--rose-l)" : "var(--surface2)",
                border: `1px solid ${isMuted ? "var(--rose-m)" : "var(--border2)"}`,
                color: isMuted ? "var(--rose)" : "var(--muted)",
              }}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}

          {status === "idle" || status === "error" ? (
            <button
              onClick={connect}
              className="flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm transition-all duration-200"
              style={{
                background: accentColor,
                color: "var(--bg)",
                boxShadow: `0 8px 30px ${accentColor}40`,
              }}
            >
              <Phone size={16} />
              Call {name}
            </button>
          ) : status === "connecting" ? (
            <button
              disabled
              className="flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm opacity-60 cursor-not-allowed"
              style={{ background: accentColor, color: "var(--bg)" }}
            >
              <span
                className="w-4 h-4 rounded-full border-2 border-current border-t-transparent"
                style={{ animation: "spin 0.8s linear infinite" }}
              />
              Connecting…
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm transition-all duration-200"
              style={{
                background: "rgba(180,60,60,0.15)",
                border: "1px solid rgba(180,60,60,0.4)",
                color: "#e87878",
              }}
            >
              <PhoneOff size={16} />
              End Call
            </button>
          )}
        </div>

        {/* Error message */}
        {status === "error" && error && (
          <p
            className="text-xs text-center px-4 py-2 rounded-xl"
            style={{
              background: "var(--rose-l)",
              border: "1px solid var(--rose-m)",
              color: "var(--rose)",
            }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
