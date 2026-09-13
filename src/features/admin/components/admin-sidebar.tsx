"use client"

import {
  AwardIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CpuIcon,
  ExternalLinkIcon,
  FolderGit2Icon,
  GraduationCapIcon,
  ImageIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  NewspaperIcon,
  SettingsIcon,
  Share2Icon,
  TrophyIcon,
  UserIcon,
} from "lucide-react"
import { Press_Start_2P } from "next/font/google"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

import { useAdminAuth } from "./admin-auth-guard"

export type AdminNavGroup = "MANAGEMENT" | "CONTENT" | "SYSTEM"

export interface AdminNavItem {
  label: string
  href: string
  icon: typeof LayoutDashboardIcon
}

export const ADMIN_NAV_GROUPS: {
  title: AdminNavGroup
  items: AdminNavItem[]
}[] = [
  {
    title: "MANAGEMENT",
    items: [
      { label: "Overview", href: "/admin", icon: LayoutDashboardIcon },
      { label: "Profile", href: "/admin/profile", icon: UserIcon },
      { label: "Projects", href: "/admin/projects", icon: FolderGit2Icon },
      { label: "Experience", href: "/admin/experience", icon: BriefcaseIcon },
      { label: "Education", href: "/admin/education", icon: GraduationCapIcon },
    ],
  },
  {
    title: "CONTENT",
    items: [
      { label: "Blog", href: "/admin/blog", icon: NewspaperIcon },
      { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
      { label: "Awards", href: "/admin/awards", icon: TrophyIcon },
      { label: "Certifications", href: "/admin/certifications", icon: AwardIcon },
      { label: "Publications", href: "/admin/publications", icon: BookOpenIcon },
      { label: "Skills", href: "/admin/skills", icon: CpuIcon },
      { label: "Social Links", href: "/admin/social-links", icon: Share2Icon },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Settings", href: "/admin/settings", icon: SettingsIcon },
    ],
  },
]

export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap(
  (group) => group.items
)

function FolioKitLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 17.4257V2.57426H1.17391V1.38614H2.15217V0H12.7174V1.38614H14.087V2.77228H15.2609V3.9604H16.6304V5.54455H18V20H2.54348V18.8119H1.36957V17.4257H0ZM2.54348 17.4257V17.8218H3.71739V18.8119H16.6304V6.73267H15.2609L15.0652 17.4257H2.54348ZM1.36957 15.8416H13.6957V6.73267H12.3261V5.14851H10.7609V1.38614H3.32609V2.57426H2.15217V3.76238H1.36957V15.8416Z"
        fill="currentColor"
      />
      <path
        d="M3.91296 10.8911V8.51483H5.86949V10.8911H3.91296Z"
        fill="currentColor"
      />
      <path
        d="M9 10.8911V8.51483H10.9565V10.8911H9Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function AdminSidebar({ className, onItemClick }: { className?: string; onItemClick?: () => void }) {
  const pathname = usePathname()
  const { logout } = useAdminAuth()

  return (
    <aside className={cn("flex flex-col h-full border-r border-border bg-card dark:border-line", className)}>
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-border/80 px-4 dark:border-line">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 text-foreground hover:opacity-90 transition-opacity"
        >
          <FolioKitLogo className="w-[22px] h-[24.5px] shrink-0 text-foreground [image-rendering:pixelated]" />
          <span
            className={cn(
              pressStart2P.className,
              "text-[0.875rem] tracking-tight text-foreground select-none pt-0.5"
            )}
          >
            FolioKit
          </span>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-3.5 p-3 overflow-y-auto">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-2 py-1 text-[0.6875rem] font-mono text-muted-foreground uppercase tracking-wider select-none">
              {group.title}
            </div>
            {group.items.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer / Exit Links */}
      <div className="border-t border-border/80 p-3 space-y-1 dark:border-line">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ExternalLinkIcon className="size-3.5" />
          <span>Live Website</span>
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
        >
          <LogOutIcon className="size-3.5" />
          <span>Lock / Log Out</span>
        </button>
      </div>
    </aside>
  )
}
