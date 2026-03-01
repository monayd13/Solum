"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative"
      style={{ background: "var(--bg)" }}
    >
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(212,136,10,0.06) 0%, transparent 65%)",
        }}
      />

      <div className="w-full max-w-sm z-10">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-3xl font-semibold tracking-wider"
            style={{ fontFamily: "var(--font-cormorant)", color: "var(--amber)" }}
          >
            Solum
          </Link>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            Create your account
          </p>
        </div>

        <div
          className="rounded-2xl p-8 relative overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border2)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{
              background: "linear-gradient(90deg, var(--amber), transparent)",
              opacity: 0.5,
            }}
          />

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs uppercase tracking-widest"
                style={{ color: "var(--muted)" }}
              >
                Your Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                className="px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border2)",
                  color: "var(--text)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber-m)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs uppercase tracking-widest"
                style={{ color: "var(--muted)" }}
              >
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border2)",
                  color: "var(--text)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber-m)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs uppercase tracking-widest"
                style={{ color: "var(--muted)" }}
              >
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border2)",
                  color: "var(--text)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber-m)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
              />
            </div>

            {error && (
              <p
                className="text-xs px-3 py-2 rounded-lg"
                style={{
                  background: "var(--rose-l)",
                  border: "1px solid var(--rose-m)",
                  color: "var(--rose)",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "var(--amber)", color: "var(--bg)" }}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center mt-4 text-sm" style={{ color: "var(--muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--amber)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
