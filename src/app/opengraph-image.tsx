import { ImageResponse } from "next/og"

import profile from "@/content/profile.json"

import { PROFILE_IMAGE_DATA_URI } from "./seo-logo-loader"

export const alt = `${profile.displayName} - ${profile.jobTitle}`
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function OpengraphImage() {
  const displayDomain = profile.website
    ? profile.website.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : profile.username || "portfolio"

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "80px",
          backgroundColor: "#09090b",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <img
            src={PROFILE_IMAGE_DATA_URI}
            alt={profile.displayName}
            width={120}
            height={120}
            style={{
              borderRadius: "50%",
              border: "3px solid #27272a",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span
              style={{
                fontSize: 24,
                color: "#71717a",
                fontFamily: "monospace",
              }}
            >
              @{profile.username}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.1,
            }}
          >
            {profile.displayName}
          </div>
          <div style={{ fontSize: 32, color: "#a1a1aa" }}>{profile.jobTitle}</div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 20,
            color: "#71717a",
            fontFamily: "monospace",
          }}
        >
          {displayDomain}
        </div>
      </div>
    ),
    { ...size }
  )
}
