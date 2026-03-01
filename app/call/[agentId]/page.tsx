"use client";

import { useParams, useRouter } from "next/navigation";
import { useAgent } from "@/hooks/useAgent";
import { CallInterface } from "@/components/CallInterface";
import { useEffect } from "react";

export default function CallPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.agentId as string;
  const { agent, loading, error } = useAgent(agentId);

  useEffect(() => {
    if (!loading && !agent && !error) {
      router.push("/dashboard");
    }
  }, [agent, loading, error, router]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent"
          style={{
            borderColor: "var(--border2)",
            borderTopColor: "var(--amber)",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <div className="text-center">
          <p className="text-4xl mb-3">😕</p>
          <p style={{ color: "var(--muted)" }}>Agent not found.</p>
        </div>
      </div>
    );
  }

  return <CallInterface agent={agent} />;
}
