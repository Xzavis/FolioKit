import {
  AstroidIcon,
  AwardIcon,
  BarChart3Icon,
  BookOpenIcon,
  BriefcaseBusinessIcon,
  Building2Icon,
  Code2Icon,
  FlaskConicalIcon,
  GraduationCapIcon,
  LaptopIcon,
  LibraryIcon,
  LightbulbIcon,
  MedalIcon,
  NetworkIcon,
  RocketIcon,
  SchoolIcon,
  ScrollIcon,
  UsersIcon,
} from "lucide-react"
import React from "react"

import { Icons } from "@/components/icons"

interface IconRegistryProps extends React.HTMLAttributes<SVGElement> {
  name?: string
  fallback?: React.ReactNode
}

/**
 * Centralized Icon Registry that resolves string icon identifiers
 * from serializable content (JSON) to their corresponding Lucide or custom SVG components.
 */
export function IconRegistry({ name, className, fallback, ...props }: IconRegistryProps) {
  if (!name) {
    return <>{fallback ?? <BriefcaseBusinessIcon className={className} {...props} />}</>
  }

  const normalized = name.toLowerCase().trim()

  switch (normalized) {
    // ─── Experience & Education Position Icons ──────────────────────────────
    case "astroid":
    case "asteroid":
      return <AstroidIcon className={className} {...props} />

    case "flask":
    case "flask-conical":
    case "flaskconical":
      return <FlaskConicalIcon className={className} {...props} />

    case "network":
      return <NetworkIcon className={className} {...props} />

    case "chart":
    case "barchart3":
    case "bar-chart-3":
    case "bar-chart":
      return <BarChart3Icon className={className} {...props} />

    case "users":
      return <UsersIcon className={className} {...props} />

    case "graduation":
    case "graduation-cap":
    case "graduationcap":
      return <GraduationCapIcon className={className} {...props} />

    case "school":
      return <SchoolIcon className={className} {...props} />

    case "briefcase":
    case "briefcase-business":
      return <BriefcaseBusinessIcon className={className} {...props} />

    case "book-open":
    case "book":
      return <BookOpenIcon className={className} {...props} />

    case "library":
      return <LibraryIcon className={className} {...props} />

    case "award":
      return <AwardIcon className={className} {...props} />

    case "medal":
      return <MedalIcon className={className} {...props} />

    case "scroll":
    case "diploma":
      return <ScrollIcon className={className} {...props} />

    case "code":
    case "code-2":
    case "code2":
      return <Code2Icon className={className} {...props} />

    case "laptop":
      return <LaptopIcon className={className} {...props} />

    case "rocket":
      return <RocketIcon className={className} {...props} />

    case "building":
    case "building-2":
    case "building2":
      return <Building2Icon className={className} {...props} />

    case "lightbulb":
      return <LightbulbIcon className={className} {...props} />

    // ─── Social Platform Icons ───────────────────────────────────────────────
    case "github":
      return <Icons.github className={className} {...props} />

    case "linkedin":
      return <Icons.linkedin className={className} {...props} />

    case "discord":
      return <Icons.discord className={className} {...props} />

    case "medium":
      return <Icons.medium className={className} {...props} />

    case "email":
    case "mail":
      return <Icons.email className={className} {...props} />

    case "huggingface":
    case "hugging-face":
      return <Icons.huggingface className={className} {...props} />

    case "github-copilot":
    case "githubcopilot":
      return <Icons.githubCopilot className={className} {...props} />

    case "claude":
    case "claude-code":
    case "claudecode":
      return <Icons.claudeCode className={className} {...props} />

    case "instagram":
      return <Icons.instagram className={className} {...props} />

    case "x":
    case "twitter":
      return <Icons.x className={className} {...props} />

    case "tiktok":
      return <Icons.tiktok className={className} {...props} />

    case "threads":
      return <Icons.threads className={className} {...props} />

    case "youtube":
      return <Icons.youtube className={className} {...props} />

    case "telegram":
      return <Icons.telegram className={className} {...props} />

    case "behance":
      return <Icons.behance className={className} {...props} />

    case "dribbble":
      return <Icons.dribbble className={className} {...props} />

    case "kaggle":
      return <Icons.kaggle className={className} {...props} />

    case "website":
    case "portfolio":
      return <Icons.website className={className} {...props} />

    default:
      return <>{fallback ?? <BriefcaseBusinessIcon className={className} {...props} />}</>
  }
}
