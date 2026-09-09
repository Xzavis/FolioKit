// ponytail: safe decode email that handles plain-text emails, base64 strings, or empty input without throwing
export function decodeEmail(email: string | undefined | null): string {
  if (!email) return ""
  const trimmed = email.trim()
  if (trimmed.includes("@")) return trimmed
  try {
    if (typeof atob === "function") {
      const decoded = atob(trimmed)
      if (decoded.includes("@")) return decoded
    }
  } catch {
    // fallback to original
  }
  return trimmed
}

