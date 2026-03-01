"use client";

import { useState } from "react";

const MOODS = [
  { emoji: "😊", label: "Happy",      value: "happy" },
  { emoji: "😌", label: "Calm",       value: "calm" },
  { emoji: "😎", label: "Confident",   value: "confident" },
  { emoji: "🤗", label: "Excited",    value: "excited" },
  { emoji: "😐", label: "Okay",       value: "okay" },
  { emoji: "😔", label: "Sad",        value: "sad" },
  { emoji: "😰", label: "Anxious",    value: "anxious" },
  { emoji: "🌻", label: "Grateful",   value: "grateful" },
];

const NEEDS = [
  { label: "Someone to listen", value: "someone_to_listen", icon: "👂" },
  { label: "Motivation",        value: "motivation",        icon: "💪" },
  { label: "A story",           value: "story",             icon: "📖" },
  { label: "Advice",            value: "advice",            icon: "💡" },
  { label: "Just chat",         value: "just_chat",         icon: "💬" },
];

const RECOMMENDATIONS: Record<string, Record<string, string>> = {
  someone_to_listen: {
    happy: "Claire is wonderful at making you feel truly heard. She listens with her whole self — no judgment, ever.",
    calm: "Claire is wonderful at making you feel truly heard. She listens with her whole self — no judgment, ever.",
    confident: "Claire is wonderful at making you feel truly heard. She listens with her whole self — no judgment, ever.",
    excited: "Claire is wonderful at making you feel truly heard. She listens with her whole self — no judgment, ever.",
    okay: "Claire is wonderful at making you feel truly heard. She listens with her whole self — no judgment, ever.",
    sad: "Claire is wonderful at making you feel truly heard. She listens with her whole self — no judgment, ever.",
    anxious: "Claire is wonderful at making you feel truly heard. She listens with her whole self — no judgment, ever.",
    grateful: "Claire is wonderful at making you feel truly heard. She listens with her whole self — no judgment, ever.",
  },
  motivation: {
    happy: "Maya gets it — she lives ambition every day and can help you channel that energy into something that lasts.",
    calm: "Jimmy offers steady, grounded encouragement. He won't push too hard, but he'll remind you of what you're building.",
    confident: "Maya gets it — she lives ambition every day and can help you channel that energy into something that lasts.",
    excited: "Maya gets it — she lives ambition every day and can help you channel that energy into something that lasts.",
    okay: "Jimmy offers steady, grounded encouragement. He won't push too hard, but he'll remind you of what you're building.",
    sad: "Jimmy offers grounded encouragement without pressure. He knows how to keep moving when things feel heavy.",
    anxious: "Jimmy offers grounded encouragement without pressure. He knows how to keep moving when things feel heavy.",
    grateful: "Maya gets it — she lives ambition every day and can help you channel that energy into something that lasts.",
  },
  story: {
    happy: "Jimmy has wonderful stories from his presidency and humanitarian work. He'll take you somewhere inspiring.",
    calm: "Jimmy has wonderful stories from his presidency and humanitarian work. He'll take you somewhere inspiring.",
    confident: "Jimmy has wonderful stories from his presidency and humanitarian work. He'll take you somewhere inspiring.",
    excited: "Jimmy has wonderful stories from his presidency and humanitarian work. He'll take you somewhere inspiring.",
    okay: "Jimmy has wonderful stories from his presidency and humanitarian work. He'll take you somewhere inspiring.",
    sad: "Jimmy has wonderful stories from his presidency and humanitarian work. He'll take you somewhere inspiring.",
    anxious: "Jimmy has wonderful stories from his presidency and humanitarian work. He'll take you somewhere inspiring.",
    grateful: "Jimmy has wonderful stories from his presidency and humanitarian work. He'll take you somewhere inspiring.",
  },
  advice: {
    happy: "Daniel gives practical, grounded perspective from real experience. He won't sugarcoat, but he's always constructive.",
    calm: "Daniel gives practical, grounded perspective from real experience. He won't sugarcoat, but he's always constructive.",
    confident: "Maya gives practical, grounded perspective from real experience. She's always constructive.",
    excited: "Maya gives practical, grounded perspective from real experience. She's always constructive.",
    okay: "Daniel gives practical, grounded perspective from real experience. He won't sugarcoat, but he's always constructive.",
    sad: "Claire can help you see the bigger pattern. She's gentle, contextual, and won't overwhelm you.",
    anxious: "Claire can help you see the bigger pattern. She's gentle, contextual, and won't overwhelm you.",
    grateful: "Daniel gives practical, grounded perspective from real experience. He won't sugarcoat, but he's always constructive.",
  },
  just_chat: {
    happy: "Maya's energy is contagious when things are going well — she'd love to hear what's exciting you.",
    calm: "Jimmy or Claire would both be great. Who feels right today?",
    confident: "Maya's energy is contagious when things are going well — she'd love to hear what's exciting you.",
    excited: "Maya's energy is contagious when things are going well — she'd love to hear what's exciting you.",
    okay: "Jimmy or Claire would both be great. Who feels right today?",
    sad: "Daniel's calm presence can be exactly what you need. No pressure, just a steady voice.",
    anxious: "Daniel's calm presence can be exactly what you need. No pressure, just a steady voice.",
    grateful: "Maya's energy is contagious when things are going well — she'd love to hear what's exciting you.",
  },
};

interface MoodCheckInProps {
  onNeedSelected?: (need: string) => void;
}

export function MoodCheckIn({ onNeedSelected }: MoodCheckInProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);

  function handleNeed(need: string) {
    setSelectedNeed(need);
    onNeedSelected?.(need);
  }

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border2)",
      borderRadius: "20px", padding: "28px",
    }}>
      <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--amber)", margin: "0 0 20px" }}>
        Quick check-in
      </p>

      {/* Mood row */}
      <div style={{ marginBottom: "24px" }}>
        <p style={{ fontSize: "13px", color: "var(--muted)", margin: "0 0 12px" }}>
          How are you feeling today?
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setSelectedMood(mood.value)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                padding: "8px 12px", borderRadius: "10px",
                background: selectedMood === mood.value ? "rgba(212,136,10,0.12)" : "var(--surface2)",
                border: `1.5px solid ${selectedMood === mood.value ? "var(--amber)" : "var(--border2)"}`,
                cursor: "pointer", transition: "all 0.15s",
                fontFamily: "var(--font-dm-sans)",
                minWidth: "60px",
              }}
            >
              <span style={{ fontSize: "20px" }}>{mood.emoji}</span>
              <span style={{ fontSize: "10px", color: selectedMood === mood.value ? "var(--amber)" : "var(--muted)", fontWeight: 500 }}>
                {mood.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Need chips */}
      <div style={{ marginBottom: selectedMood && selectedNeed ? "20px" : "0" }}>
        <p style={{ fontSize: "13px", color: "var(--muted)", margin: "0 0 12px" }}>
          What do you need right now?
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {NEEDS.map((need) => (
            <button
              key={need.value}
              onClick={() => handleNeed(need.value)}
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "9px 16px", borderRadius: "99px",
                background: selectedNeed === need.value ? "var(--amber)" : "var(--surface2)",
                border: `1.5px solid ${selectedNeed === need.value ? "var(--amber)" : "var(--border2)"}`,
                color: selectedNeed === need.value ? "var(--bg)" : "var(--muted)",
                fontSize: "13px", cursor: "pointer", transition: "all 0.15s",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              <span>{need.icon}</span>
              <span>{need.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      {selectedMood && selectedNeed && (
        <div style={{
          padding: "16px 18px",
          background: "rgba(212,136,10,0.06)",
          border: "1px solid rgba(212,136,10,0.2)",
          borderRadius: "12px",
        }}>
          <p style={{ fontSize: "12px", color: "var(--muted)", margin: "0 0 6px" }}>
            Based on how you&apos;re feeling:
          </p>
          <p style={{ fontSize: "14px", color: "var(--text)", margin: 0, lineHeight: "1.6" }}>
            {RECOMMENDATIONS[selectedNeed]?.[selectedMood ?? "okay"]}
          </p>
        </div>
      )}
    </div>
  );
}
