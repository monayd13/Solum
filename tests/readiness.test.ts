import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "../app/api/health/route";

describe("runtime readiness", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reports ready only after Supabase answers", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-anon-key");
    const fetchMock = vi.fn().mockResolvedValue(new Response('[{"id":"companion"}]', { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      status: "ok",
      checks: { supabase: "healthy" },
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("reports degraded when no callable Companion exists", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-anon-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("[]", { status: 200 })));

    const response = await GET();

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      status: "degraded",
      checks: { supabase: "unhealthy" },
    });
  });
});
