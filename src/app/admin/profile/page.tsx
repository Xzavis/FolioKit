"use client"

// ponytail: singleton profile editor with instant preview and validation
import {
  BriefcaseIcon,
  CameraIcon,
  CheckCircle2Icon,
  ClockIcon,
  EyeIcon,
  FolderOpenIcon,
  GlobeIcon,
  ImageIcon,
  Link2Icon,
  Loader2Icon,
  MapPinIcon,
  PlusIcon,
  RotateCcwIcon,
  SaveIcon,
  SparklesIcon,
  UploadIcon,
  UserIcon,
  VideoIcon,
  XIcon,
} from "lucide-react"
import Link from "next/link"
import React, { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Tag } from "@/components/ui/tag"
import { fetchProfileAction, updateProfileAction, uploadMediaAction } from "@/features/admin/actions/content-actions"
import { AdminDialog } from "@/features/admin/components/admin-dialog"
import { FormField, FormInput, FormTextarea, MediaLibraryModal } from "@/features/admin/components/admin-form-elements"
import { AdminHeader } from "@/features/admin/components/admin-header"
import { useToast } from "@/features/admin/components/admin-toast"
import type { AdminProfile } from "@/features/admin/types/admin"
import { ProfileHeader } from "@/features/portfolio/components/profile-header"
import type { Profile } from "@/lib/content/types"
import { validateImageUrl } from "@/lib/media/image-url"

const DEFAULT_PROFILE_AVATAR = "/image/default-avatar.svg"
const DEFAULT_PROFILE_BANNER = "/dithered-video.webm"

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [original, setOriginal] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { success, error } = useToast()

  // Avatar states
  const [avatarOptionsOpen, setAvatarOptionsOpen] = useState(false)
  const [avatarGalleryOpen, setAvatarGalleryOpen] = useState(false)
  const [isAvatarUploading, setIsAvatarUploading] = useState(false)
  const avatarFileInputRef = useRef<HTMLInputElement>(null)

  // Banner states
  const [bannerOptionsOpen, setBannerOptionsOpen] = useState(false)
  const [bannerGalleryOpen, setBannerGalleryOpen] = useState(false)
  const [isBannerUploading, setIsBannerUploading] = useState(false)
  const bannerFileInputRef = useRef<HTMLInputElement>(null)

  // Bio badges state
  const [newBioTag, setNewBioTag] = useState("")

  const SUGGESTED_BIO_TAGS = [
    "Full Stack Developer",
    "Software Engineer",
    "Next.js & React",
    "TypeScript",
    "AI & Machine Learning",
    "Web Application Creator",
    "Cloud Architecture",
    "Open Source Contributor",
    "UI/UX Design",
  ]

  const parseBioToTags = (bioText?: string): string[] => {
    if (!bioText || !bioText.trim()) return []
    if (bioText.includes(" • ")) {
      return bioText.split(" • ").map((s) => s.trim()).filter(Boolean)
    }
    if (bioText.includes(" | ")) {
      return bioText.split(" | ").map((s) => s.trim()).filter(Boolean)
    }
    if (bioText.includes(",")) {
      return bioText.split(",").map((s) => s.trim()).filter(Boolean)
    }
    return [bioText.trim()]
  }

  const handleAddBioTag = (tagToAdd?: string) => {
    const text = (tagToAdd || newBioTag).trim()
    if (!text || !profile) return
    const currentTags = parseBioToTags(profile.bio)
    if (!currentTags.includes(text)) {
      const updated = [...currentTags, text]
      handleChange("bio", updated.join(" • "))
    }
    setNewBioTag("")
  }

  const handleRemoveBioTag = (tagToRemove: string) => {
    if (!profile) return
    const currentTags = parseBioToTags(profile.bio)
    const updated = currentTags.filter((t) => t !== tagToRemove)
    handleChange("bio", updated.join(" • "))
  }

  // Timezone & Location Real-time system states
  const [tzSuggestion, setTzSuggestion] = useState<string | null>(null)
  const [liveTime, setLiveTime] = useState<string>("")
  const [liveOffset, setLiveOffset] = useState<string>("UTC+7")

  const TIMEZONE_OPTIONS = [
    { value: "Asia/Jakarta", label: "Asia/Jakarta (WIB • UTC+7)" },
    { value: "Asia/Makassar", label: "Asia/Makassar (WITA • UTC+8)" },
    { value: "Asia/Jayapura", label: "Asia/Jayapura (WIT • UTC+9)" },
    { value: "Asia/Singapore", label: "Asia/Singapore (SGT • UTC+8)" },
    { value: "Asia/Tokyo", label: "Asia/Tokyo (JST • UTC+9)" },
    { value: "Europe/London", label: "Europe/London (GMT/BST • UTC+0/+1)" },
    { value: "Europe/Berlin", label: "Europe/Berlin (CET/CEST • UTC+1/+2)" },
    { value: "America/New_York", label: "America/New_York (EST/EDT • UTC-5/-4)" },
    { value: "America/Chicago", label: "America/Chicago (CST/CDT • UTC-6/-5)" },
    { value: "America/Denver", label: "America/Denver (MST/MDT • UTC-7/-6)" },
    { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT • UTC-8/-7)" },
    { value: "Australia/Sydney", label: "Australia/Sydney (AEST/AEDT • UTC+10/+11)" },
    { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  ]

  const LOCATION_PRESETS = [
    { name: "Indonesia", tz: "Asia/Jakarta" },
    { name: "Jakarta, Indonesia", tz: "Asia/Jakarta" },
    { name: "Bandung, Indonesia", tz: "Asia/Jakarta" },
    { name: "Bali, Indonesia", tz: "Asia/Makassar" },
    { name: "Surabaya, Indonesia", tz: "Asia/Jakarta" },
    { name: "Singapore", tz: "Asia/Singapore" },
    { name: "Tokyo, Japan", tz: "Asia/Tokyo" },
    { name: "Remote", tz: "Asia/Jakarta" },
  ]

  const detectTimezoneFromLocation = (loc: string): string | null => {
    const lower = loc.toLowerCase().trim()
    if (
      lower.includes("indonesia") ||
      lower.includes("indonesian") ||
      lower.includes("jakarta") ||
      lower.includes("bandung") ||
      lower.includes("surabaya") ||
      lower.includes("yogyakarta") ||
      lower.includes("semarang") ||
      lower.includes("medan") ||
      lower.includes("palembang")
    ) {
      return "Asia/Jakarta"
    }
    if (
      lower.includes("bali") ||
      lower.includes("denpasar") ||
      lower.includes("makassar") ||
      lower.includes("lombok") ||
      lower.includes("manado") ||
      lower.includes("banjarmasin")
    ) {
      return "Asia/Makassar"
    }
    if (lower.includes("jayapura") || lower.includes("papua") || lower.includes("ambon") || lower.includes("maluku")) {
      return "Asia/Jayapura"
    }
    if (lower.includes("singapore") || lower.includes("singapura")) return "Asia/Singapore"
    if (lower.includes("tokyo") || lower.includes("japan") || lower.includes("jepang")) return "Asia/Tokyo"
    if (lower.includes("london") || lower.includes("uk") || lower.includes("united kingdom")) return "Europe/London"
    if (lower.includes("berlin") || lower.includes("germany") || lower.includes("jerman")) return "Europe/Berlin"
    if (lower.includes("new york") || lower.includes("nyc")) return "America/New_York"
    if (lower.includes("san francisco") || lower.includes("los angeles") || lower.includes("california")) return "America/Los_Angeles"
    if (lower.includes("sydney") || lower.includes("australia")) return "Australia/Sydney"
    return null
  }

  useEffect(() => {
    const tz = profile?.timeZone || "Asia/Jakarta"

    const updateClock = () => {
      const now = new Date()
      try {
        const timeStr = new Intl.DateTimeFormat("en-GB", {
          timeZone: tz,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hourCycle: "h23",
        }).format(now)

        const offsetPart =
          new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            timeZoneName: "shortOffset",
          })
            .formatToParts(now)
            .find((p) => p.type === "timeZoneName")
            ?.value.replace("GMT", "UTC") || "UTC"

        setLiveTime(timeStr)
        setLiveOffset(offsetPart)
      } catch {
        setLiveTime("--:--:--")
        setLiveOffset("UTC")
      }
    }

    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [profile?.timeZone])

  const handleDetectTimezone = () => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (detected) {
        handleChange("timeZone", detected)
        success(`Zona waktu terdeteksi otomatis: ${detected}`)
      }
    } catch {
      error("Tidak dapat mendeteksi zona waktu browser.")
    }
  }

  const handleSelectLocation = (loc: string, tz?: string) => {
    handleChange("address", loc)
    if (tz) {
      handleChange("timeZone", tz)
      setTzSuggestion(null)
    }
  }

  useEffect(() => {
    fetchProfileAction().then((data) => {
      setProfile(data)
      setOriginal(data)
      setLoading(false)
    })
  }, [])

  const handleChange = <K extends keyof AdminProfile>(field: K, value: AdminProfile[K]) => {
    if (!profile) return
    setProfile({ ...profile, [field]: value })
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleReset = () => {
    if (original) {
      setProfile({ ...original })
      setErrors({})
      success("Profile reset to last saved state.")
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsAvatarUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("targetFolder", "image")

    try {
      const res = await uploadMediaAction(formData)
      if (res.success && res.url) {
        handleChange("avatar", res.url)
        success(res.message || "Foto profil berhasil diunggah.")
      } else {
        error(res.message || "Upload foto profil gagal.")
      }
    } catch {
      error("Gagal mengunggah foto profil.")
    } finally {
      setIsAvatarUploading(false)
      if (avatarFileInputRef.current) {
        avatarFileInputRef.current.value = ""
      }
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsBannerUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("targetFolder", "banner")

    try {
      const res = await uploadMediaAction(formData)
      if (res.success && res.url) {
        handleChange("banner", res.url)
        success(res.message || "Cover banner berhasil diunggah.")
      } else {
        error(res.message || "Upload cover banner gagal.")
      }
    } catch {
      error("Gagal mengunggah cover banner.")
    } finally {
      setIsBannerUploading(false)
      if (bannerFileInputRef.current) {
        bannerFileInputRef.current.value = ""
      }
    }
  }

  const handleResetAvatarToDefault = () => {
    handleChange("avatar", DEFAULT_PROFILE_AVATAR)
    success("Foto profil dikembalikan ke foto default.")
  }

  const handleResetBannerToDefault = () => {
    handleChange("banner", DEFAULT_PROFILE_BANNER)
    success("Cover banner dikembalikan ke banner default.")
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!profile?.displayName?.trim()) errs.displayName = "Name is required."
    if (!profile?.username?.trim()) errs.username = "Username / Handle is required."
    if (!profile?.jobTitle?.trim()) errs.jobTitle = "Role / Headline is required."
    if (!profile?.bio?.trim()) errs.bio = "Short Bio is required."

    if (profile?.avatar?.trim()) {
      const avatarCheck = validateImageUrl(profile.avatar)
      if (!avatarCheck.isValid) {
        errs.avatar = avatarCheck.error || "Invalid avatar path or URL."
      }
    }

    if (profile?.banner?.trim()) {
      const bannerCheck = validateImageUrl(profile.banner)
      if (!bannerCheck.isValid) {
        errs.banner = bannerCheck.error || "Invalid cover banner path or URL."
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !profile) return

    setSaving(true)
    try {
      const res = await updateProfileAction(profile)
      if (res.success) {
        setOriginal({ ...profile })
        success(res.message)
      } else {
        error(res.message)
      }
    } catch {
      error("Failed to save profile changes.")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !profile) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Profile Settings" subtitle="Edit your personal details and social presence." />
        <div className="rounded-xl border border-border bg-card p-8 text-center text-xs text-muted-foreground">
          Loading profile information...
        </div>
      </div>
    )
  }

  const isDefaultAvatar = !profile.avatar || profile.avatar === DEFAULT_PROFILE_AVATAR
  const isDefaultBanner = !profile.banner || profile.banner === DEFAULT_PROFILE_BANNER || profile.banner === "/banner.webp"
  const avatarSrc = profile.avatar || DEFAULT_PROFILE_AVATAR
  const bannerSrc = profile.banner || DEFAULT_PROFILE_BANNER
  const isVideoBanner = /\.(webm|mp4|ogg)(\?.*)?$/i.test(bannerSrc)
  const bannerFileName = bannerSrc.split("/").pop() || bannerSrc

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Profile Information"
        subtitle="Manage personal bio, headline, availability, and public identity."
        backHref="/admin"
        backLabel="Back to Overview"
        actions={
          <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)} className="gap-1.5">
            <EyeIcon className="size-3.5" /> Preview
          </Button>
        }
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Header Media Card (WYSIWYG layout matching homepage) */}
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden dark:border-line shadow-xs">
          {/* Header Title / Context */}
          <div className="flex items-center justify-between gap-2 p-4 sm:p-5 border-b border-border/60">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <ImageIcon className="size-4 text-primary" /> Profile Header Media
            </h2>
            <div className="flex items-center gap-2">
              {isDefaultBanner ? (
                <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border/60">
                  Banner Default
                </span>
              ) : (
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Banner Kustom
                </span>
              )}
              {isDefaultAvatar ? (
                <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border/60">
                  Foto Default
                </span>
              ) : (
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Foto Kustom
                </span>
              )}
            </div>
          </div>

          {/* Hidden file inputs for direct uploads */}
          <input
            type="file"
            ref={avatarFileInputRef}
            onChange={handleAvatarUpload}
            accept="image/*"
            className="hidden"
            aria-hidden="true"
            disabled={isAvatarUploading}
          />
          <input
            type="file"
            ref={bannerFileInputRef}
            onChange={handleBannerUpload}
            accept="image/*,video/webm,video/mp4"
            className="hidden"
            aria-hidden="true"
            disabled={isBannerUploading}
          />

          {/* 1. Live Banner on Top (Identical to Homepage Banner Canvas) */}
          <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-black group border-b border-border/60">
            {/* Background Media */}
            {isVideoBanner ? (
              <video
                src={bannerSrc}
                autoPlay
                loop
                muted
                playsInline
                className="size-full object-cover object-center pointer-events-none"
              />
            ) : (
              <img
                src={bannerSrc}
                alt="Cover Banner"
                className="size-full object-cover object-center pointer-events-none"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).src = DEFAULT_PROFILE_BANNER
                }}
              />
            )}

            {/* Overlay Gradient with Controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/25 backdrop-blur-[0.5px] flex flex-col justify-between p-3.5 sm:p-4">
              {/* Top info badges */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-md border border-white/10 shadow-xs">
                    {isVideoBanner ? <VideoIcon className="size-3 text-cyan-400" /> : <ImageIcon className="size-3 text-amber-400" />}
                    <span>{isVideoBanner ? "Video Banner" : "Image Banner"}</span>
                  </span>
                  <span className="text-[10px] text-white/85 font-mono hidden sm:inline bg-black/50 px-2.5 py-0.5 rounded-full backdrop-blur-xs max-w-xs truncate border border-white/10">
                    {bannerFileName}
                  </span>
                </div>
                <span className="text-[10px] text-white/60 font-mono hidden md:inline">
                  {bannerSrc}
                </span>
              </div>

              {/* Bottom: Action Buttons inside the banner (Right-aligned to leave space for overlapping avatar) */}
              <div className="flex items-center justify-end gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  disabled={isBannerUploading}
                  onClick={() => setBannerGalleryOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-black/70 hover:bg-black/90 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md border border-white/20 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  <FolderOpenIcon className="size-3.5 text-zinc-300" />
                  <span>Pilih dari Galeri</span>
                </button>

                <button
                  type="button"
                  disabled={isBannerUploading}
                  onClick={() => bannerFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary/90 px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isBannerUploading ? (
                    <Loader2Icon className="size-3.5 animate-spin" />
                  ) : (
                    <UploadIcon className="size-3.5" />
                  )}
                  <span>{isBannerUploading ? "Mengunggah..." : "Unggah Banner"}</span>
                </button>

                {/* ONLY display delete button if banner is NOT default */}
                {!isDefaultBanner && (
                  <button
                    type="button"
                    onClick={handleResetBannerToDefault}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/80 hover:bg-destructive px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md border border-destructive/40 transition-all shadow-md active:scale-95"
                    title="Hapus dan kembalikan ke banner default"
                  >
                    <RotateCcwIcon className="size-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 2. Half Overlapping Circle Profile Picture (Identical to Homepage Layout) */}
          <div className="relative px-5 pb-5 sm:px-6 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-end gap-3.5">
                {/* Clickable Profile Picture */}
                <div
                  onClick={() => setAvatarOptionsOpen(true)}
                  className="relative -mt-12 sm:-mt-14 size-24 sm:size-28 shrink-0 rounded-full border-4 border-card bg-muted shadow-md overflow-hidden cursor-pointer group transition-transform hover:scale-105 select-none"
                  title="Klik untuk Upload, Galeri, atau Hapus Foto Profil"
                >
                  <img
                    src={avatarSrc}
                    alt={profile.displayName}
                    className="size-full object-cover"
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).src = DEFAULT_PROFILE_AVATAR
                    }}
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <CameraIcon className="size-5" />
                    <span className="text-[10px] font-semibold mt-0.5">Ubah</span>
                  </div>

                  {/* Camera Icon Badge */}
                  <div className="absolute bottom-0 right-0 rounded-full bg-primary p-1.5 text-primary-foreground shadow-md border-2 border-card group-hover:bg-primary/90 transition-colors">
                    <CameraIcon className="size-3.5" />
                  </div>
                </div>

                {/* Information next to avatar */}
                <div className="mb-1 space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground truncate">
                      {profile.displayName || "Your Name"}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      @{profile.username || "username"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Klik foto profil untuk opsi <strong>Upload</strong>, <strong>Galeri</strong>, atau <strong>Hapus</strong>
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="text-right sm:mb-1">
                <span className="text-[11px] font-mono text-muted-foreground truncate block max-w-[220px]" title={avatarSrc}>
                  {avatarSrc}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Identity */}
        <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-line space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <UserIcon className="size-4 text-primary" /> Identity & Headline
          </h2>

          <div className="space-y-4">
            <FormField label="Display Name" required error={errors.displayName}>
              <FormInput
                value={profile.displayName}
                onChange={(e) => handleChange("displayName", e.target.value)}
                placeholder="Xza Abdul Malik Ibrahim"
                error={errors.displayName}
              />
            </FormField>

            <FormField
              label="Username / Handle"
              required
              error={errors.username}
              description="Displays as @username under your name and GitHub Contribution graph on the homepage"
            >
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-semibold text-muted-foreground select-none">
                  @
                </span>
                <FormInput
                  value={profile.username}
                  onChange={(e) => handleChange("username", e.target.value.replace(/^@/, ""))}
                  placeholder="yourusername"
                  error={errors.username}
                  className="pl-7"
                />
              </div>
            </FormField>

            <FormField label="Role / Headline" required error={errors.jobTitle}>
              <FormInput
                value={profile.jobTitle}
                onChange={(e) => handleChange("jobTitle", e.target.value)}
                placeholder="Full Stack Developer"
                error={errors.jobTitle}
              />
            </FormField>

            {/* Location & Real Timezone Configuration */}
            <div className="space-y-3 rounded-lg border border-border/80 bg-muted/20 p-3.5 dark:border-line">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <MapPinIcon className="size-3.5 text-primary" />
                  <span>Lokasi & Sistem Waktu (Footer Colophon & Clock)</span>
                </label>
                <button
                  type="button"
                  onClick={handleDetectTimezone}
                  className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[0.6875rem] font-medium text-primary hover:bg-primary/20 transition-colors"
                  title="Deteksi zona waktu dari perangkat Anda secara otomatis"
                >
                  <SparklesIcon className="size-3" /> Deteksi Otomatis Perangkat
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Location Input */}
                <div className="space-y-1.5">
                  <label className="text-[0.6875rem] font-medium text-muted-foreground flex items-center justify-between">
                    <span>Nama Lokasi / Kota / Negara</span>
                    <span className="text-[0.625rem] text-muted-foreground">(tampil di header & footer)</span>
                  </label>
                  <FormInput
                    value={profile.address}
                    onChange={(e) => {
                      const val = e.target.value
                      handleChange("address", val)
                      const suggestedTz = detectTimezoneFromLocation(val)
                      if (suggestedTz && suggestedTz !== profile.timeZone) {
                        setTzSuggestion(suggestedTz)
                      } else {
                        setTzSuggestion(null)
                      }
                    }}
                    placeholder="Contoh: Indonesia atau Jakarta, Indonesia"
                  />
                  {/* Quick Location Chips */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {LOCATION_PRESETS.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => handleSelectLocation(item.name, item.tz)}
                        className={`rounded px-1.5 py-0.5 text-[0.625rem] font-mono transition-colors ${
                          profile.address === item.name
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        + {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timezone Selection */}
                <div className="space-y-1.5">
                  <label className="text-[0.6875rem] font-medium text-muted-foreground flex items-center justify-between">
                    <span>Zona Waktu IANA (Sistem Jam)</span>
                    <span className="text-[0.625rem] font-mono text-muted-foreground">{profile.timeZone || "Asia/Jakarta"}</span>
                  </label>
                  <select
                    value={profile.timeZone || "Asia/Jakarta"}
                    onChange={(e) => {
                      handleChange("timeZone", e.target.value)
                      setTzSuggestion(null)
                    }}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary dark:border-line"
                  >
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>

                  {tzSuggestion && (
                    <div className="flex items-center justify-between rounded bg-amber-500/10 p-1.5 text-[0.6875rem] text-amber-600 dark:text-amber-400 mt-1">
                      <span>💡 Cocok dengan zona: <strong>{tzSuggestion}</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          handleChange("timeZone", tzSuggestion)
                          setTzSuggestion(null)
                        }}
                        className="underline font-semibold ml-2 hover:opacity-80"
                      >
                        Terapkan
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Real-time Verification Box */}
              <div className="mt-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-[0.75rem] text-foreground flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ClockIcon className="size-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-sm text-foreground">
                        {liveTime}
                      </span>
                      <span className="rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-[0.625rem] px-1 py-0.5">
                        {liveOffset}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[0.6875rem] font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2Icon className="size-3" /> Jam Real-Time Berjalan
                      </span>
                    </div>
                    <div className="text-[0.6875rem] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <span>Tampilan footer: <strong>{liveOffset}</strong> • <strong>{liveTime}</strong> |</span>
                      <GlobeIcon className="size-3 inline text-muted-foreground" />
                      <span><strong>{profile.timeZone || "Asia/Jakarta"}</strong> — <em>{profile.address || "Indonesia"}</em></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <FormField label="Availability Status" description="e.g. Open to opportunities">
              <FormInput
                value={profile.availabilityStatus ?? "Open to opportunities"}
                onChange={(e) => handleChange("availabilityStatus", e.target.value)}
                placeholder="Open to opportunities"
              />
            </FormField>

            <FormField label="Website URL" description="Personal domain / portfolio URL">
              <FormInput
                value={profile.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://example.com"
              />
            </FormField>
          </div>
        </div>

        {/* Bio & About */}
        <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-line space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <BriefcaseIcon className="size-4 text-primary" /> Bio & Narrative
          </h2>

          {/* Relevant Coursework & Skills Badges style for Short Bio */}
          {(() => {
            const currentBioTags = parseBioToTags(profile.bio)
            return (
              <div className="space-y-2 rounded-lg border border-border/80 bg-muted/20 p-3 dark:border-line">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span>Short Bio & SEO Badges</span>
                    <span className="text-muted-foreground font-normal text-[0.6875rem]">
                      (potongan teks untuk SEO & Google)
                    </span>
                    <span className="text-destructive">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {currentBioTags.length} badge(s)
                  </span>
                </div>

                {/* Tag Input */}
                <div className="flex items-center gap-2">
                  <FormInput
                    value={newBioTag}
                    onChange={(e) => setNewBioTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddBioTag()
                      }
                    }}
                    placeholder="Type snippet / keyword (e.g. Full Stack Developer, Next.js) & press Enter..."
                    error={errors.bio}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddBioTag()}
                    className="gap-1 shrink-0"
                  >
                    <PlusIcon className="size-3.5" /> Add
                  </Button>
                </div>
                {errors.bio && (
                  <p className="text-[0.75rem] font-medium text-destructive">{errors.bio}</p>
                )}

                {/* Active Badges List */}
                <div className="flex flex-wrap gap-1.5 pt-1 min-h-6">
                  {currentBioTags.map((tag, sIdx) => (
                    <Tag key={sIdx} className="flex items-center gap-1.5 py-1 px-2.5 text-xs font-mono">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBioTag(tag)}
                        className="text-muted-foreground hover:text-foreground ml-0.5"
                        aria-label={`Remove ${tag}`}
                      >
                        <XIcon className="size-3" />
                      </button>
                    </Tag>
                  ))}
                  {currentBioTags.length === 0 && (
                    <span className="text-xs text-muted-foreground italic py-0.5">
                      Belum ada badge kata kunci. Tambahkan secara manual atau klik saran di bawah.
                    </span>
                  )}
                </div>

                {/* Quick Suggestions Chips */}
                <div className="pt-2 border-t border-border/40">
                  <div className="text-[0.6875rem] font-medium text-muted-foreground mb-1.5">
                    Quick Add Suggestions:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTED_BIO_TAGS.map((suggestion) => {
                      const isAlreadyAdded = currentBioTags.includes(suggestion)
                      return (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleAddBioTag(suggestion)}
                          disabled={isAlreadyAdded}
                          className={`rounded-md px-2 py-0.5 text-[0.6875rem] font-mono transition-colors ${
                            isAlreadyAdded
                              ? "bg-muted/40 text-muted-foreground/50 cursor-not-allowed"
                              : "bg-muted text-muted-foreground hover:bg-muted/90 hover:text-foreground"
                          }`}
                        >
                          + {suggestion}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Info SEO Ringkas */}
                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[0.6875rem] text-muted-foreground">
                  <span className="truncate pr-2">
                    🌐 <strong>SEO Meta Description:</strong> {profile.bio || "Belum ada snippet"}
                  </span>
                  <span className="shrink-0 font-mono text-[0.625rem]">
                    {profile.bio?.length || 0} / 160 kar.
                  </span>
                </div>
              </div>
            )
          })()}

          <FormField
            label="Long Bio (About Section)"
            description="Detailed Markdown narrative shown in the About panel"
          >
            <FormTextarea
              rows={6}
              value={profile.about}
              onChange={(e) => handleChange("about", e.target.value)}
              placeholder="I'm an AI Engineer based in Indonesia, specializing in..."
            />
          </FormField>
        </div>

        {/* Social Links & Web */}
        <div className="rounded-xl border border-border/80 bg-card p-5 dark:border-line space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Link2Icon className="size-4 text-primary" /> Social Links & External Profiles
            </h2>
            <Link
              href="/admin/social-links"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Manage Social Links &rarr;
            </Link>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Public social buttons (GitHub, LinkedIn, Discord, Medium, Hugging Face, etc.) are managed canonically in the{" "}
            <Link href="/admin/social-links" className="text-foreground underline underline-offset-2">
              Social Links manager
            </Link>{" "}
            to ensure ordering, visibility toggles, and icon registry synchronization are always preserved.
          </p>
        </div>

        {/* Form Actions */}
        <div className="sticky bottom-4 z-20 flex items-center justify-end gap-3 rounded-xl border border-border bg-card/90 p-4 shadow-xl backdrop-blur-md dark:border-line">
          <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={saving} className="gap-1.5">
            <RotateCcwIcon className="size-3.5" /> Reset Changes
          </Button>
          <Button type="submit" size="sm" disabled={saving} className="gap-1.5">
            <SaveIcon className="size-3.5" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Live Profile Preview Modal (1:1 identical with public homepage header) */}
      <AdminDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Live Profile Preview"
        maxWidth="lg"
      >
        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <ProfileHeader profile={profile as unknown as Profile} />
        </div>
      </AdminDialog>

      {/* Avatar Options Modal when clicking profile picture */}
      <AdminDialog
        open={avatarOptionsOpen}
        onClose={() => setAvatarOptionsOpen(false)}
        title="Opsi Foto Profil"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3.5 rounded-lg border border-border bg-muted/30 p-3">
            <div className="size-14 rounded-full overflow-hidden border border-border shrink-0 bg-muted">
              <img src={avatarSrc} alt="Avatar Preview" className="size-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">{profile.displayName}</p>
              <p className="text-[11px] text-muted-foreground font-mono truncate">{avatarSrc}</p>
              <span className="text-[10px] text-muted-foreground/80">
                {isDefaultAvatar ? "Menggunakan foto default sistem" : "Foto profil kustom aktif"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setAvatarOptionsOpen(false)
                avatarFileInputRef.current?.click()
              }}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
            >
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <UploadIcon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">Unggah Foto Baru</p>
                <p className="text-[11px] text-muted-foreground">Pilih file gambar dari komputer atau perangkat Anda</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setAvatarOptionsOpen(false)
                setAvatarGalleryOpen(true)
              }}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
            >
              <div className="rounded-md bg-muted p-2 text-foreground">
                <FolderOpenIcon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">Pilih dari Galeri</p>
                <p className="text-[11px] text-muted-foreground">Pilih foto yang telah tersimpan di galeri media</p>
              </div>
            </button>

            {!isDefaultAvatar && (
              <button
                type="button"
                onClick={() => {
                  setAvatarOptionsOpen(false)
                  handleResetAvatarToDefault()
                }}
                className="flex w-full items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-left transition-colors hover:bg-destructive/10 text-destructive"
              >
                <div className="rounded-md bg-destructive/10 p-2 text-destructive">
                  <RotateCcwIcon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">Hapus & Gunakan Default</p>
                  <p className="text-[11px] text-destructive/80">Kembalikan ke foto profil bawaan sistem</p>
                </div>
              </button>
            )}
          </div>
        </div>
      </AdminDialog>

      {/* Banner Options Modal when clicking cover banner */}
      <AdminDialog
        open={bannerOptionsOpen}
        onClose={() => setBannerOptionsOpen(false)}
        title="Opsi Cover Banner"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="relative h-24 w-full overflow-hidden rounded-lg border border-border bg-black">
            {isVideoBanner ? (
              <video
                src={bannerSrc}
                autoPlay
                loop
                muted
                playsInline
                className="size-full object-cover object-center pointer-events-none"
              />
            ) : (
              <img
                src={bannerSrc}
                alt="Banner Preview"
                className="size-full object-cover object-center pointer-events-none"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent flex items-end p-2.5">
              <p className="text-[11px] text-white/90 font-mono truncate">{bannerSrc}</p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setBannerOptionsOpen(false)
                bannerFileInputRef.current?.click()
              }}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
            >
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <UploadIcon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">Unggah Banner Baru</p>
                <p className="text-[11px] text-muted-foreground">Pilih file gambar atau video (WebM/MP4) dari perangkat</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setBannerOptionsOpen(false)
                setBannerGalleryOpen(true)
              }}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
            >
              <div className="rounded-md bg-muted p-2 text-foreground">
                <FolderOpenIcon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">Pilih dari Galeri</p>
                <p className="text-[11px] text-muted-foreground">Pilih banner dari galeri aset media</p>
              </div>
            </button>

            {!isDefaultBanner && (
              <button
                type="button"
                onClick={() => {
                  setBannerOptionsOpen(false)
                  handleResetBannerToDefault()
                }}
                className="flex w-full items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-left transition-colors hover:bg-destructive/10 text-destructive"
              >
                <div className="rounded-md bg-destructive/10 p-2 text-destructive">
                  <RotateCcwIcon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">Hapus & Gunakan Default</p>
                  <p className="text-[11px] text-destructive/80">Kembalikan ke cover banner bawaan sistem</p>
                </div>
              </button>
            )}
          </div>
        </div>
      </AdminDialog>

      {/* Media Library Modal for Avatar */}
      <MediaLibraryModal
        open={avatarGalleryOpen}
        onClose={() => setAvatarGalleryOpen(false)}
        onSelect={(url) => {
          handleChange("avatar", url)
          success("Foto profil berhasil dipilih dari galeri.")
        }}
        currentValue={profile.avatar}
        targetFolder="image"
        accept="image/*"
      />

      {/* Media Library Modal for Banner */}
      <MediaLibraryModal
        open={bannerGalleryOpen}
        onClose={() => setBannerGalleryOpen(false)}
        onSelect={(url) => {
          handleChange("banner", url)
          success("Cover banner berhasil dipilih dari galeri.")
        }}
        currentValue={profile.banner}
        targetFolder="banner"
        accept="image/*,video/webm,video/mp4"
      />
    </div>
  )
}
