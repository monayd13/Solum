"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AgentCard } from "@/components/AgentCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAgent, UserProfile, AgentTemplate } from "@/types";
import { LogOut, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<UserAgent[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: profileData }, { data: agentsData }, { data: templatesData }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("user_agents")
          .select("*, template:agent_templates(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("user_agents").insert({
      user_id: user.id,
      template_id: templateId,
    });

    if (!error) {
      await loadData();
    }
    setAdding(false);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  // Templates not yet added by the user
  const addedTemplateIds = new Set(agents.map((a) => a.template_id));
  const availableTemplates = templates.filter((t) => !addedTemplateIds.has(t.id));

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Top nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 h-14"
        style={{
          background: "rgba(13,11,8,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link
          href="/"
          className="text-xl font-semibold tracking-wider"
          style={{ fontFamily: "var(--font-cormorant)", color: "var(--amber)" }}
        >
          Solum
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs hidden sm:block" style={{ color: "var(--muted)" }}>
            {profile?.full_name ?? ""}
          </span>
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: "var(--surface2)",
              border: "1px solid var(--border2)",
              color: "var(--muted)",
            }}
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <p
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: "var(--amber)" }}
          >
            Your Companions
          </p>
          <h1
            className="text-4xl font-light mb-2"
            style={{ fontFamily: "var(--font-cormorant)", color: "var(--text)" }}
          >
            Who would you like to{" "}
            <em className="italic" style={{ color: "var(--amber)" }}>
              talk to?
            </em>
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Each companion remembers your conversations and grows closer with every call.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent"
              style={{
                borderColor: "var(--border2)",
                borderTopColor: "var(--amber)",
                animation: "spin 0.8s linear infinite",
              }}
            />
          </div>
        ) : (
          <>
            {/* Active agents grid */}
            {agents.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
                {agents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {agents.length === 0 && (
              <div
                className="text-center py-16 rounded-2xl mb-12"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border2)",
                }}
              >
                <p className="text-4xl mb-3">✨</p>
                <p
                  className="text-lg font-light mb-2"
                  style={{ fontFamily: "var(--font-cormorant)", color: "var(--text)" }}
                >
                  No companions yet
                </p>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Add one from the companions below to get started.
                </p>
              </div>
            )}

            {/* Available to add */}
            {availableTemplates.length > 0 && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px" style={{ background: "var(--border2)" }} />
                  <span
                    className="text-xs uppercase tracking-widest whitespace-nowrap"
                    style={{ color: "var(--muted)" }}
                  >
                    Add a Companion
                  </span>
                  <div className="flex-1 h-px" style={{ background: "var(--border2)" }} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {availableTemplates.map((template) => (
                    <button
                      key={template.id}
                      disabled={adding}
                      onClick={() => handleAddAgent(template.id)}
                      className="rounded-2xl p-6 text-left transition-all duration-300 group disabled:opacity-50"
                      style={{
                        background: "var(--surface)",
                        border: `1px solid var(--border2)`,
                        borderTop: `3px solid ${template.accent_color || "var(--amber)"}`,
                      }}
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 transition-transform duration-300 group-hover:scale-110"
                        style={{
                          background: `${template.accent_color || "var(--amber)"}15`,
                          border: `2px solid ${template.accent_color || "var(--amber)"}30`,
                        }}
                      >
                        {template.avatar_emoji || "🤖"}
                      </div>
                      <h3
                        className="text-lg font-semibold mb-0.5"
                        style={{
                          fontFamily: "var(--font-cormorant)",
                          color: template.accent_color || "var(--amber)",
                        }}
                      >
                        {template.name}
                      </h3>
                      <p
                        className="text-xs uppercase tracking-wider mb-3"
                        style={{ color: "var(--muted)" }}
                      >
                        {template.tagline}
                      </p>
                      <div
                        className="flex items-center gap-1.5 text-xs font-medium"
                        style={{ color: template.accent_color || "var(--amber)" }}
                      >
                        <Plus size={12} />
                        Add companion
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
