export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const E164_PATTERN = /^\+[1-9]\d{7,14}$/;
export const PROFILE_GENDERS = new Set(["female", "male", "non-binary", "other"]);

export function normalizeOptionalPhone(value: unknown): string | null | undefined {
  if (value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const phone = value.replace(/[\s().-]/g, "");
  return E164_PATTERN.test(phone) ? phone : undefined;
}

export function isAdultDob(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const birth = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(birth.getTime())) return false;
  const cutoff = new Date();
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 18);
  return birth <= cutoff;
}
