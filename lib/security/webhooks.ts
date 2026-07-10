import crypto from "crypto";
import { NextRequest } from "next/server";

const MAX_WEBHOOK_AGE_SECONDS = 5 * 60;

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function hasBearerSecret(req: NextRequest, expected: string | undefined): boolean {
  if (!expected) return false;
  const authorization = req.headers.get("authorization");
  const headerSecret = req.headers.get("x-solum-webhook-secret");
  const supplied = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : headerSecret;
  return Boolean(supplied && safeEqual(supplied, expected));
}

export function verifyElevenLabsSignature(
  payload: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, ...value] = part.split("=");
      return [key.trim(), value.join("=").trim()];
    }),
  );
  const timestamp = Number(parts.t);
  const suppliedSignature = parts.v0;
  if (!Number.isFinite(timestamp) || !suppliedSignature) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > MAX_WEBHOOK_AGE_SECONDS) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  return safeEqual(expected, suppliedSignature);
}
