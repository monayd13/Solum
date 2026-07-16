import crypto from "crypto";
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { hasBearerSecret, verifyElevenLabsSignature } from "../lib/security/webhooks";
import { isAdultDob, normalizeOptionalPhone, UUID_PATTERN, validateTranscript } from "../lib/validation";

describe("webhook verification", () => {
  it("accepts a current valid ElevenLabs signature", () => {
    const secret = "test-secret";
    const payload = JSON.stringify({ type: "post_call_transcription" });
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto.createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
    expect(verifyElevenLabsSignature(payload, `t=${timestamp},v0=${signature}`, secret)).toBe(true);
  });

  it("rejects malformed, incorrect, and replayed signatures without throwing", () => {
    const payload = "{}";
    const timestamp = Math.floor(Date.now() / 1000) - 600;
    expect(verifyElevenLabsSignature(payload, null, "secret")).toBe(false);
    expect(verifyElevenLabsSignature(payload, `t=${timestamp},v0=short`, "secret")).toBe(false);
  });

  it("requires an exact bearer secret", () => {
    const accepted = new NextRequest("https://solum.example/api/internal", { headers: { authorization: "Bearer exact-secret" } });
    const rejected = new NextRequest("https://solum.example/api/internal", { headers: { authorization: "Bearer wrong" } });
    expect(hasBearerSecret(accepted, "exact-secret")).toBe(true);
    expect(hasBearerSecret(rejected, "exact-secret")).toBe(false);
    expect(hasBearerSecret(accepted, undefined)).toBe(false);
  });
});

describe("input validation", () => {
  it("normalizes E.164-compatible formatting and rejects invalid phone numbers", () => {
    expect(normalizeOptionalPhone("+1 (555) 123-4567")).toBe("+15551234567");
    expect(normalizeOptionalPhone("555-1234")).toBeUndefined();
    expect(normalizeOptionalPhone(15551234567)).toBeUndefined();
  });

  it("enforces adult dates of birth", () => {
    expect(isAdultDob("2000-01-01")).toBe(true);
    expect(isAdultDob("2020-01-01")).toBe(false);
    expect(isAdultDob("not-a-date")).toBe(false);
  });

  it("recognizes canonical UUIDs", () => {
    expect(UUID_PATTERN.test("2d931510-d99f-494a-8c67-87feb05e1594")).toBe(true);
    expect(UUID_PATTERN.test("not-a-uuid")).toBe(false);
  });

  it("normalizes valid call transcripts and rejects unsafe payloads", () => {
    expect(validateTranscript([{ role: "user", content: "  Hello there  " }, { role: "agent", content: "Hi" }])).toEqual([
      { role: "user", content: "Hello there" },
      { role: "assistant", content: "Hi" },
    ]);
    expect(validateTranscript([{ role: "system", content: "hidden" }])).toBeNull();
    expect(validateTranscript([{ role: "user", content: "x".repeat(2_001) }])).toBeNull();
  });
});
