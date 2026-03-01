"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const COMPANIONS = [
  {
    id: "maya",
    emoji: "✨",
    name: "Maya Thompson",
    tagline: "The Ambitious Achiever",
    color: "#c06800",
    colorLight: "#fff3e0",
    avatarUrl: "/companions/maya.png",
    shortBio: "A driven marketing manager who balances ambition with self-awareness. She understands the pressure of high expectations.",
    bestFor: ["Career & ambition", "Goal-setting", "Redefining success"],
  },
  {
    id: "jimmy",
    emoji: "🕊️",
    name: "Jimmy Carter",
    tagline: "The Compassionate Statesman",
    color: "#8b4513",
    colorLight: "#f4e8d0",
    avatarUrl: "/companions/jimmy.png",
    shortBio: "A humble leader who believes in the power of service, diplomacy, and building bridges between people through compassion and understanding.",
    bestFor: ["Service & leadership", "Conflict resolution", "Wisdom & perspective"],
  },
  {
    id: "claire",
    emoji: "📚",
    name: "Claire Donovan",
    tagline: "The Thoughtful Guide",
    color: "#126838",
    colorLight: "#edf9f3",
    avatarUrl: "/companions/claire.png",
    shortBio: "A warm educator who connects past and present through context and pattern recognition. She listens deeply.",
    bestFor: ["Being heard", "Finding perspective", "Life meaning"],
  },
  {
    id: "daniel",
    emoji: "🌱",
    name: "Daniel Mercer",
    tagline: "The Steady Mentor",
    color: "#5018a0",
    colorLight: "#f3eeff",
    avatarUrl: "/companions/daniel.png",
    shortBio: "A calm, systems-thinking scientist who approaches both work and life with patience and accountability. Family-first.",
    bestFor: ["Long-term thinking", "Work pressure", "Calm & grounding"],
  },
];

export function CompanionShowcase() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function playVoiceSample(companionId: string) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (playingId === companionId) {
      setPlayingId(null);
      return;
    }
    const audio = new Audio(`/audio/${companionId}-sample.mp3`);
    audioRef.current = audio;
    setPlayingId(companionId);
    
    // Handle audio loading and playing errors
    audio.addEventListener('error', () => {
      setPlayingId(null);
    });
    
    audio.play().catch(() => {
      setPlayingId(null);
    });
    
    audio.onended = () => setPlayingId(null);
  }

  return (
    <section id="companions" style={{ padding: "80px 40px", background: "var(--bg)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: "56px" }}>
          <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "3px", color: "var(--amber)", marginBottom: "12px" }}>
            Meet the companions
          </p>
          <h2 style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(32px, 4vw, 48px)",
            fontWeight: 300, margin: "0 0 14px", color: "var(--text)",
          }}>
            Four voices.{" "}
            <em style={{ fontStyle: "italic", color: "var(--amber)" }}>Each unforgettable.</em>
          </h2>
          <p style={{ fontSize: "14px", color: "var(--muted)", maxWidth: "500px", margin: "0 auto" }}>
            Every companion has a unique backstory, personality, and way of seeing the world.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {COMPANIONS.map((c, i) => (
            <div
              key={c.id}
              className="reveal"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border2)",
                borderTop: `3px solid ${c.color}`,
                borderRadius: "20px", 
                display: "flex", flexDirection: "column", gap: "0",
                transition: "all 0.3s",
                animationDelay: `${i * 0.08}s`,
                position: "relative",
                overflow: "hidden",
                height: "320px", // Fixed height for consistent layout
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 50px ${c.color}18`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Image covering top half */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "60%",
                overflow: "hidden",
              }}>
                <img
                  src={c.avatarUrl}
                  alt={c.name}
                  style={{
                    width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top",
                  }}
                  onError={(e) => {
                    // Show fallback emoji on error
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                    const parent = (e.currentTarget as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: ${c.colorLight}; font-size: 48px;">${c.emoji}</div>`;
                    }
                  }}
                />
                {/* Fade overlay */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: "40px",
                  background: `linear-gradient(to bottom, transparent 0%, var(--surface) 100%)`,
                }} />
              </div>

              {/* Content in bottom section */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
                padding: "12px 16px 16px",
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                textAlign: "center",
              }}>
                <div>
                  {/* Name */}
                  <h3 style={{
                    fontFamily: "var(--font-cormorant)", fontSize: "18px",
                    fontWeight: 600, color: c.color, margin: "0 0 4px",
                  }}>
                    {c.name}
                  </h3>

                  {/* Best for */}
                  <p style={{ fontSize: "10px", color: "var(--muted)", margin: 0, lineHeight: "1.3" }}>
                    <span style={{ color: c.color, fontWeight: 600 }}>Best for:</span><br/>
                    {c.bestFor.join(" • ")}
                  </p>
                </div>

                {/* Voice preview button */}
                <button
                  onClick={() => playVoiceSample(c.id)}
                  style={{
                    width: "100%", padding: "8px",
                    borderRadius: "8px", border: `1.5px solid ${c.color}`,
                    background: playingId === c.id ? c.color : "transparent",
                    color: playingId === c.id ? "var(--bg)" : c.color,
                    fontSize: "11px", fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    transition: "all 0.2s",
                    fontFamily: "var(--font-dm-sans)",
                    marginTop: "8px",
                  }}
                >
                  {playingId === c.id ? (
                    <>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--bg)", animation: "pulse 1s infinite" }} />
                      Playing...
                    </>
                  ) : (
                    <>▶ Hear their voice</>
                  )}
                </button>
              </div>

              {/* Hover details overlay */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                background: `linear-gradient(to bottom, ${c.color}dd 0%, ${c.color}ee 100%)`,
                backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                display: "flex", flexDirection: "column", justifyContent: "center",
                padding: "20px", opacity: 0, transition: "opacity 0.3s",
                pointerEvents: "none",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.opacity = "1";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.opacity = "0";
              }}
              >
                <div style={{
                  background: "rgba(255,255,255,0.95)", borderRadius: "12px",
                  padding: "16px", color: "var(--text)",
                }}>
                  <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: c.color, margin: "0 0 8px", fontWeight: 600 }}>
                    {c.tagline}
                  </p>
                  <p style={{ fontSize: "12px", lineHeight: "1.6", margin: "0 0 12px" }}>
                    {c.shortBio}
                  </p>
                  <div style={{ fontSize: "11px", opacity: 0.8 }}>
                    <span style={{ fontWeight: 600, color: c.color }}>Perfect for:</span> {c.bestFor.join(", ")}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
