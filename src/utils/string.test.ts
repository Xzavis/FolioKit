import { describe, expect, it } from "vitest"

import { decodeEmail } from "./string"

describe("decodeEmail", () => {
  it("decodes a base64-encoded email address", () => {
    expect(decodeEmail("ZmlyZGF1c2tob3RpYnVsemlja3JpYW5AZ21haWwuY29t")).toBe(
      "firdauskhotibulzickrian@gmail.com"
    )
  })

  it("handles plain text email addresses directly", () => {
    expect(decodeEmail("user@example.com")).toBe("user@example.com")
  })

  it("handles empty or null values gracefully", () => {
    expect(decodeEmail("")).toBe("")
    expect(decodeEmail(undefined)).toBe("")
    expect(decodeEmail(null)).toBe("")
  })
})
