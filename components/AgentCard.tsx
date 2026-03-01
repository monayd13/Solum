"use client";

import { UserAgent } from "@/types";
import { Phone } from "lucide-react";
import Link from "next/link";

interface AgentCardProps {
  agent: UserAgent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const template = agent.template;
  const name = agent.custom_name || template?.name || "Unknown";
  const tagline = template?.tagline || "";
  const emoji = template?.avatar_emoji || "🤖";
  const accentColor = template?.accent_color || "var(--amber)";

  return (
    <div
      className="relative rounded-2xl overflow-hidden transition-all duration-300 group cursor-pointer"
      style={{
        background: "var(--surface)",
        border: `1px solid var(--border2)`,
        borderTop: `3px solid ${accentColor}`,
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top, ${accentColor}08 0%, transparent 70%)`,
        }}
      />

      <div className="p-6 flex flex-col items-center text-center gap-4">
        {/* Avatar */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-transform duration-300 group-hover:scale-110"
          style={{
            background: `${accentColor}15`,
            border: `2px solid ${accentColor}40`,
          }}
        >
          {emoji}
        </div>

        {/* Name + tagline */}
        <div>
          <h3
            className="text-xl font-semibold mb-1"
            style={{
              fontFamily: "var(--font-cormorant)",
              color: accentColor,
            }}
          >
            {name}
          </h3>
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: "var(--muted)" }}
          >
            {tagline}
          </p>
        </div>

        {/* Personality preview */}
        {template?.personality_traits && (
          <div className="w-full grid grid-cols-3 gap-2">
            {Object.entries(template.personality_traits)
              .slice(0, 3)
              .map(([trait, value]) => (
                <div key={trait} className="flex flex-col gap-1">
                  <div
                    className="h-1 rounded-full overflow-hidden"
                    style={{ background: "var(--border2)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(value as number) * 100}%`,
                        background: accentColor,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <span
                    className="text-center capitalize"
                    style={{ fontSize: "9px", color: "var(--muted)", letterSpacing: "0.5px" }}
                  >
                    {trait}
                  </span>
                </div>
              ))}
          </div>
        )}

        {/* Call button */}
        <Link
          href={`/call/${agent.id}`}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 mt-1"
          style={{
            background: accentColor,
            color: "var(--bg)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = "0.9";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = "1";
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }}
        >
          <Phone size={14} />
          Call {name}
        </Link>
      </div>
    </div>
  );
}
