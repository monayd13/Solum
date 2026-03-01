"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px",
    background: "var(--surface2)",
    border: "1.5px solid var(--border2)",
    borderRadius: "10px",
    fontSize: "14px", color: "var(--text)",
    outline: "none", transition: "border-color 0.15s",
    fontFamily: "var(--font-dm-sans)",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 16px", position: "relative",
    }}>
      {/* Glow */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "400px", pointerEvents: "none",
        background: "radial-gradient(ellipse, rgba(212,136,10,0.07) 0%, transparent 70%)",
      }} />

      {/* Theme toggle */}
      <div style={{ position: "absolute", top: "16px", right: "16px" }}>
        <ThemeToggle />
      </div>

      <div style={{ width: "100%", maxWidth: "440px", position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Link href="/" style={{
            fontFamily: "var(--font-cormorant)", fontSize: "32px",
            fontWeight: 600, color: "var(--amber)", textDecoration: "none",
            letterSpacing: "1px",
          }}>
            Solum
          </Link>
          <p style={{ marginTop: "6px", fontSize: "14px", color: "var(--muted)" }}>
            Welcome back
          </p>
        </div>

        {/* Companion Selection */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border2)",
          borderRadius: "16px", padding: "24px", marginBottom: "24px",
        }}>
          <h3 style={{
            fontSize: "16px", fontWeight: 600, color: "var(--text)",
            marginBottom: "16px", textAlign: "center",
          }}>
            Choose Your Companion
          </h3>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
          }}>
            {[
              { id: "maya", name: "Maya Thompson", tagline: "The Ambitious Achiever", color: "#c06800", avatar: "/companions/maya.png" },
              { id: "jimmy", name: "Jimmy Carter", tagline: "The Compassionate Statesman", color: "#8b4513", avatar: "/companions/jimmy.png" },
              { id: "claire", name: "Claire Donovan", tagline: "The Thoughtful Guide", color: "#126838", avatar: "/companions/claire.png" },
              { id: "daniel", name: "Daniel Mercer", tagline: "The Steady Mentor", color: "#5018a0", avatar: "/companions/daniel.png" },
            ].map((companion) => (
              <div key={companion.id} style={{
                background: "var(--surface2)", border: `1px solid ${companion.color}33`,
                borderRadius: "12px", padding: "12px", textAlign: "center",
                cursor: "pointer", transition: "all 0.2s",
              }}>
                <div style={{
                  width: "60px", height: "60px", borderRadius: "50%",
                  margin: "0 auto 8px", overflow: "hidden",
                  border: `2px solid ${companion.color}`,
                }}>
                  <img src={companion.avatar} alt={companion.name} style={{
                    width: "100%", height: "100%", objectFit: "cover",
                  }} />
                </div>
                <h4 style={{
                  fontSize: "14px", fontWeight: 600, color: companion.color,
                  margin: "0 0 4px",
                }}>
                  {companion.name}
                </h4>
                <p style={{
                  fontSize: "11px", color: "var(--muted)", margin: 0,
                }}>
                  {companion.tagline}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border2)",
          borderRadius: "16px", padding: "32px", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "2px",
            background: "linear-gradient(90deg, var(--amber), transparent)",
          }} />

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>
                Email address
              </label>
              <input
                type="email" required value={email} placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
              />
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>
                  Password
                </label>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required value={password} placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: "56px" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "12px", color: "var(--muted)", fontFamily: "var(--font-dm-sans)",
                }}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <p style={{
                fontSize: "13px", padding: "10px 14px", borderRadius: "8px",
                background: "rgba(201,99,122,0.08)", border: "1px solid #c9637a",
                color: "#c9637a",
              }}>{error}</p>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px",
              background: "var(--amber)", color: "var(--bg)",
              border: "none", borderRadius: "10px",
              fontSize: "14px", fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              fontFamily: "var(--font-dm-sans)",
              marginTop: "4px",
            }}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "var(--muted)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "var(--amber)", textDecoration: "none", fontWeight: 500 }}>
            Sign up
          </Link>
        </p>
      </div>

      {/* ── Companion Selection ── */}
      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <div style={{ marginBottom: "20px" }}>
          <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "var(--amber)", margin: "0 0 4px" }}>
            Meet Your Companions
          </p>
          <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 400, fontFamily: "var(--font-cormorant)", color: "var(--text)" }}>
            Who would you like to{" "}
            <em style={{ fontStyle: "italic", color: "var(--amber)" }}>talk to?</em>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", maxWidth: "1100px", margin: "0 auto" }}>
          {[
            {
              id: "maya",
              name: "Maya Thompson",
              tagline: "The Ambitious Achiever",
              color: "#c06800",
              avatar: "/companions/maya.png",
              bestFor: ["Career & ambition", "Goal-setting", "Redefining success"],
            },
            {
              id: "jimmy",
              name: "Jimmy Carter",
              tagline: "The Compassionate Statesman",
              color: "#8b4513",
              avatar: "/companions/jimmy.png",
              bestFor: ["Service & leadership", "Conflict resolution", "Wisdom & perspective"],
            },
            {
              id: "claire",
              name: "Claire Donovan",
              tagline: "The Thoughtful Guide",
              color: "#126838",
              avatar: "/companions/claire.png",
              bestFor: ["Being heard", "Finding perspective", "Life meaning"],
            },
            {
              id: "daniel",
              name: "Daniel Mercer",
              tagline: "The Steady Mentor",
              color: "#5018a0",
              avatar: "/companions/daniel.png",
              bestFor: ["Long-term thinking", "Work pressure", "Calm & grounding"],
            },
          ].map((companion) => (
            <div
              key={companion.id}
              style={{
                background: "var(--surface)", border: "1px solid var(--border2)",
                borderTop: `3px solid ${companion.color}`,
                borderRadius: "20px", overflow: "hidden",
                position: "relative", height: "320px",
                transition: "all 0.3s", cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = `0 16px 50px ${companion.color}18`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Image covering top half */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "60%",
                overflow: "hidden",
              }}>
                <img
                  src={companion.avatar}
                  alt={companion.name}
                  style={{
                    width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top",
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
                    fontWeight: 600, color: companion.color, margin: "0 0 4px",
                  }}>
                    {companion.name}
                  </h3>

                  {/* Best for */}
                  <p style={{ fontSize: "10px", color: "var(--muted)", margin: 0, lineHeight: "1.3" }}>
                    <span style={{ color: companion.color, fontWeight: 600 }}>Best for:</span><br/>
                    {companion.bestFor.join(" • ")}
                  </p>
                </div>

                {/* Learn more button */}
                <button
                  style={{
                    width: "100%", padding: "8px",
                    borderRadius: "8px", border: `1.5px solid ${companion.color}`,
                    background: "transparent", color: companion.color,
                    fontSize: "11px", fontWeight: 600, cursor: "pointer",
                    fontFamily: "var(--font-dm-sans)", marginTop: "8px",
                  }}
                >
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
