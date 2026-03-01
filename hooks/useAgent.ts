"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserAgent } from "@/types";

export function useAgent(agentId: string) {
  const [agent, setAgent] = useState<UserAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId) return;

    const supabase = createClient();

    async function fetchAgent() {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_agents")
        .select("*, template:agent_templates(*)")
        .eq("id", agentId)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setAgent(data as UserAgent);
      }
      setLoading(false);
    }

    fetchAgent();
  }, [agentId]);

  return { agent, loading, error };
}

export function useUserAgents() {
  const [agents, setAgents] = useState<UserAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchAgents() {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_agents")
        .select("*, template:agent_templates(*)")
        .order("created_at", { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setAgents((data as UserAgent[]) ?? []);
      }
      setLoading(false);
    }

    fetchAgents();
  }, []);

  return { agents, loading, error };
}
