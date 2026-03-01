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
    shortBio: "A driven marketing manager who balances ambition with self-awareness. She understands the pressure of high expectations.",
    bestFor: ["Career & ambition", "Goal-setting", "Redefining success"],
  },
  {
    id: "mateo",
    emoji: "�",
    name: "Mateo Rivera",
    tagline: "The Grounded Builder",
    color: "#0a6878",
    colorLight: "#e8f8fc",
    shortBio: "A bilingual carpenter methodically building toward his dream of owning a custom furniture workshop. Grounded, patient, proud.",
    bestFor: ["Practical advice", "Patience", "Building dreams"],
  },
  {
    id: "claire",
    emoji: "📚",
    name: "Claire Donovan",
    tagline: "The Thoughtful Guide",
    color: "#126838",
    colorLight: "#edf9f3",
    shortBio: "A warm educator who connects past and present through context and pattern recognition. She listens deeply.",
    bestFor: ["Being heard", "Finding perspective", "Life meaning"],
  },
  {
    id: "daniel",
    emoji: "�",
    name: "Daniel Mercer",
    tagline: "The Steady Mentor",
    color: "#5018a0",
    colorLight: "#f3eeff",
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
    audio.play().catch(() => {});
    setPlayingId(companionId);
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
                borderRadius: "20px", padding: "28px 20px 20px",
                display: "flex", flexDirection: "column", gap: "0",
                transition: "transform 0.3s, box-shadow 0.3s",
                animationDelay: `${i * 0.08}s`,
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
              {/* Avatar */}
              <div style={{
                width: "68px", height: "68px", borderRadius: "50%",
                background: c.colorLight,
                border: `2px solid ${c.color}35`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "30px", margin: "0 auto 16px",
              }}>
                {c.emoji}
              </div>

              {/* Name + tagline */}
              <div style={{ textAlign: "center", marginBottom: "12px" }}>
                <h3 style={{
                  fontFamily: "var(--font-cormorant)", fontSize: "22px",
                  fontWeight: 600, color: c.color, margin: "0 0 4px",
                }}>
                  {c.name}
                </h3>
                <p style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", margin: 0 }}>
                  {c.tagline}
                </p>
              </div>

              {/* Bio */}
              <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: "1.7", textAlign: "center", margin: "0 0 12px" }}>
                {c.shortBio}
              </p>

              {/* Best for */}
              <div style={{ marginBottom: "16px", textAlign: "center" }}>
                <p style={{ fontSize: "10px", color: "var(--muted)", marginBottom: "6px" }}>
                  <span style={{ color: c.color }}>Best for:</span>{" "}
                  {c.bestFor.join(" · ")}
                </p>
              </div>

              {/* Voice preview button */}
              <button
                onClick={() => playVoiceSample(c.id)}
                style={{
                  width: "100%", padding: "10px",
                  borderRadius: "10px", border: `1.5px solid ${c.color}`,
                  background: playingId === c.id ? c.color : "transparent",
                  color: playingId === c.id ? "var(--bg)" : c.color,
                  fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                  transition: "all 0.2s",
                  fontFamily: "var(--font-dm-sans)",
                  marginBottom: "8px",
                }}
              >
                {playingId === c.id ? (
                  <>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--bg)", animation: "pulse 1s infinite" }} />
                    Playing...
                  </>
                ) : (
                  <>▶ Hear their voice</>
                )}
              </button>

              {/* CTA */}
              <Link href="/signup" style={{
                width: "100%", padding: "10px",
                borderRadius: "10px", background: `${c.color}15`,
                color: c.color, fontSize: "12px", fontWeight: 600,
                textDecoration: "none", textAlign: "center",
                display: "block", boxSizing: "border-box",
              }}>
                Add {c.name} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
