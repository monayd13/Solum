import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth })),
}));

import { GET } from "../app/auth/callback/route";
import { getAuthCallbackUrl } from "../lib/auth/redirect";

describe("email confirmation", () => {
  beforeEach(() => {
    auth.exchangeCodeForSession.mockReset();
  });

  it("builds the callback URL from the current deployment origin", () => {
    expect(getAuthCallbackUrl("https://solum-phi.vercel.app/")).toBe(
      "https://solum-phi.vercel.app/auth/callback"
    );
  });

  it("exchanges the confirmation code and redirects to the dashboard", async () => {
    auth.exchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await GET(
      new NextRequest("https://solum-phi.vercel.app/auth/callback?code=confirmation-code")
    );

    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith("confirmation-code");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://solum-phi.vercel.app/dashboard");
  });
});
