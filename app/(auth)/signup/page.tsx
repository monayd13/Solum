"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (pw.length > 16) return "Password must be at most 16 characters.";
  if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(pw)) return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(pw)) return "Password must contain at least one number.";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw))
    return "Password must contain at least one special character.";
  return null;
}

export default function SignupPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  const supabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

  function getAge(dobStr: string): number | null {
    if (!dobStr) return null;
    const today = new Date();
    const birth = new Date(dobStr);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (!supabaseConfigured) {
      setError("Supabase is not configured yet.");
      return;
    }

    const pwValidation = validatePassword(password);
    if (pwValidation) { setError(pwValidation); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    const age = getAge(dob);
    if (age !== null && age < 10) { setError("You must be at least 10 years old to sign up."); return; }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          email: email,
          phone: phone || null,
          age: age,
          dob: dob || null,
          gender: gender || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.user.id);
    }

    router.push("/dashboard");
    router.refresh();
  }

  const inputStyle = {
    background: "var(--surface2)",
    border: "1px solid var(--border2)",
    color: "var(--text)",
  };
  const inputClass =
    "px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 w-full";

  const PasswordStrength = ({ pw }: { pw: string }) => {
    if (!pw) return null;
    const checks = [
      pw.length >= 8 && pw.length <= 16,
      /[A-Z]/.test(pw),
      /[a-z]/.test(pw),
      /[0-9]/.test(pw),
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw),
    ];
    const passed = checks.filter(Boolean).length;
    const color =
      passed <= 2 ? "var(--rose)" : passed <= 3 ? "var(--amber)" : "var(--green)";
    const label = passed <= 2 ? "Weak" : passed <= 3 ? "Fair" : passed === 4 ? "Good" : "Strong";

    return (
      <div className="flex flex-col gap-1 mt-1">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: i <= passed ? color : "var(--border2)" }}
            />
          ))}
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs" style={{ color }}>
            {label}
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            8–16 chars · A–Z · a–z · 0–9 · !@#…
          </p>
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative"
      style={{ background: "var(--bg)" }}
    >
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 25%, rgba(212,136,10,0.06) 0%, transparent 65%)",
        }}
      />

      <div className="w-full max-w-sm z-10">
        {/* Logo */}
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
          style={{ background: "var(--surface)", border: "1px solid var(--border2)" }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{
              background: "linear-gradient(90deg, var(--amber), transparent)",
              opacity: 0.5,
            }}
          />

          <form onSubmit={handleSignup} className="flex flex-col gap-4">

            {/* ── Personal Info ── */}
            <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              Personal Info
            </p>

            {/* First + Last Name */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                  className={inputClass}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber-m)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Smith"
                  className={inputClass}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber-m)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
                />
              </div>
            </div>

            {/* DOB + Gender */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDob(e.target.value)}
                  className={inputClass}
                  style={{ ...inputStyle, colorScheme: "dark" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber-m)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={inputClass}
                  style={{ ...inputStyle, appearance: "none" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber-m)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
                >
                  <option value="">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* ── Contact ── */}
            <p className="text-xs uppercase tracking-widest mt-1" style={{ color: "var(--muted)" }}>
              Contact
            </p>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber-m)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                Phone <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 0000"
                className={inputClass}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber-m)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPwError(validatePassword(e.target.value));
                  }}
                  placeholder="Min. 8 characters"
                  className={inputClass}
                  style={{ ...inputStyle, paddingRight: "3rem" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber-m)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: "var(--muted)" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <PasswordStrength pw={password} />
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={inputClass}
                  style={{
                    ...inputStyle,
                    paddingRight: "3rem",
                    borderColor:
                      confirmPassword && confirmPassword !== password
                        ? "var(--rose)"
                        : confirmPassword && confirmPassword === password
                        ? "var(--green)"
                        : "var(--border2)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber-m)")}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      confirmPassword !== password ? "var(--rose)" : "var(--border2)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: "var(--muted)" }}
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs" style={{ color: "var(--rose)" }}>
                  Passwords do not match
                </p>
              )}
              {confirmPassword && confirmPassword === password && (
                <p className="text-xs" style={{ color: "var(--green)" }}>
                  Passwords match
                </p>
              )}
            </div>

            {error && (
              <p
                className="text-xs px-3 py-2 rounded-lg"
                style={{
                  background: "rgba(201,99,122,0.08)",
                  border: "1px solid var(--rose)",
                  color: "var(--rose)",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !!pwError}
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
