"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MailCheck } from "lucide-react";

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "At least 8 characters";
  if (pw.length > 32) return "At most 32 characters";
  if (!/[A-Z]/.test(pw)) return "Include at least one uppercase letter";
  if (!/[a-z]/.test(pw)) return "Include at least one lowercase letter";
  if (!/[0-9]/.test(pw)) return "Include at least one number";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw))
    return "Include at least one special character";
  return null;
}

function getAge(dobStr: string): number | null {
  if (!dobStr) return null;
  const today = new Date();
  const birth = new Date(dobStr);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function PasswordStrengthBar({ pw }: { pw: string }) {
  if (!pw) return null;
  const checks = [
    pw.length >= 8,
    /[A-Z]/.test(pw),
    /[a-z]/.test(pw),
    /[0-9]/.test(pw),
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw),
  ];
  const passed = checks.filter(Boolean).length;
  const color = passed <= 2 ? "#c9637a" : passed <= 3 ? "#d4880a" : "#5a9e6a";
  const label = passed <= 2 ? "Weak" : passed <= 3 ? "Fair" : passed === 4 ? "Good" : "Strong";
  return (
    <div style={{ marginTop: "6px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{
            height: "3px", flex: 1, borderRadius: "99px",
            background: i <= passed ? color : "var(--border2)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <span style={{ fontSize: "11px", color }}>{label}</span>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [dob, setDob]             = useState("");
  const [gender, setGender]       = useState("");
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name."); return;
    }
    const age = getAge(dob);
    if (age === null || age < 18) {
      setError("Solum is currently available to adults 18 and older."); return;
    }
    setStep(2);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const pwErr = validatePassword(password);
    if (pwErr) { setError(pwErr); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (!acceptedTerms) { setError("Please accept the Terms and Privacy Policy."); return; }

    setLoading(true);
    const supabase = createClient();
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const companionId = new URL(window.location.href).searchParams.get("companion");
    const normalizedPhone = phone.trim() ? phone.replace(/[\s().-]/g, "") : null;

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: fullName, phone: normalizedPhone, dob, gender: gender || null, companion_id: companionId } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setAccountCreated(true);
      setLoading(false);
    }
  }

  const field = (
    label: string,
    input: React.ReactNode,
    hint?: string,
    optional?: boolean
  ) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{
        fontSize: "13px", fontWeight: 500,
        color: "var(--text)", display: "flex", gap: "6px", alignItems: "center",
      }}>
        {label}
        {optional && <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 400 }}>optional</span>}
      </label>
      {input}
      {hint && <span style={{ fontSize: "11px", color: "var(--muted)" }}>{hint}</span>}
    </div>
  );

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
      padding: "40px 16px", position: "relative", overflow: "hidden",
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
            Create your account
          </p>
        </div>

        {/* Step indicator */}
        {!accountCreated && <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
          {[1, 2].map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px", flex: s < 2 ? 1 : "none" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: step >= s ? "var(--amber)" : "var(--surface2)",
                border: `1.5px solid ${step >= s ? "var(--amber)" : "var(--border2)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 600,
                color: step >= s ? "var(--bg)" : "var(--muted)",
                transition: "all 0.2s",
              }}>
                {step > s ? "✓" : s}
              </div>
              <span style={{
                fontSize: "12px", fontWeight: 500,
                color: step >= s ? "var(--text)" : "var(--muted)",
              }}>
                {s === 1 ? "Personal Info" : "Account & Security"}
              </span>
              {s < 2 && <div style={{ flex: 1, height: "1px", background: step > s ? "var(--amber)" : "var(--border2)", transition: "background 0.2s" }} />}
            </div>
          ))}
        </div>}

        {/* Card */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border2)",
          borderRadius: "16px", padding: "32px", position: "relative", overflow: "hidden",
        }}>
          {/* Top accent line */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "2px",
            background: "linear-gradient(90deg, var(--amber), transparent)",
          }} />

          {accountCreated && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              textAlign: "center", padding: "12px 0 4px",
            }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--amber)", background: "rgba(212,136,10,0.1)",
                border: "1px solid rgba(212,136,10,0.24)", marginBottom: "18px",
              }}>
                <MailCheck size={27} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <h1 style={{
                margin: 0, fontFamily: "var(--font-cormorant)",
                fontSize: "30px", fontWeight: 600, color: "var(--text)",
              }}>
                Check your email
              </h1>
              <p style={{
                margin: "10px 0 24px", maxWidth: "340px", fontSize: "14px",
                lineHeight: 1.65, color: "var(--muted)", overflowWrap: "anywhere",
              }}>
                We created your account and saved your profile. Open the confirmation link sent to{" "}
                <strong style={{ color: "var(--text)", fontWeight: 500 }}>
                  {email.trim().toLowerCase()}
                </strong>
                , then sign in.
              </p>
              <Link href="/login" style={{
                width: "100%", padding: "13px", borderRadius: "10px",
                background: "var(--amber)", color: "var(--bg)",
                textDecoration: "none", fontSize: "14px", fontWeight: 600,
              }}>
                Go to sign in
              </Link>
            </div>
          )}

          {/* ── STEP 1 ── */}
          {!accountCreated && step === 1 && (
            <form onSubmit={handleNext} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                {field("First Name",
                  <input type="text" required value={firstName} placeholder="Jane"
                    onChange={(e) => setFirstName(e.target.value)} style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
                  />
                )}
                {field("Last Name",
                  <input type="text" required value={lastName} placeholder="Smith"
                    onChange={(e) => setLastName(e.target.value)} style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
                  />
                )}
              </div>

              {field("Date of Birth",
                <input type="date" required value={dob}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDob(e.target.value)}
                  style={{ ...inputStyle, colorScheme: "dark" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
                />
              )}

              {field("Gender",
                <select value={gender} onChange={(e) => setGender(e.target.value)}
                  style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
                >
                  <option value="">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              )}

              {error && (
                <p style={{
                  fontSize: "13px", padding: "10px 14px", borderRadius: "8px",
                  background: "rgba(201,99,122,0.08)", border: "1px solid #c9637a",
                  color: "#c9637a",
                }}>{error}</p>
              )}

              <button type="submit" style={{
                width: "100%", padding: "13px",
                background: "var(--amber)", color: "var(--bg)",
                border: "none", borderRadius: "10px",
                fontSize: "14px", fontWeight: 600, cursor: "pointer",
                fontFamily: "var(--font-dm-sans)",
                marginTop: "4px",
              }}>
                Continue →
              </button>
            </form>
          )}

          {/* ── STEP 2 ── */}
          {!accountCreated && step === 2 && (
            <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {field("Email address",
                <input type="email" required value={email} placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)} style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
                />
              )}

              {field("Phone number",
                <input type="tel" value={phone} placeholder="+1 (555) 000-0000"
                  onChange={(e) => setPhone(e.target.value)} style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
                />,
                undefined, true
              )}

              {field("Password",
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required value={password} placeholder="Min. 8 characters"
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
                </div>,
                undefined
              )}
              <PasswordStrengthBar pw={password} />

              {field("Confirm password",
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    required value={confirmPassword} placeholder="Re-enter password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      ...inputStyle, paddingRight: "56px",
                      borderColor: confirmPassword
                        ? confirmPassword === password ? "#5a9e6a" : "#c9637a"
                        : "var(--border2)",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber)")}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = confirmPassword
                        ? confirmPassword === password ? "#5a9e6a" : "#c9637a"
                        : "var(--border2)";
                    }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: "12px", color: "var(--muted)", fontFamily: "var(--font-dm-sans)",
                  }}>
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
              )}
              {confirmPassword && (
                <p style={{ fontSize: "11px", marginTop: "-10px", color: confirmPassword === password ? "#5a9e6a" : "#c9637a" }}>
                  {confirmPassword === password ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}

              <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "12px", color: "var(--muted)", lineHeight: 1.6 }}>
                <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} required style={{ marginTop: "3px", accentColor: "var(--amber)" }} />
                <span>I&apos;m 18 or older and agree to the <Link href="/terms" target="_blank" style={{ color: "var(--amber)" }}>Terms</Link> and <Link href="/privacy" target="_blank" style={{ color: "var(--amber)" }}>Privacy Policy</Link>.</span>
              </label>

              {error && (
                <p style={{
                  fontSize: "13px", padding: "10px 14px", borderRadius: "8px",
                  background: "rgba(201,99,122,0.08)", border: "1px solid #c9637a",
                  color: "#c9637a",
                }}>{error}</p>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button type="button" onClick={() => { setStep(1); setError(null); }} style={{
                  flex: 1, padding: "13px",
                  background: "var(--surface2)", color: "var(--text)",
                  border: "1.5px solid var(--border2)", borderRadius: "10px",
                  fontSize: "14px", fontWeight: 500, cursor: "pointer",
                  fontFamily: "var(--font-dm-sans)",
                }}>
                  ← Back
                </button>
                <button type="submit" disabled={loading} style={{
                  flex: 2, padding: "13px",
                  background: "var(--amber)", color: "var(--bg)",
                  border: "none", borderRadius: "10px",
                  fontSize: "14px", fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  fontFamily: "var(--font-dm-sans)",
                }}>
                  {loading ? "Creating account…" : "Create Account"}
                </button>
              </div>
            </form>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "var(--muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--amber)", textDecoration: "none", fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
