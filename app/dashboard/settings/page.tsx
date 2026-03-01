"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserProfile, UserAgent, VoiceSettings, Memory } from "@/types";
import { ArrowLeft, Save, Check, RotateCcw, Trash2, Brain, AlertTriangle } from "lucide-react";
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

  // Memory management
  const [agentMemories, setAgentMemories] = useState<{ agentId: string; name: string; emoji: string; color: string; count: number; memories: Memory[] }[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [totalMemoryCount, setTotalMemoryCount] = useState(0);

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
      const agents = agentsData as UserAgent[];
      setAgentVoices(
        agents.map((a) => ({
          agent: a,
          speed: a.voice_settings?.speed ?? DEFAULT_VOICE.speed!,
          stability: a.voice_settings?.stability ?? DEFAULT_VOICE.stability!,
          similarityBoost: a.voice_settings?.similarityBoost ?? DEFAULT_VOICE.similarityBoost!,
          saving: false,
          saved: false,
          dirty: false,
        }))
      );

      // Load memory counts per agent
      const memResults = await Promise.all(
        agents.map((a) =>
          supabase
            .from("memories")
            .select("*")
            .eq("user_id", user.id)
            .eq("agent_id", a.id)
            .order("created_at", { ascending: false })
        )
      );

      let total = 0;
      const memData = agents.map((a, i) => {
        const mems = (memResults[i].data ?? []) as Memory[];
        total += mems.length;
        const t = a.template;
        return {
          agentId: a.id,
          name: a.custom_name || t?.name || "Agent",
          emoji: t?.avatar_emoji || "🤖",
          color: t?.accent_color || "var(--amber)",
          count: mems.length,
          memories: mems,
        };
      });
      setAgentMemories(memData);
      setTotalMemoryCount(total);
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

  async function deleteMemoriesForAgent(agentId: string) {
    setDeleting(agentId);
    const res = await fetch("/api/memories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId }),
    });
    if (res.ok) {
      const { deleted } = await res.json();
      setAgentMemories((prev) =>
        prev.map((am) => (am.agentId === agentId ? { ...am, count: 0, memories: [] } : am))
      );
      setTotalMemoryCount((prev) => prev - deleted);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to delete memories");
    }
    setDeleting(null);
    setConfirmDelete(null);
  }

  async function deleteAllMemories() {
    setDeleting("all");
    const res = await fetch("/api/memories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleteAll: true }),
    });
    if (res.ok) {
      setAgentMemories((prev) => prev.map((am) => ({ ...am, count: 0, memories: [] })));
      setTotalMemoryCount(0);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to delete memories");
    }
    setDeleting(null);
    setConfirmDelete(null);
  }

  async function deleteSingleMemory(memoryId: string, agentId: string) {
    const res = await fetch("/api/memories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memoryId }),
    });
    if (res.ok) {
      setAgentMemories((prev) =>
        prev.map((am) =>
          am.agentId === agentId
            ? { ...am, count: am.count - 1, memories: am.memories.filter((m) => m.id !== memoryId) }
            : am
        )
      );
      setTotalMemoryCount((prev) => prev - 1);
    }
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

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "48px 20px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{
            fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px",
            color: "var(--amber)", marginBottom: "8px",
          }}>
            Settings
          </p>
          <h1 style={{
            fontFamily: "var(--font-cormorant)", fontSize: "32px",
            fontWeight: 300, color: "var(--text)", margin: 0,
          }}>
            Your <em style={{ color: "var(--amber)", fontStyle: "italic" }}>companions</em>
          </h1>
          <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "8px" }}>
            Customize how your companions sound and manage what they remember.
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
          {/* Error */}
          {error && (
            <div style={{
              marginBottom: "16px", padding: "10px 16px", borderRadius: "12px",
              background: "var(--rose-l)", border: "1px solid var(--rose-m)",
              color: "var(--rose)", fontSize: "13px",
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          {/* Voice Settings per Agent */}
          {agentVoices.length > 0 && (
            <div style={{ flex: 1, minWidth: "300px" }}>
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

          {/* Memory Management */}
          <div style={{ flex: 1, minWidth: "300px" }}>
            <div style={{ marginBottom: "24px" }}>
              <p style={{
                fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px",
                color: "var(--teal)", marginBottom: "8px",
              }}>
                Memory Management
              </p>
              <h2 style={{
                fontFamily: "var(--font-cormorant)", fontSize: "26px",
                fontWeight: 300, color: "var(--text)", margin: 0,
              }}>
                What they <em style={{ color: "var(--teal)", fontStyle: "italic" }}>remember</em>
              </h2>
              <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "6px" }}>
                Your companions learn from conversations. You can delete memories anytime — no judgment.
              </p>
            </div>

            {/* Total summary */}
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border2)",
              borderRadius: "16px", padding: "20px 24px", marginBottom: "16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: "var(--teal-l)", border: "1px solid var(--teal-m)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Brain size={18} color="var(--teal)" />
                </div>
                <div>
                  <p style={{ fontSize: "14px", color: "var(--text)", margin: 0, fontWeight: 500 }}>
                    {totalMemoryCount} {totalMemoryCount === 1 ? "memory" : "memories"} total
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
                    Across {agentMemories.filter((a) => a.count > 0).length} companion{agentMemories.filter((a) => a.count > 0).length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {totalMemoryCount > 0 && (
                confirmDelete === "all" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "var(--rose)" }}>Delete all?</span>
                    <button
                      onClick={deleteAllMemories}
                      disabled={deleting === "all"}
                      style={{
                        padding: "6px 12px", borderRadius: "8px", border: "none",
                        background: "var(--rose)", color: "var(--bg)",
                        fontSize: "12px", fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
                        opacity: deleting === "all" ? 0.6 : 1,
                      }}
                    >
                      {deleting === "all" ? "Deleting…" : "Yes, delete all"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      style={{
                        padding: "6px 12px", borderRadius: "8px",
                        border: "1px solid var(--border2)", background: "transparent",
                        color: "var(--muted)", fontSize: "12px", fontFamily: "inherit", cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete("all")}
                    style={{
                      padding: "8px 14px", borderRadius: "8px",
                      border: "1px solid var(--rose-m)", background: "var(--rose-l)",
                      color: "var(--rose)", fontSize: "12px", fontFamily: "inherit", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "6px",
                    }}
                  >
                    <Trash2 size={12} />
                    Delete All
                  </button>
                )
              )}
            </div>

            {/* Per-agent memories */}
            {agentMemories.map((am) => (
              <div
                key={am.agentId}
                style={{
                  background: "var(--surface)", border: "1px solid var(--border2)",
                  borderRadius: "16px", overflow: "hidden", marginBottom: "12px",
                }}
              >
                <div style={{
                  height: "2px",
                  background: `linear-gradient(90deg, ${am.color}, transparent)`,
                  opacity: 0.5,
                }} />

                {/* Agent header + delete */}
                <div style={{
                  padding: "16px 24px", display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "20px" }}>{am.emoji}</span>
                    <div>
                      <p style={{
                        fontFamily: "var(--font-cormorant)", fontSize: "16px",
                        fontWeight: 600, color: am.color, margin: 0,
                      }}>
                        {am.name}
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--muted)", margin: 0 }}>
                        {am.count} {am.count === 1 ? "memory" : "memories"}
                      </p>
                    </div>
                  </div>

                  {am.count > 0 && (
                    confirmDelete === am.agentId ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button
                          onClick={() => deleteMemoriesForAgent(am.agentId)}
                          disabled={deleting === am.agentId}
                          style={{
                            padding: "5px 10px", borderRadius: "6px", border: "none",
                            background: "var(--rose)", color: "var(--bg)",
                            fontSize: "11px", fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
                            opacity: deleting === am.agentId ? 0.6 : 1,
                          }}
                        >
                          {deleting === am.agentId ? "Deleting…" : "Confirm"}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          style={{
                            padding: "5px 10px", borderRadius: "6px",
                            border: "1px solid var(--border2)", background: "transparent",
                            color: "var(--muted)", fontSize: "11px", fontFamily: "inherit", cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(am.agentId)}
                        style={{
                          padding: "6px 10px", borderRadius: "6px",
                          border: "1px solid var(--border2)", background: "transparent",
                          color: "var(--muted)", fontSize: "11px", fontFamily: "inherit", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: "4px",
                          transition: "all 0.2s",
                        }}
                      >
                        <Trash2 size={11} />
                        Clear all
                      </button>
                    )
                  )}
                </div>

                {/* Memory list (collapsed, show up to 5) */}
                {am.memories.length > 0 && (
                  <div style={{
                    padding: "0 24px 16px", display: "flex", flexDirection: "column", gap: "6px",
                  }}>
                    {am.memories.slice(0, 5).map((mem) => (
                      <div
                        key={mem.id}
                        style={{
                          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                          gap: "10px", padding: "8px 12px", borderRadius: "8px",
                          background: "var(--surface2)", border: "1px solid var(--border)",
                        }}
                      >
                        <p style={{ fontSize: "12px", color: "var(--text)", lineHeight: "1.5", margin: 0, flex: 1 }}>
                          {mem.content}
                        </p>
                        <button
                          onClick={() => deleteSingleMemory(mem.id, am.agentId)}
                          title="Delete this memory"
                          style={{
                            flexShrink: 0, width: "24px", height: "24px", borderRadius: "4px",
                            border: "none", background: "transparent", color: "var(--muted2)",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "color 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--rose)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted2)")}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    {am.memories.length > 5 && (
                      <p style={{ fontSize: "11px", color: "var(--muted)", textAlign: "center", margin: "4px 0 0" }}>
                        + {am.memories.length - 5} more
                      </p>
                    )}
                  </div>
                )}

                {am.count === 0 && (
                  <div style={{ padding: "0 24px 16px" }}>
                    <p style={{ fontSize: "12px", color: "var(--muted2)", fontStyle: "italic", margin: 0 }}>
                      No memories yet — start a conversation to build them.
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Reassurance */}
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "12px 16px", borderRadius: "12px",
              background: "var(--green-l)", border: "1px solid var(--green-m)",
              marginTop: "16px",
            }}>
              <AlertTriangle size={14} color="var(--green)" />
              <p style={{ fontSize: "12px", color: "var(--green)", margin: 0 }}>
                Deleting memories is permanent, but your companions will naturally learn again from future conversations.
              </p>
            </div>
          </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
