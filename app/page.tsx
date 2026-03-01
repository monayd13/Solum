"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useRef } from "react";

const AGENTS = [
  { emoji: "👵", name: "Eleanor", tagline: "The Wise Storyteller",       color: "#d4880a", desc: "Retired literature professor with a love for folklore, stories, and the warmth of a fireside chat." },
  { emoji: "🧭", name: "Marcus",  tagline: "The Adventurous Guide",       color: "#2a9d8f", desc: "Former wilderness guide who finds adventure in every conversation and inspires you to explore." },
  { emoji: "🌿", name: "Sage",    tagline: "The Mindful Companion",       color: "#5a9e6a", desc: "Mindfulness teacher and former psychologist who listens with her whole self." },
  { emoji: "🎭", name: "Felix",   tagline: "The Witty Conversationalist", color: "#c9637a", desc: "Irish comedian-philosopher who makes you laugh and think at the same time." },
];

const FEATURES = [
  { icon: "🎙️", title: "Real Voice Conversations",  color: "#d4880a", desc: "Low-latency voice AI that listens, responds, and feels like a real phone call." },
  { icon: "🧠", title: "Persistent Memory",           color: "#2a9d8f", desc: "Every conversation is remembered. Your companion grows closer with each call." },
  { icon: "✨", title: "Rich Personalities",           color: "#5a9e6a", desc: "Each companion has a deep backstory, distinct voice, and unique worldview." },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }}>

      {/* ── NAV ── */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
          background: "rgba(13,11,8,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          height: "56px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 40px",
        }}
      >
        <span style={{ fontFamily: "var(--font-cormorant)", fontSize: "24px", fontWeight: 600, color: "var(--amber)", letterSpacing: "1px" }}>
          Solum
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <Link href="/login" style={{ color: "var(--muted)", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", textDecoration: "none", fontWeight: 500 }}>
            Sign In
          </Link>
          <Link href="/signup" style={{ padding: "8px 20px", background: "var(--amber)", color: "var(--bg)", borderRadius: "8px", fontSize: "12px", fontWeight: 600, textDecoration: "none", letterSpacing: "0.5px" }}>
            Get Started
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        style={{
          minHeight: "100vh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center",
          padding: "120px 40px 80px",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Glow */}
        <div style={{
          position: "absolute", top: "-100px", left: "50%", transform: "translateX(-50%)",
          width: "900px", height: "500px", pointerEvents: "none",
          background: "radial-gradient(ellipse, rgba(212,136,10,0.09) 0%, transparent 70%)",
        }} />

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "6px 16px", borderRadius: "100px",
          border: "1px solid var(--amber-m)", background: "var(--amber-l)",
          fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
          color: "var(--amber)", marginBottom: "32px",
          animation: "fadeUp 0.8s ease both",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--amber)", animation: "pulse 2s infinite" }} />
          AI Companion Platform · 2026
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(52px, 8vw, 96px)",
          fontWeight: 300,
          lineHeight: 1.05,
          letterSpacing: "-3px",
          marginBottom: "24px",
          animation: "fadeUp 0.8s 0.1s ease both",
          maxWidth: "900px",
        }}>
          Someone who calls.<br />
          <em style={{ fontStyle: "italic", color: "var(--amber)" }}>And actually remembers.</em>
        </h1>

        {/* Subtitle */}
        <p style={{
          color: "var(--muted)", fontSize: "16px", maxWidth: "520px",
          margin: "0 auto 40px", lineHeight: "1.8",
          animation: "fadeUp 0.8s 0.2s ease both",
        }}>
          Solum connects you with AI companions who have deep personalities, real voices,
          and genuine memory. Every conversation picks up where the last one left off.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", animation: "fadeUp 0.8s 0.3s ease both" }}>
          <Link href="/signup" style={{
            padding: "14px 32px", borderRadius: "12px", background: "var(--amber)",
            color: "var(--bg)", fontWeight: 600, fontSize: "14px", textDecoration: "none",
            boxShadow: "0 8px 30px rgba(212,136,10,0.3)",
          }}>
            Start for free
          </Link>
          <Link href="/login" style={{
            padding: "14px 28px", borderRadius: "12px",
            background: "var(--surface2)", border: "1px solid var(--border2)",
            color: "var(--text)", fontWeight: 600, fontSize: "14px", textDecoration: "none",
          }}>
            Sign in
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "48px", marginTop: "64px", animation: "fadeUp 0.8s 0.4s ease both" }}>
          {[
            { val: "4",    label: "Companions" },
            { val: "2.4s", label: "Response Time" },
            { val: "∞",    label: "Memory" },
            { val: "0",    label: "Apps to Install" },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-cormorant)", fontSize: "36px", fontWeight: 300, color: "var(--amber)", lineHeight: 1, marginBottom: "4px" }}>{val}</div>
              <div style={{ fontSize: "11px", color: "var(--muted)", letterSpacing: "1px", textTransform: "uppercase" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <a href="#companions" style={{
          position: "absolute", bottom: "30px", left: "50%", transform: "translateX(-50%)",
          color: "var(--muted)", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
          textDecoration: "none", animation: "bounce 2s infinite",
        }}>
          Scroll ↓
        </a>
      </section>

      {/* ── DIVIDER ── */}
      <div id="companions" style={{ display: "flex", alignItems: "center", gap: "16px", maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
        <div style={{ flex: 1, height: "1px", background: "var(--border2)" }} />
        <span style={{ fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: "var(--muted)", whiteSpace: "nowrap" }}>Meet the companions</span>
        <div style={{ flex: 1, height: "1px", background: "var(--border2)" }} />
      </div>

      {/* ── COMPANIONS ── */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 40px" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: "56px" }}>
          <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 300, marginBottom: "12px" }}>
            Four voices. <em style={{ fontStyle: "italic", color: "var(--amber)" }}>Each unforgettable.</em>
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "14px", maxWidth: "500px", margin: "0 auto" }}>
            Every companion has a unique backstory, personality, and way of seeing the world.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {AGENTS.map((agent, i) => (
            <div
              key={agent.name}
              className="reveal"
              style={{
                background: "var(--surface)", border: "1px solid var(--border2)",
                borderTop: `3px solid ${agent.color}`,
                borderRadius: "20px", padding: "28px 24px",
                textAlign: "center", transition: "all 0.3s",
                animationDelay: `${i * 0.1}s`,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 50px ${agent.color}18`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            >
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: `${agent.color}15`, border: `2px solid ${agent.color}35`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "32px", margin: "0 auto 16px",
              }}>{agent.emoji}</div>
              <div style={{ fontFamily: "var(--font-cormorant)", fontSize: "22px", fontWeight: 600, color: agent.color, marginBottom: "4px" }}>{agent.name}</div>
              <div style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "14px" }}>{agent.tagline}</div>
              <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: "1.6" }}>{agent.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
        <div style={{ flex: 1, height: "1px", background: "var(--border2)" }} />
        <span style={{ fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: "var(--muted)", whiteSpace: "nowrap" }}>How it works</span>
        <div style={{ flex: 1, height: "1px", background: "var(--border2)" }} />
      </div>

      {/* ── FEATURES ── */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="reveal"
              style={{
                background: "var(--surface)", border: "1px solid var(--border2)",
                borderLeft: `3px solid ${f.color}`,
                borderRadius: "20px", padding: "32px 28px",
                transition: "all 0.3s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              <span style={{ fontSize: "28px", marginBottom: "16px", display: "block" }}>{f.icon}</span>
              <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px", color: "var(--text)" }}>{f.title}</h3>
              <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: "1.7" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 40px 100px" }}>
        <div
          className="reveal"
          style={{
            background: "var(--surface)", border: "1px solid var(--border2)",
            borderRadius: "24px", padding: "56px 48px",
            textAlign: "center", position: "relative", overflow: "hidden",
          }}
        >
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "2px",
            background: "linear-gradient(90deg, var(--amber), var(--teal), var(--rose))",
          }} />
          <p style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(22px, 3vw, 30px)",
            fontStyle: "italic", fontWeight: 300, lineHeight: "1.6",
            color: "var(--text)", marginBottom: "32px",
          }}>
            &ldquo;Every person has a story worth telling.{" "}
            <em style={{ color: "var(--amber)", fontStyle: "normal", fontWeight: 500 }}>Solum is here to listen.</em>
            &rdquo;
          </p>
          <p style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "36px" }}>
            — Eleanor, The Wise Storyteller
          </p>
          <Link href="/signup" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "16px 36px", borderRadius: "12px",
            background: "var(--amber)", color: "var(--bg)",
            fontWeight: 600, fontSize: "14px", textDecoration: "none",
            boxShadow: "0 8px 30px rgba(212,136,10,0.3)",
          }}>
            Begin your first conversation
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        textAlign: "center", padding: "32px",
        borderTop: "1px solid var(--border)",
        fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase",
        color: "var(--muted)",
      }}>
        Solum · Built for connection
      </footer>

    </div>
  );
}
