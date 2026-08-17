export type SupabaseReadiness = "healthy" | "misconfigured" | "unhealthy" | "unreachable";

export interface RuntimeReadiness {
  checks: {
    supabase: SupabaseReadiness;
  };
}

const READINESS_TIMEOUT_MS = 4_000;

export async function checkRuntimeReadiness(): Promise<RuntimeReadiness> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { checks: { supabase: "misconfigured" } };
  }

  let catalogUrl: URL;
  try {
    catalogUrl = new URL(
      "/rest/v1/agent_templates?select=id&elevenlabs_agent_id=not.is.null&limit=1",
      supabaseUrl,
    );
  } catch {
    return { checks: { supabase: "misconfigured" } };
  }

  try {
    const response = await fetch(catalogUrl, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(READINESS_TIMEOUT_MS),
    });

    if (!response.ok) {
      return { checks: { supabase: "unhealthy" } };
    }

    try {
      const companions: unknown = await response.json();
      const hasCallableCompanion = Array.isArray(companions) && companions.length > 0;
      return { checks: { supabase: hasCallableCompanion ? "healthy" : "unhealthy" } };
    } catch {
      return { checks: { supabase: "unhealthy" } };
    }
  } catch {
    return { checks: { supabase: "unreachable" } };
  }
}
