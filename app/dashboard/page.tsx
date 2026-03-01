"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MoodCheckIn } from "@/components/dashboard/MoodCheckIn";
import { MemoryCorner } from "@/components/dashboard/MemoryCorner";
import { UserAgent, UserProfile, AgentTemplate } from "@/types";
import { LogOut, Phone, Plus, ChevronDown, ChevronUp, Sparkles, Clock, MessageSquare, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TRAIT_LABELS: Record<string, string> = {
  warmth: "Warmth",
  humor: "Humor",
  directness: "Directness",
  storytelling: "Storytelling",
  empathy: "Empathy",
  energy: "Energy",
  optimism: "Optimism",
  analyticalThinking: "Analytical",
};

function TraitBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "11px", color: "var(--muted)" }}>{label}</span>
        <span style={{ fontSize: "11px", color }}>{Math.round(value * 100)}%</span>
      </div>
      <div style={{ height: "4px", background: "var(--border2)", borderRadius: "99px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value * 100}%`, background: color, borderRadius: "99px", transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function CompanionCard({ agent, onCall }: { agent: UserAgent; onCall: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const template = agent.template;
  const name = agent.custom_name || template?.name || "Unknown";
  const color = template?.accent_color || "#d4880a";
  const traits = template?.personality_traits as Record<string, number> | null;

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border2)",
      borderRadius: "16px", overflow: "hidden",
      borderTop: `3px solid ${color}`,
    }}>
      {/* Card header */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "16px" }}>
          <div style={{
            width: "60px", height: "60px", borderRadius: "50%", flexShrink: 0,
            background: `${color}18`, border: `2px solid ${color}40`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px",
          }}>
            {template?.avatar_emoji || "🤖"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: "20px", fontWeight: 600, color, fontFamily: "var(--font-cormorant)", margin: 0 }}>
              {name}
            </h3>
            <p style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", margin: "2px 0 0" }}>
              {template?.tagline}
            </p>
          </div>
        </div>

        {/* Backstory snippet */}
        <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: "1.6", marginBottom: "16px" }}>
          {template?.backstory?.split("\n")[0]?.slice(0, 120)}…
        </p>

        {/* Quick trait pills */}
        {traits && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
            {Object.entries(traits)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 3)
              .map(([trait, val]) => (
                <span key={trait} style={{
                  fontSize: "11px", padding: "3px 9px", borderRadius: "99px",
                  background: `${color}15`, border: `1px solid ${color}30`, color,
                }}>
                  {TRAIT_LABELS[trait] || trait} {Math.round((val as number) * 100)}%
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Expandable detail */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%", padding: "10px 20px", background: "transparent",
          border: "none", borderTop: "1px solid var(--border2)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          fontSize: "12px", color: "var(--muted)", fontFamily: "var(--font-dm-sans)",
        }}
      >
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {expanded ? "Less about" : "More about"} {name}
      </button>

      {expanded && (
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border2)", background: "var(--surface2)" }}>
          {/* Full backstory */}
          <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: "1.7", marginBottom: "16px" }}>
            {template?.backstory}
          </p>
          {/* All traits */}
          {traits && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--muted)", margin: 0 }}>Personality</p>
              {Object.entries(traits).map(([trait, val]) => (
                <TraitBar key={trait} label={TRAIT_LABELS[trait] || trait} value={val as number} color={color} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Call button */}
      <div style={{ padding: "12px 20px 20px" }}>
        <button
          onClick={onCall}
          style={{
            width: "100%", padding: "12px", borderRadius: "10px",
            background: color, color: "var(--bg)", border: "none",
            fontSize: "14px", fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          <Phone size={14} />
          Call {name}
        </button>
      </div>
    </div>
  );
}

function DiscoverCard({ template, onAdd, adding }: { template: AgentTemplate; onAdd: () => void; adding: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const color = template.accent_color || "#d4880a";
  const traits = template.personality_traits as Record<string, number> | null;

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border2)",
      borderRadius: "16px", overflow: "hidden", borderTop: `3px solid ${color}`,
    }}>
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "50%", flexShrink: 0,
            background: `${color}18`, border: `2px solid ${color}40`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px",
          }}>
            {template.avatar_emoji || "🤖"}
          </div>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, color, fontFamily: "var(--font-cormorant)", margin: 0 }}>
              {template.name}
            </h3>
            <p style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", margin: "2px 0 0" }}>
              {template.tagline}
            </p>
          </div>
        </div>

        <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: "1.6", marginBottom: "12px" }}>
          {template.backstory?.split("\n")[0]?.slice(0, 100)}…
        </p>

        {traits && (
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "12px" }}>
            {Object.entries(traits)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 2)
              .map(([trait, val]) => (
                <span key={trait} style={{
                  fontSize: "11px", padding: "2px 8px", borderRadius: "99px",
                  background: `${color}12`, border: `1px solid ${color}25`, color,
                }}>
                  {TRAIT_LABELS[trait] || trait}
                </span>
              ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%", padding: "8px 20px", background: "transparent",
          border: "none", borderTop: "1px solid var(--border2)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          fontSize: "12px", color: "var(--muted)", fontFamily: "var(--font-dm-sans)",
        }}
      >
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {expanded ? "Hide" : "Read"} full backstory
      </button>

      {expanded && (
        <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border2)", background: "var(--surface2)" }}>
          <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: "1.7", marginBottom: "14px" }}>
            {template.backstory}
          </p>
          {traits && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {Object.entries(traits).map(([trait, val]) => (
                <TraitBar key={trait} label={TRAIT_LABELS[trait] || trait} value={val as number} color={color} />
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ padding: "10px 20px 18px" }}>
        <button
          onClick={onAdd}
          disabled={adding}
          style={{
            width: "100%", padding: "11px", borderRadius: "10px",
            background: "transparent", color,
            border: `1.5px solid ${color}`,
            fontSize: "13px", fontWeight: 600, cursor: adding ? "not-allowed" : "pointer",
            opacity: adding ? 0.5 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          <Plus size={13} />
          Add {template.name} as companion
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<UserAgent[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: profileData }, { data: agentsData }, { data: templatesData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("user_agents").select("*, template:agent_templates(*)").eq("user_id", user.id).order("created_at", { ascending: true }),
      supabase.from("agent_templates").select("*").order("name"),
    ]);

    setProfile(profileData as UserProfile);
    setAgents((agentsData as UserAgent[]) ?? []);
    setTemplates((templatesData as AgentTemplate[]) ?? []);
    setLoading(false);
  }

  async function handleAddAgent(templateId: string) {
    setAdding(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_agents").insert({ user_id: user.id, template_id: templateId });
    await loadData();
    setAdding(false);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const addedTemplateIds = new Set(agents.map((a) => a.template_id));
  const availableTemplates = templates.filter((t) => !addedTemplateIds.has(t.id));
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

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
        <Link href="/" style={{
          fontFamily: "var(--font-cormorant)", fontSize: "22px",
          fontWeight: 600, color: "var(--amber)", textDecoration: "none", letterSpacing: "1px",
        }}>
          Solum
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "var(--muted)" }}>{profile?.full_name ?? ""}</span>
          <ThemeToggle />
          <Link href="/dashboard/settings" title="Profile settings" style={{
            width: "34px", height: "34px", borderRadius: "50%",
            background: "var(--surface2)", border: "1px solid var(--border2)",
            color: "var(--muted)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            textDecoration: "none",
          }}>
            <Settings size={14} />
          </Link>
          <button onClick={handleLogout} title="Sign out" style={{
            width: "34px", height: "34px", borderRadius: "50%",
            background: "var(--surface2)", border: "1px solid var(--border2)",
            color: "var(--muted)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <LogOut size={14} />
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px 80px" }}>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "80px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              border: "2px solid var(--border2)", borderTopColor: "var(--amber)",
              animation: "spin 0.8s linear infinite",
            }} />
          </div>
        ) : (
          <>
            {/* ── Profile Banner ── */}
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border2)",
              borderRadius: "20px", padding: "28px 32px", marginBottom: "36px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "2px",
                background: "linear-gradient(90deg, var(--amber), #2a9d8f, #c9637a, transparent)",
              }} />
              <div style={{
                position: "absolute", top: 0, right: 0, width: "300px", height: "100%",
                background: "radial-gradient(ellipse at right, rgba(212,136,10,0.04) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />

              <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                {/* Avatar */}
                <div style={{
                  width: "64px", height: "64px", borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, var(--amber), #c06800)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "24px", fontWeight: 700, color: "var(--bg)",
                  fontFamily: "var(--font-dm-sans)",
                }}>
                  {profile?.full_name?.charAt(0).toUpperCase() ?? "?"}
                </div>

                {/* Name + meta */}
                <div style={{ flex: 1, minWidth: "180px" }}>
                  <h2 style={{
                    margin: 0, fontSize: "24px", fontWeight: 600,
                    fontFamily: "var(--font-cormorant)", color: "var(--text)",
                  }}>
                    Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {firstName}
                  </h2>
                  <div style={{ display: "flex", gap: "16px", marginTop: "6px", flexWrap: "wrap" }}>
                    {profile?.gender && (
                      <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                        {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                      </span>
                    )}
                    {profile?.dob && (
                      <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                        Age {(() => {
                          const birth = new Date(profile.dob!);
                          const today = new Date();
                          let age = today.getFullYear() - birth.getFullYear();
                          const m = today.getMonth() - birth.getMonth();
                          if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                          return age;
                        })()}
                      </span>
                    )}
                    {memberSince && (
                      <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                        Member since {memberSince}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: "flex", gap: "24px", flexShrink: 0 }}>
                  {[
                    { icon: <Sparkles size={14} />, value: agents.length, label: "Companions" },
                    { icon: <MessageSquare size={14} />, value: "—", label: "Conversations" },
                    { icon: <Clock size={14} />, value: "—", label: "Call time" },
                  ].map(({ icon, value, label }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", color: "var(--amber)", marginBottom: "2px" }}>
                        {icon}
                        <span style={{ fontSize: "18px", fontWeight: 700, fontFamily: "var(--font-cormorant)" }}>{value}</span>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Your Companions ── */}
            {agents.length > 0 && (
              <section style={{ marginBottom: "48px" }}>
                <div style={{ marginBottom: "20px" }}>
                  <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "var(--amber)", margin: "0 0 4px" }}>
                    Your Companions
                  </p>
                  <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 400, fontFamily: "var(--font-cormorant)", color: "var(--text)" }}>
                    Who would you like to{" "}
                    <em style={{ fontStyle: "italic", color: "var(--amber)" }}>talk to?</em>
                  </h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {agents.map((agent) => (
                    <CompanionCard
                      key={agent.id}
                      agent={agent}
                      onCall={() => router.push(`/call/${agent.id}`)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── Empty state ── */}
            {agents.length === 0 && (
              <div style={{
                textAlign: "center", padding: "60px 24px", marginBottom: "48px",
                background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "20px",
              }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>✨</div>
                <p style={{ fontSize: "22px", fontFamily: "var(--font-cormorant)", color: "var(--text)", margin: "0 0 8px" }}>
                  No companions yet
                </p>
                <p style={{ fontSize: "14px", color: "var(--muted)", margin: 0 }}>
                  Browse the companions below and add one to get started.
                </p>
              </div>
            )}

            {/* ── Mood Check-in + Memory ── */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 340px",
              gap: "16px",
              marginBottom: "48px",
              alignItems: "start",
            }}>
              <MoodCheckIn />
              <MemoryCorner />
            </div>

            {/* ── Discover Companions ── */}
            {availableTemplates.length > 0 && (
              <section>
                <div style={{
                  display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px",
                }}>
                  <div style={{ flex: 1, height: "1px", background: "var(--border2)" }} />
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "var(--muted)", margin: 0 }}>
                      Discover Companions
                    </p>
                  </div>
                  <div style={{ flex: 1, height: "1px", background: "var(--border2)" }} />
                </div>
                <p style={{ fontSize: "13px", color: "var(--muted)", textAlign: "center", marginBottom: "24px", marginTop: "-8px" }}>
                  Each companion has a rich backstory, unique personality, and will remember you across every conversation.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {availableTemplates.map((template) => (
                    <DiscoverCard
                      key={template.id}
                      template={template}
                      onAdd={() => handleAddAgent(template.id)}
                      adding={adding}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
