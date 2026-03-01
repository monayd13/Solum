"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserProfile, UserAgent, VoiceSettings } from "@/types";
import { ArrowLeft, Save, Check, RotateCcw } from "lucide-react";
import Link from "next/link";

function getAge(dobStr: string): number | null {
  if (!dobStr) return null;
  const today = new Date();
  const birth = new Date(dobStr);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const DEFAULT_VOICE: VoiceSettings = { speed: 1.0, stability: 0.5, similarityBoost: 0.75 };

interface AgentVoiceState {
  agent: UserAgent;
  speed: number;
  stability: number;
  similarityBoost: number;
  saving: boolean;
  saved: boolean;
  dirty: boolean;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");

  // Voice settings per agent
  const [agentVoices, setAgentVoices] = useState<AgentVoiceState[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: profileData }, { data: agentsData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("user_agents")
        .select("*, template:agent_templates(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
    ]);

    if (profileData) {
      const p = profileData as UserProfile;
      setProfile(p);
      setFullName(p.full_name || "");
      setPhone(p.phone || "");
      setDob(p.dob || "");
      setGender(p.gender || "");
    }

    if (agentsData) {
      setAgentVoices(
        (agentsData as UserAgent[]).map((a) => ({
          agent: a,
          speed: a.voice_settings?.speed ?? DEFAULT_VOICE.speed!,
          stability: a.voice_settings?.stability ?? DEFAULT_VOICE.stability!,
          similarityBoost: a.voice_settings?.similarityBoost ?? DEFAULT_VOICE.similarityBoost!,
          saving: false,
          saved: false,
          dirty: false,
        }))
      );
    }

    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        dob: dob || null,
        gender: gender || null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to save profile");
      setSaving(false);
      return;
    }

    setProfile(data.profile);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function updateAgentVoice(index: number, field: keyof VoiceSettings, value: number) {
    setAgentVoices((prev) =>
      prev.map((av, i) =>
        i === index ? { ...av, [field]: value, dirty: true, saved: false } : av
      )
    );
  }

  function resetAgentVoice(index: number) {
    setAgentVoices((prev) =>
      prev.map((av, i) =>
        i === index
          ? { ...av, speed: DEFAULT_VOICE.speed!, stability: DEFAULT_VOICE.stability!, similarityBoost: DEFAULT_VOICE.similarityBoost!, dirty: true, saved: false }
          : av
      )
    );
  }

  async function saveAgentVoice(index: number) {
    const av = agentVoices[index];
    setAgentVoices((prev) => prev.map((a, i) => (i === index ? { ...a, saving: true } : a)));

    const res = await fetch("/api/agents/voice-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId: av.agent.id,
        voiceSettings: {
          speed: av.speed,
          stability: av.stability,
          similarityBoost: av.similarityBoost,
        },
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save voice settings");
    }

    setAgentVoices((prev) =>
      prev.map((a, i) => (i === index ? { ...a, saving: false, saved: true, dirty: false } : a))
    );
    setTimeout(() => {
      setAgentVoices((prev) => prev.map((a, i) => (i === index ? { ...a, saved: false } : a)));
    }, 3000);
  }

  const hasChanges =
    profile &&
    (fullName !== (profile.full_name || "") ||
      phone !== (profile.phone || "") ||
      dob !== (profile.dob || "") ||
      gender !== (profile.gender || ""));

  const inputStyle: React.CSSProperties = {
    background: "var(--surface2)",
    border: "1px solid var(--border2)",
    color: "var(--text)",
    padding: "12px 16px",
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "1.2px",
    color: "var(--muted)",
    marginBottom: "6px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: "56px",
        background: "rgba(13,11,8,0.92)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <Link href="/dashboard" style={{
          display: "flex", alignItems: "center", gap: "8px",
          fontSize: "12px", textTransform: "uppercase", letterSpacing: "1.2px",
          color: "var(--muted)", textDecoration: "none", transition: "color 0.2s",
        }}>
          <ArrowLeft size={14} />
          Dashboard
        </Link>
        <ThemeToggle />
      </nav>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "48px 20px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{
            fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px",
            color: "var(--amber)", marginBottom: "8px",
          }}>
            Profile Settings
          </p>
          <h1 style={{
            fontFamily: "var(--font-cormorant)", fontSize: "32px",
            fontWeight: 300, color: "var(--text)", margin: 0,
          }}>
            Your <em style={{ color: "var(--amber)", fontStyle: "italic" }}>details</em>
          </h1>
          <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "8px" }}>
            This information helps your companions personalize conversations.
          </p>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "60px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              border: "2px solid var(--border2)", borderTopColor: "var(--amber)",
              animation: "spin 0.8s linear infinite",
            }} />
          </div>
        ) : (
          <>
          <form onSubmit={handleSave}>
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border2)",
              borderRadius: "16px", overflow: "hidden",
            }}>
              {/* Accent bar */}
              <div style={{
                height: "2px",
                background: "linear-gradient(90deg, var(--amber), transparent)",
                opacity: 0.5,
              }} />

              <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* Section: Personal */}
                <p style={{
                  fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.2px",
                  color: "var(--muted)", margin: 0,
                }}>
                  Personal Info
                </p>

                {/* Full Name */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Smith"
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber-m)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
                  />
                </div>

                {/* DOB + Gender row */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <label style={labelStyle}>Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setDob(e.target.value)}
                      style={{ ...inputStyle, colorScheme: "dark" }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber-m)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
                    />
                    {dob && (
                      <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>
                        Age: {getAge(dob)}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <label style={labelStyle}>Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
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

                {/* Section: Contact */}
                <p style={{
                  fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.2px",
                  color: "var(--muted)", margin: "8px 0 0 0",
                }}>
                  Contact
                </p>

                {/* Phone */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>
                    Phone <span style={{ fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 000 0000"
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber-m)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
                  />
                </div>

                {/* Context preview */}
                <div style={{
                  background: "var(--surface2)", borderRadius: "12px",
                  padding: "16px", border: "1px solid var(--border2)",
                }}>
                  <p style={{
                    fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.2px",
                    color: "var(--amber)", marginBottom: "8px",
                  }}>
                    What your companions will know
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--text)", lineHeight: "1.6", margin: 0 }}>
                    {fullName ? `Name: ${fullName}` : "Name: not set"}
                    {dob ? `  ·  Age: ${getAge(dob)}` : ""}
                    {gender ? `  ·  Gender: ${gender}` : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginTop: "16px", padding: "10px 16px", borderRadius: "12px",
                background: "var(--rose-l)", border: "1px solid var(--rose-m)",
                color: "var(--rose)", fontSize: "13px",
              }}>
                {error}
              </div>
            )}

            {/* Save button */}
            <button
              type="submit"
              disabled={saving || !hasChanges}
              style={{
                marginTop: "20px", width: "100%", padding: "14px",
                borderRadius: "12px", border: "none", cursor: hasChanges ? "pointer" : "not-allowed",
                fontWeight: 600, fontSize: "14px", fontFamily: "inherit",
                background: saved ? "var(--green)" : hasChanges ? "var(--amber)" : "var(--surface2)",
                color: saved || hasChanges ? "var(--bg)" : "var(--muted)",
                opacity: saving ? 0.6 : 1,
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              {saving ? (
                <>
                  <span style={{
                    width: "16px", height: "16px", borderRadius: "50%",
                    border: "2px solid currentColor", borderTopColor: "transparent",
                    animation: "spin 0.8s linear infinite", display: "inline-block",
                  }} />
                  Saving…
                </>
              ) : saved ? (
                <>
                  <Check size={16} />
                  Saved
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </form>

          {/* Voice Settings per Agent */}
          {agentVoices.length > 0 && (
            <div style={{ marginTop: "40px" }}>
              <div style={{ marginBottom: "24px" }}>
                <p style={{
                  fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px",
                  color: "var(--amber)", marginBottom: "8px",
                }}>
                  Voice Settings
                </p>
                <h2 style={{
                  fontFamily: "var(--font-cormorant)", fontSize: "26px",
                  fontWeight: 300, color: "var(--text)", margin: 0,
                }}>
                  How they <em style={{ color: "var(--amber)", fontStyle: "italic" }}>sound</em>
                </h2>
                <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "6px" }}>
                  Customize the voice of each companion. Changes apply on your next call.
                </p>
              </div>

              {agentVoices.map((av, index) => {
                const template = av.agent.template;
                const name = av.agent.custom_name || template?.name || "Agent";
                const emoji = template?.avatar_emoji || "🤖";
                const color = template?.accent_color || "var(--amber)";

                return (
                  <div
                    key={av.agent.id}
                    style={{
                      background: "var(--surface)", border: "1px solid var(--border2)",
                      borderRadius: "16px", overflow: "hidden", marginBottom: "16px",
                    }}
                  >
                    {/* Agent header */}
                    <div style={{
                      height: "2px",
                      background: `linear-gradient(90deg, ${color}, transparent)`,
                      opacity: 0.5,
                    }} />
                    <div style={{
                      padding: "20px 24px 0", display: "flex", alignItems: "center", gap: "12px",
                    }}>
                      <div style={{
                        width: "40px", height: "40px", borderRadius: "50%",
                        background: `${color}15`, border: `2px solid ${color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "20px",
                      }}>
                        {emoji}
                      </div>
                      <div>
                        <p style={{
                          fontFamily: "var(--font-cormorant)", fontSize: "18px",
                          fontWeight: 600, color, margin: 0,
                        }}>
                          {name}
                        </p>
                        {template?.tagline && (
                          <p style={{ fontSize: "11px", color: "var(--muted)", margin: 0 }}>
                            {template.tagline}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Sliders */}
                    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                      {/* Speed */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <label style={{ fontSize: "12px", color: "var(--muted)" }}>Speed</label>
                          <span style={{ fontSize: "12px", color, fontWeight: 500 }}>{av.speed.toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.1"
                          value={av.speed}
                          onChange={(e) => updateAgentVoice(index, "speed", parseFloat(e.target.value))}
                          style={{ width: "100%", accentColor: color }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "10px", color: "var(--muted2)" }}>Slow</span>
                          <span style={{ fontSize: "10px", color: "var(--muted2)" }}>Fast</span>
                        </div>
                      </div>

                      {/* Stability */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <label style={{ fontSize: "12px", color: "var(--muted)" }}>Stability</label>
                          <span style={{ fontSize: "12px", color, fontWeight: 500 }}>{Math.round(av.stability * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={av.stability}
                          onChange={(e) => updateAgentVoice(index, "stability", parseFloat(e.target.value))}
                          style={{ width: "100%", accentColor: color }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "10px", color: "var(--muted2)" }}>Expressive</span>
                          <span style={{ fontSize: "10px", color: "var(--muted2)" }}>Stable</span>
                        </div>
                      </div>

                      {/* Similarity Boost */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <label style={{ fontSize: "12px", color: "var(--muted)" }}>Voice Clarity</label>
                          <span style={{ fontSize: "12px", color, fontWeight: 500 }}>{Math.round(av.similarityBoost * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={av.similarityBoost}
                          onChange={(e) => updateAgentVoice(index, "similarityBoost", parseFloat(e.target.value))}
                          style={{ width: "100%", accentColor: color }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "10px", color: "var(--muted2)" }}>Natural</span>
                          <span style={{ fontSize: "10px", color: "var(--muted2)" }}>Clear</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{
                      padding: "12px 24px 16px", display: "flex", gap: "8px", justifyContent: "flex-end",
                    }}>
                      <button
                        onClick={() => resetAgentVoice(index)}
                        style={{
                          padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border2)",
                          background: "transparent", color: "var(--muted)", cursor: "pointer",
                          fontSize: "12px", fontFamily: "inherit",
                          display: "flex", alignItems: "center", gap: "6px",
                        }}
                      >
                        <RotateCcw size={12} />
                        Reset
                      </button>
                      <button
                        onClick={() => saveAgentVoice(index)}
                        disabled={av.saving || !av.dirty}
                        style={{
                          padding: "8px 16px", borderRadius: "8px", border: "none",
                          background: av.saved ? "var(--green)" : av.dirty ? color : "var(--surface2)",
                          color: av.saved || av.dirty ? "var(--bg)" : "var(--muted)",
                          cursor: av.dirty ? "pointer" : "not-allowed",
                          fontSize: "12px", fontWeight: 600, fontFamily: "inherit",
                          opacity: av.saving ? 0.6 : 1, transition: "all 0.2s",
                          display: "flex", alignItems: "center", gap: "6px",
                        }}
                      >
                        {av.saving ? "Saving…" : av.saved ? (
                          <><Check size={12} /> Saved</>
                        ) : (
                          <><Save size={12} /> Save</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
}
