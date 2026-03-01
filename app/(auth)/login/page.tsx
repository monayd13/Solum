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
    </div>
  );
}
