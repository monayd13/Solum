import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("browser capability policy", () => {
  it("allows same-origin microphone access for Voice Sessions", async () => {
    expect(nextConfig.headers).toBeTypeOf("function");

    const rules = await nextConfig.headers!();
    const allHeaders = rules.flatMap((rule) => rule.headers);
    const permissionsPolicy = allHeaders.find((header) => header.key === "Permissions-Policy");

    expect(permissionsPolicy?.value).toContain("microphone=(self)");
    expect(permissionsPolicy?.value).not.toContain("microphone=()");
  });
});
