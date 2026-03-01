"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Memory {
  id: string;
  content: string;
  agent_id: string;
  created_at: string;
  agent?: { custom_name?: string; template?: { name?: string; accent_color?: string } };
}

export function MemoryCorner() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("memories")
        .select("*, agent:user_agents(custom_name, template:agent_templates(name, accent_color))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(4);
      setMemories((data as Memory[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("memories").delete().eq("id", id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border2)",
      borderRadius: "20px", padding: "22px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🧠</span>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", margin: 0 }}>
            Memory Corner
          </h3>
        </div>
        <span style={{ fontSize: "11px", color: "var(--muted)" }}>
          {memories.length} saved
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
          <div style={{
            width: "20px", height: "20px", borderRadius: "50%",
            border: "2px solid var(--border2)", borderTopColor: "var(--amber)",
            animation: "spin 0.8s linear infinite",
          }} />
        </div>
      ) : memories.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <p style={{ fontSize: "28px", marginBottom: "8px" }}>💭</p>
          <p style={{ fontSize: "13px", color: "var(--muted)", margin: "0 0 4px" }}>No memories yet</p>
          <p style={{ fontSize: "11px", color: "var(--muted)", margin: 0 }}>
            Start a conversation to build your memory
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {memories.map((m) => {
            const name = m.agent?.custom_name ?? m.agent?.template?.name ?? "Companion";
            const color = m.agent?.template?.accent_color ?? "var(--amber)";
            return (
              <div
                key={m.id}
                style={{
                  background: "var(--surface2)", borderRadius: "10px",
                  padding: "12px", position: "relative",
                }}
                onMouseEnter={e => (e.currentTarget.querySelector(".mem-actions") as HTMLElement | null)?.style && ((e.currentTarget.querySelector(".mem-actions") as HTMLElement).style.opacity = "1")}
                onMouseLeave={e => (e.currentTarget.querySelector(".mem-actions") as HTMLElement | null)?.style && ((e.currentTarget.querySelector(".mem-actions") as HTMLElement).style.opacity = "0")}
              >
                <p style={{ fontSize: "12px", color: "var(--text)", lineHeight: "1.6", margin: "0 0 8px" }}>
                  {m.content}
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", color }}>
                    via {name} · {timeAgo(m.created_at)}
                  </span>
                  <div className="mem-actions" style={{ opacity: 0, transition: "opacity 0.15s", display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleDelete(m.id)}
                      style={{ fontSize: "11px", color: "var(--rose)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer actions */}
      <div style={{ display: "flex", gap: "8px", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border2)" }}>
        <button style={{
          flex: 1, padding: "9px", borderRadius: "8px",
          background: "var(--surface2)", border: "1px solid var(--border2)",
          color: "var(--muted)", fontSize: "12px", cursor: "pointer",
          fontFamily: "var(--font-dm-sans)",
        }}>
          View All
        </button>
        <button style={{
          flex: 1, padding: "9px", borderRadius: "8px",
          background: "var(--surface2)", border: "1px solid var(--border2)",
          color: "var(--muted)", fontSize: "12px", cursor: "pointer",
          fontFamily: "var(--font-dm-sans)",
        }}>
          Export
        </button>
      </div>
    </div>
  );
}
