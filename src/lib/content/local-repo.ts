import "server-only"

import fs from "node:fs/promises"
import path from "node:path"

import { normalizeTechName } from "@/config/technology-catalog"
import type {
  AdminEducation,
  AdminExperience,
  AdminProfile,
  AdminProject,
  AdminSkill,
  AdminSocialLink,
  ContentStatus,
  SiteSettings as AdminSiteSettings,
} from "@/features/admin/types/admin"
import { validateImageUrl } from "@/lib/media/image-url"

import type {
  Award,
  BlogPost,
  Certification,
  Education,
  Experience,
  GalleryItem,
  Profile,
  Project,
  Publication,
  SiteSettings,
  SocialLink,
  TechStack,
} from "./types"

const CONTENT_DIR = path.join(process.cwd(), "content")
const PROJECTS_DIR = path.join(CONTENT_DIR, "projects")
const EXPERIENCES_DIR = path.join(CONTENT_DIR, "experiences")
const EDUCATION_DIR = path.join(CONTENT_DIR, "education")

// ponytail: dynamic content repository with zero hardcoded project/experience lists


async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, "utf-8")
  return JSON.parse(content) as T
}

async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath))
  const content = JSON.stringify(data, null, 2) + "\n"
  const tempPath = `${filePath}.tmp.${Date.now()}`
  try {
    await fs.writeFile(tempPath, content, "utf-8")
    await fs.rename(tempPath, filePath)
  } catch {
    await fs.writeFile(filePath, content, "utf-8")
    try {
      await fs.unlink(tempPath)
    } catch {
      // ignore temp cleanup error
    }
  }
}

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function mapSkillCategory(cats: string[] | string | undefined): AdminSkill["category"] {
  const primary = Array.isArray(cats) ? cats[0] || "" : cats || ""
  if (primary.includes("AI") || primary.includes("ML") || primary.includes("Machine")) return "AI / ML"
  if (primary.includes("Frontend") || primary.includes("Web") || primary.includes("UI")) return "Frontend"
  if (primary.includes("Backend") || primary.includes("Server") || primary.includes("API")) return "Backend"
  if (primary.includes("Database") || primary.includes("Data") || primary.includes("SQL")) return "Database"
  if (primary.includes("DevOps") || primary.includes("Cloud") || primary.includes("Infra")) return "DevOps / Cloud"
  if (primary.includes("Test") || primary.includes("QA")) return "Testing"
  if (primary.includes("Design") || primary.includes("Figma")) return "Design / UI"
  return "AI / ML"
}

function mapAdminCategoryToPublic(cat: AdminSkill["category"]): string {
  return cat
}

// LocalContentRepository: Single source of truth for reading and writing content JSON files directly on disk.
export const localRepo = {
  // ─── Profile & Site Settings ────────────────────────────────────────────────

  async getProfile(): Promise<Profile> {
    return readJsonFile<Profile>(path.join(CONTENT_DIR, "profile.json"))
  },

  async getAdminProfile(): Promise<AdminProfile> {
    const profile = await this.getProfile()
    const settings = await this.getSettings()

    // Social URLs (GitHub, LinkedIn, etc.) are canonical in social-links.json.
    // They are intentionally NOT included here to avoid dual-ownership.
    return {
      ...profile,
      dateCreated: profile.dateCreated || "2023-11-01T00:00:00Z",
      sameAs: profile.sameAs || [],
      gender: (profile.gender as AdminProfile["gender"]) || "male",
      headline: profile.jobTitle,
      // Read from profile.json — do not hardcode
      availabilityStatus: profile.availabilityStatus || "",
      shortBio: profile.bio,
      longBio: profile.about,
      keywords: settings.keywords || [],
      ogImage: settings.ogImage || "/og.png",
      seoTitle: settings.seoTitle || profile.displayName,
      seoDescription: settings.seoDescription || profile.bio,
    }
  },

  async saveProfile(profile: Partial<AdminProfile> & { displayName: string }): Promise<void> {
    const current = await this.getProfile()
    const settings = await this.getSettings()

    // Validate avatar if provided
    const targetAvatar = profile.avatar ?? current.avatar
    if (targetAvatar) {
      const avatarCheck = validateImageUrl(targetAvatar)
      if (!avatarCheck.isValid) {
        throw new Error(`Avatar image error: ${avatarCheck.error}`)
      }
    }

    // Validate banner if provided
    const targetBanner = profile.banner ?? current.banner
    if (targetBanner) {
      const bannerCheck = validateImageUrl(targetBanner)
      if (!bannerCheck.isValid) {
        throw new Error(`Cover banner image error: ${bannerCheck.error}`)
      }
    }

    // Lossless merge preserving all canonical fields
    const updatedProfile: Profile = {
      ...current,
      ...profile,
      displayName: profile.displayName ?? current.displayName,
      firstName: profile.firstName ?? current.firstName,
      lastName: profile.lastName ?? current.lastName,
      username: profile.username ? profile.username.replace(/^@/, "").trim() : current.username,
      gender: profile.gender ?? current.gender,
      pronouns: profile.pronouns ?? current.pronouns,
      bio: profile.bio ?? profile.shortBio ?? current.bio,
      bioId: profile.bioId ?? current.bioId,
      flipSentences: profile.flipSentences ?? current.flipSentences,
      flipSentencesId: profile.flipSentencesId ?? current.flipSentencesId,
      address: profile.address ?? current.address,
      phone: profile.phone ?? current.phone,
      email: profile.email ?? current.email,
      website: profile.website ?? current.website,
      jobTitle: profile.jobTitle ?? profile.headline ?? current.jobTitle,
      jobs: profile.jobs ?? current.jobs,
      about: profile.about ?? profile.longBio ?? current.about,
      aboutId: profile.aboutId ?? current.aboutId,
      avatar: targetAvatar,
      banner: targetBanner,
      sameAs: profile.sameAs ?? current.sameAs ?? [],
      timeZone: profile.timeZone ?? current.timeZone,
      dateCreated: current.dateCreated || profile.dateCreated || "2023-11-01T00:00:00Z",
      dateModified: new Date().toISOString(),
    }

    await writeJsonFile(path.join(CONTENT_DIR, "profile.json"), updatedProfile)

    // Sync SEO keywords/title if provided in the admin profile form
    if (profile.keywords || profile.seoTitle || profile.seoDescription || profile.ogImage) {
      const updatedSettings: SiteSettings = {
        ...settings,
        seoTitle: profile.seoTitle ?? settings.seoTitle,
        seoDescription: profile.seoDescription ?? settings.seoDescription,
        ogImage: profile.ogImage ?? settings.ogImage,
        keywords: profile.keywords ?? settings.keywords,
      }
      await writeJsonFile(path.join(CONTENT_DIR, "settings.json"), updatedSettings)
    }
  },

  // ─── Settings ──────────────────────────────────────────────────────────────

  async getSettings(): Promise<SiteSettings> {
    return readJsonFile<SiteSettings>(path.join(CONTENT_DIR, "settings.json"))
  },

  async getAdminSettings(): Promise<AdminSiteSettings> {
    const settings = await this.getSettings()
    return {
      siteTitle: settings.seoTitle,
      siteDescription: settings.seoDescription,
      favicon: settings.favicon || "/favicon.ico",
      ogImage: settings.ogImage || "/og.png",
      metaTitle: settings.seoTitle,
      metaDescription: settings.seoDescription,
      keywords: settings.keywords || [],
      autoPublish: false,
      previewDeployment: true,
      githubRepo: "yourusername/portfolio",
    }
  },


  async saveSettings(settings: Partial<AdminSiteSettings>): Promise<void> {
    const current = await this.getSettings()
    const cleanSettings: SiteSettings = {
      seoTitle: settings.siteTitle || current.seoTitle,
      seoDescription: settings.siteDescription || current.seoDescription,
      keywords: settings.keywords || current.keywords,
      ogImage: settings.ogImage || current.ogImage,
      favicon: settings.favicon || current.favicon,
    }
    await writeJsonFile(path.join(CONTENT_DIR, "settings.json"), cleanSettings)
  },

  // ─── Projects ──────────────────────────────────────────────────────────────

  async getAllProjects(): Promise<Project[]> {
    try {
      await ensureDir(PROJECTS_DIR)
      const files = await fs.readdir(PROJECTS_DIR)
      const jsonFiles = files.filter((f) => f.endsWith(".json") && f !== "order.json")

      // ponytail: read order from order.json or fall back to natural sorting
      let orderList: string[] = []
      try {
        const orderData = await readJsonFile<string[]>(path.join(PROJECTS_DIR, "order.json"))
        if (Array.isArray(orderData) && orderData.length > 0) {
          orderList = orderData
        }
      } catch {
        // no order.json file
      }

      const projects = await Promise.all(
        jsonFiles.map(async (file) => {
          try {
            return await readJsonFile<Project>(path.join(PROJECTS_DIR, file))
          } catch {
            return null
          }
        })
      )

      const validProjects = projects.filter((p): p is Project => p !== null)

      // Maintain dynamic persisted ordering
      return validProjects.sort((a, b) => {
        if (orderList.length > 0) {
          const aIndex = orderList.indexOf(a.id)
          const bIndex = orderList.indexOf(b.id)
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
          if (aIndex !== -1) return -1
          if (bIndex !== -1) return 1
        }
        return a.title.localeCompare(b.title)
      })
    } catch {
      return []
    }
  },

  async getProjects(): Promise<Project[]> {
    const all = await this.getAllProjects()
    return all.filter((p) => !p.status || p.status === "published")
  },

  async getAdminProjects(): Promise<AdminProject[]> {
    const projects = await this.getAllProjects()
    return projects.map((project, idx) => ({
      ...project,
      status: (project.status as ContentStatus) || "published",
      displayOrder: project.displayOrder ?? idx + 1,
      updatedAt:
        (project as AdminProject).updatedAt ||
        new Date(Date.now() - idx * 86400000).toISOString(),
    }))
  },

  async reorderProjects(orderedProjectsOrIds: (AdminProject | Project)[] | string[]): Promise<AdminProject[]> {
    const ids = orderedProjectsOrIds.map((item) => (typeof item === "string" ? item : item.id))
    await writeJsonFile(path.join(PROJECTS_DIR, "order.json"), ids)
    return await this.getAdminProjects()
  },

  async getProjectById(id: string): Promise<Project | null> {
    try {
      const slug = normalizeSlug(id)
      const filePath = path.join(PROJECTS_DIR, `${slug}.json`)
      return await readJsonFile<Project>(filePath)
    } catch {
      return null
    }
  },

  async saveProject(project: AdminProject | Project): Promise<{ id: string }> {
    const slug = normalizeSlug(project.id || project.title)
    if (!slug) {
      throw new Error("Project ID or title is required to generate a slug.")
    }

    // Validate project images
    if (project.image) {
      const imgCheck = validateImageUrl(project.image)
      if (!imgCheck.isValid) {
        throw new Error(`Project cover image error: ${imgCheck.error}`)
      }
    }
    if (project.logo) {
      const logoCheck = validateImageUrl(project.logo)
      if (!logoCheck.isValid) {
        throw new Error(`Project logo error: ${logoCheck.error}`)
      }
    }
    if (Array.isArray(project.gallery)) {
      for (const item of project.gallery) {
        if (typeof item === "string" && item.trim()) {
          const galleryCheck = validateImageUrl(item)
          if (!galleryCheck.isValid) {
            throw new Error(`Project gallery item error: ${galleryCheck.error}`)
          }
        }
      }
    }

    const cleanProject: Project & { status?: ContentStatus; displayOrder?: number; updatedAt?: string } = {
      id: slug,
      title: project.title,
      category: project.category || "AI / Full Stack",
      categoryId: project.categoryId,
      tagline: project.tagline || "",
      taglineId: project.taglineId,
      seoDescription: project.seoDescription || project.tagline,
      year: String(project.year || new Date().getFullYear()),
      image: project.image || "/banner.webp",
      logo: project.logo,
      videoEmbed: project.videoEmbed,
      period: project.period || { start: String(new Date().getFullYear()) },
      link: project.link || "",
      links: project.links || { repo: project.link || "", live: "" },
      skills: project.skills || [],
      coverSkills: project.coverSkills || [],
      features: project.features || [],
      featuresId: project.featuresId,
      impact: project.impact || [],
      impactId: project.impactId,
      collaboration: project.collaboration || {
        ownership: "Solo project",
        label: "Solo",
        team: "Personal Project",
        role: "Full Stack AI Engineer",
        contributions: ["Architected and built end-to-end solution"],
      },
      description: project.description || "",
      notes: project.notes,
      notesId: project.notesId,
      isExpanded: project.isExpanded ?? true,
      badge: project.badge,
      badgeId: project.badgeId,
      gallery: project.gallery || [],
      status: (project as AdminProject).status || "published",
      featured: (project as AdminProject).featured ?? true,
      displayOrder: (project as AdminProject).displayOrder ?? 1,
      updatedAt: (project as AdminProject).updatedAt || new Date().toISOString(),
    }

    const filePath = path.join(PROJECTS_DIR, `${slug}.json`)
    await writeJsonFile(filePath, cleanProject)

    // Ensure newly saved project is added to order list if not present
    try {
      const orderFile = path.join(PROJECTS_DIR, "order.json")
      const order = await readJsonFile<string[]>(orderFile)
      if (Array.isArray(order) && !order.includes(slug)) {
        order.unshift(slug)
        await writeJsonFile(orderFile, order)
      }
    } catch {
      // ignore
    }

    return { id: slug }
  },

  async deleteProject(id: string): Promise<void> {
    const slug = normalizeSlug(id)
    const filePath = path.join(PROJECTS_DIR, `${slug}.json`)
    try {
      await fs.unlink(filePath)
    } catch (err: unknown) {
      const nodeErr = err as { code?: string }
      if (nodeErr.code !== "ENOENT") {
        throw err
      }
    }

    try {
      const orderFile = path.join(PROJECTS_DIR, "order.json")
      let order = await readJsonFile<string[]>(orderFile)
      if (Array.isArray(order)) {
        order = order.filter((item) => item !== slug)
        await writeJsonFile(orderFile, order)
      }
    } catch {
      // ignore
    }
  },

  // ─── Experiences ───────────────────────────────────────────────────────────

  async getExperiences(): Promise<Experience[]> {
    try {
      await ensureDir(EXPERIENCES_DIR)
      const files = await fs.readdir(EXPERIENCES_DIR)
      const jsonFiles = files.filter((f) => f.endsWith(".json") && f !== "order.json")

      // ponytail: read order from order.json or fall back to natural sorting
      let orderList: string[] = []
      try {
        const orderData = await readJsonFile<string[]>(path.join(EXPERIENCES_DIR, "order.json"))
        if (Array.isArray(orderData) && orderData.length > 0) {
          orderList = orderData
        }
      } catch {
        // no order.json file
      }

      const experiences = await Promise.all(
        jsonFiles.map(async (file) => {
          try {
            return await readJsonFile<Experience>(path.join(EXPERIENCES_DIR, file))
          } catch {
            return null
          }
        })
      )

      const validExperiences = experiences.filter((e): e is Experience => e !== null)

      // Maintain dynamic persisted ordering
      return validExperiences.sort((a, b) => {
        if (orderList.length > 0) {
          const aIndex = orderList.indexOf(a.id)
          const bIndex = orderList.indexOf(b.id)
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
          if (aIndex !== -1) return -1
          if (bIndex !== -1) return 1
        }
        return 0
      })
    } catch {
      return []
    }
  },

  async getAdminExperiences(): Promise<AdminExperience[]> {
    const experiences = await this.getExperiences()
    return experiences.map((exp, idx) => ({
      ...exp,
      status: "published",
      displayOrder: idx + 1,
      updatedAt: new Date(Date.now() - idx * 172800000).toISOString(),
    }))
  },

  async reorderExperiences(orderedExperiencesOrIds: (AdminExperience | Experience)[] | string[]): Promise<AdminExperience[]> {
    const ids = orderedExperiencesOrIds.map((item) => (typeof item === "string" ? item : item.id))
    await writeJsonFile(path.join(EXPERIENCES_DIR, "order.json"), ids)
    return await this.getAdminExperiences()
  },

  async getExperienceById(id: string): Promise<Experience | null> {
    try {
      const slug = normalizeSlug(id)
      const filePath = path.join(EXPERIENCES_DIR, `${slug}.json`)
      return await readJsonFile<Experience>(filePath)
    } catch {
      return null
    }
  },

  async saveExperience(experience: AdminExperience | Experience): Promise<{ id: string }> {
    const slug = normalizeSlug(experience.id || experience.companyName)
    if (!slug) {
      throw new Error("Experience ID or company name is required.")
    }

    if (experience.companyLogo) {
      const logoCheck = validateImageUrl(experience.companyLogo)
      if (!logoCheck.isValid) {
        throw new Error(`Company logo image error: ${logoCheck.error}`)
      }
    }

    const cleanExperience: Experience = {
      id: slug,
      companyName: experience.companyName,
      companyLogo: experience.companyLogo || "",
      companyWebsite: experience.companyWebsite || "",
      positions: experience.positions.map((pos, idx) => ({
        id: pos.id || `${slug}-${idx + 1}`,
        title: pos.title,
        employmentPeriod: pos.employmentPeriod,
        employmentType: pos.employmentType,
        icon: typeof pos.icon === "string" ? pos.icon : "briefcase",
        description: pos.description || "",
        descriptionId: pos.descriptionId,
        skills: pos.skills,
      })),
      isCurrentEmployer: experience.isCurrentEmployer ?? false,
    }

    const filePath = path.join(EXPERIENCES_DIR, `${slug}.json`)
    await writeJsonFile(filePath, cleanExperience)

    // Ensure newly saved experience is added to order list if not present
    try {
      const orderFile = path.join(EXPERIENCES_DIR, "order.json")
      const order = await readJsonFile<string[]>(orderFile)
      if (Array.isArray(order) && !order.includes(slug)) {
        order.unshift(slug)
        await writeJsonFile(orderFile, order)
      }
    } catch {
      // ignore
    }

    return { id: slug }
  },

  async deleteExperience(id: string): Promise<void> {
    const slug = normalizeSlug(id)
    const filePath = path.join(EXPERIENCES_DIR, `${slug}.json`)
    try {
      await fs.unlink(filePath)
    } catch (err: unknown) {
      const nodeErr = err as { code?: string }
      if (nodeErr.code !== "ENOENT") {
        throw err
      }
    }

    try {
      const orderFile = path.join(EXPERIENCES_DIR, "order.json")
      let order = await readJsonFile<string[]>(orderFile)
      if (Array.isArray(order)) {
        order = order.filter((item) => item !== slug)
        await writeJsonFile(orderFile, order)
      }
    } catch {
      // ignore
    }
  },

  // ─── Education ─────────────────────────────────────────────────────────────

  async getEducations(): Promise<Education[]> {
    try {
      await ensureDir(EDUCATION_DIR)
      const files = await fs.readdir(EDUCATION_DIR)
      const jsonFiles = files.filter((f) => f.endsWith(".json") && f !== "order.json")

      let orderList: string[] = []
      try {
        const orderData = await readJsonFile<string[]>(path.join(EDUCATION_DIR, "order.json"))
        if (Array.isArray(orderData) && orderData.length > 0) {
          orderList = orderData
        }
      } catch {
        // no order.json file
      }

      const educations = await Promise.all(
        jsonFiles.map(async (file) => {
          try {
            return await readJsonFile<Education>(path.join(EDUCATION_DIR, file))
          } catch {
            return null
          }
        })
      )

      const validEducations = educations.filter((e): e is Education => e !== null)

      return validEducations.sort((a, b) => {
        if (orderList.length > 0) {
          const aIndex = orderList.indexOf(a.id)
          const bIndex = orderList.indexOf(b.id)
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
          if (aIndex !== -1) return -1
          if (bIndex !== -1) return 1
        }
        return 0
      })
    } catch {
      return []
    }
  },

  async getAdminEducations(): Promise<AdminEducation[]> {
    const educations = await this.getEducations()
    return educations.map((edu, idx) => ({
      ...edu,
      status: "published",
      displayOrder: idx + 1,
      updatedAt: new Date(Date.now() - idx * 172800000).toISOString(),
    }))
  },

  async reorderEducations(
    orderedEducationsOrIds: (AdminEducation | Education)[] | string[]
  ): Promise<AdminEducation[]> {
    const ids = orderedEducationsOrIds.map((item) => (typeof item === "string" ? item : item.id))
    await writeJsonFile(path.join(EDUCATION_DIR, "order.json"), ids)
    return await this.getAdminEducations()
  },

  async getEducationById(id: string): Promise<Education | null> {
    try {
      const slug = normalizeSlug(id)
      const filePath = path.join(EDUCATION_DIR, `${slug}.json`)
      return await readJsonFile<Education>(filePath)
    } catch {
      return null
    }
  },

  async saveEducation(education: AdminEducation | Education): Promise<{ id: string }> {
    const slug = normalizeSlug(education.id || education.schoolName)
    if (!slug) {
      throw new Error("Education ID or school name is required.")
    }

    if (education.schoolLogo) {
      const logoCheck = validateImageUrl(education.schoolLogo)
      if (!logoCheck.isValid) {
        throw new Error(`School logo image error: ${logoCheck.error}`)
      }
    }

    const cleanEducation: Education = {
      id: slug,
      schoolName: education.schoolName,
      schoolLogo: education.schoolLogo || "",
      schoolWebsite: education.schoolWebsite || "",
      degrees: (education.degrees || []).map((deg, idx) => ({
        id: deg.id || `${slug}-${idx + 1}`,
        title: deg.title,
        period: deg.period,
        degreeType: deg.degreeType || "Bachelor's Degree",
        icon: typeof deg.icon === "string" ? deg.icon : "graduation-cap",
        description: deg.description || "",
        descriptionId: deg.descriptionId,
        skills: deg.skills || [],
      })),
      isCurrent: education.isCurrent ?? false,
    }

    const filePath = path.join(EDUCATION_DIR, `${slug}.json`)
    await writeJsonFile(filePath, cleanEducation)

    try {
      const orderFile = path.join(EDUCATION_DIR, "order.json")
      const order = await readJsonFile<string[]>(orderFile)
      if (Array.isArray(order) && !order.includes(slug)) {
        order.unshift(slug)
        await writeJsonFile(orderFile, order)
      }
    } catch {
      await writeJsonFile(path.join(EDUCATION_DIR, "order.json"), [slug])
    }

    return { id: slug }
  },

  async deleteEducation(id: string): Promise<void> {
    const slug = normalizeSlug(id)
    const filePath = path.join(EDUCATION_DIR, `${slug}.json`)
    try {
      await fs.unlink(filePath)
    } catch (err: unknown) {
      const nodeErr = err as { code?: string }
      if (nodeErr.code !== "ENOENT") {
        throw err
      }
    }

    try {
      const orderFile = path.join(EDUCATION_DIR, "order.json")
      let order = await readJsonFile<string[]>(orderFile)
      if (Array.isArray(order)) {
        order = order.filter((item) => item !== slug)
        await writeJsonFile(orderFile, order)
      }
    } catch {
      // ignore
    }
  },

  // ─── Skills ────────────────────────────────────────────────────────────────

  async getSkills(): Promise<TechStack[]> {
    return readJsonFile<TechStack[]>(path.join(CONTENT_DIR, "skills.json"))
  },

  async getAdminSkills(): Promise<AdminSkill[]> {
    const skills = await this.getSkills()
    return skills.map((item, idx) => ({
      id: item.key,
      name: item.title,
      // skill type defaults to "technology" for legacy entries without explicit type
      type: (item.type as AdminSkill["type"]) || "technology",
      category: mapSkillCategory(item.categories),
      // Read persisted level; fall back to position-based default only for legacy skills without level
      level: (item.level as AdminSkill["level"]) || (idx < 5 ? "Expert" : idx < 12 ? "Advanced" : "Intermediate"),
      icon: item.type === "technology" || !item.type ? item.iconId : undefined,
      // Read persisted featured flag; fall back to position for legacy items without the field
      featured: typeof item.featured === "boolean" ? item.featured : idx < 8,
      displayOrder: idx + 1,
    }))
  },

  async saveSkill(skill: AdminSkill): Promise<{ id: string }> {
    const skills = await this.getSkills()
    const targetKey = normalizeTechName(skill.name) || normalizeSlug(skill.id || skill.name)
    const originalKey = normalizeSlug(skill.id)

    // Prevent duplicates (case-insensitive & alias-normalized)
    const existingIdx = skills.findIndex(
      (s) => s.key === originalKey || s.key === targetKey || normalizeTechName(s.title) === normalizeTechName(skill.name)
    )

    const existing = existingIdx >= 0 ? skills[existingIdx] : undefined

    const cleanSkill: TechStack = {
      key: targetKey,
      title: skill.name,
      href: existing?.href || `https://www.google.com/search?q=${encodeURIComponent(skill.name)}`,
      categories: [mapAdminCategoryToPublic(skill.category)],
      type: skill.type || "technology",
      // For technology skills, always persist iconId
      ...(skill.type !== "soft-skill" ? { iconId: skill.icon || targetKey } : {}),
      // Persist admin metadata so they survive reload
      level: skill.level || "Intermediate",
      ...(typeof skill.featured === "boolean" ? { featured: skill.featured } : {}),
    }

    if (existingIdx >= 0) {
      skills[existingIdx] = cleanSkill
    } else {
      skills.push(cleanSkill)
    }

    await writeJsonFile(path.join(CONTENT_DIR, "skills.json"), skills)
    return { id: targetKey }
  },

  async saveAllSkills(adminSkills: AdminSkill[]): Promise<AdminSkill[]> {
    const currentSkills = await this.getSkills()
    const currentMap = new Map(currentSkills.map((s) => [s.key, s]))

    const newSkills: TechStack[] = adminSkills.map((skill) => {
      const key = normalizeTechName(skill.name) || normalizeSlug(skill.id || skill.name)
      const existing = currentMap.get(key) || currentMap.get(normalizeSlug(skill.id))

      return {
        key,
        title: skill.name,
        href: existing?.href || `https://www.google.com/search?q=${encodeURIComponent(skill.name)}`,
        categories: [mapAdminCategoryToPublic(skill.category)],
        type: skill.type || existing?.type || "technology",
        // Preserve iconId for technology skills
        ...(skill.type !== "soft-skill" ? { iconId: skill.icon || existing?.iconId || key } : {}),
        // Preserve admin metadata through reorder
        level: skill.level || existing?.level || "Intermediate",
        ...(typeof skill.featured === "boolean" ? { featured: skill.featured } : {}),
      } as TechStack
    })

    await writeJsonFile(path.join(CONTENT_DIR, "skills.json"), newSkills)
    return await this.getAdminSkills()
  },

  async deleteSkill(id: string): Promise<void> {
    const skills = await this.getSkills()
    const key = normalizeSlug(id)
    const normName = normalizeTechName(id)
    const filtered = skills.filter(
      (s) => s.key !== key && normalizeTechName(s.title) !== normName
    )
    await writeJsonFile(path.join(CONTENT_DIR, "skills.json"), filtered)
  },

  // ─── Social Links ──────────────────────────────────────────────────────────

  async getSocialLinks(): Promise<SocialLink[]> {
    return readJsonFile<SocialLink[]>(path.join(CONTENT_DIR, "social-links.json"))
  },

  async getAdminSocialLinks(): Promise<AdminSocialLink[]> {
    const links = await this.getSocialLinks()
    const seenSlugs = new Set<string>()
    return links.map((link, idx) => {
      let slug = normalizeSlug(link.title || (typeof link.icon === "string" ? link.icon : "") || `link-${idx}`)
      if (seenSlugs.has(slug)) {
        slug = `${slug}-${idx}`
      }
      seenSlugs.add(slug)
      return {
        id: slug,
        platform: (link.title as AdminSocialLink["platform"]) || "Other",
        label: link.title,
        url: link.href,
        icon: typeof link.icon === "string" ? link.icon : normalizeSlug(link.title),
        displayOrder: idx + 1,
        // Read persisted visible flag; default to true if field is absent
        visible: link.visible !== false,
      }
    })
  },

  async saveSocialLink(link: AdminSocialLink): Promise<void> {
    const links = await this.getSocialLinks()
    const targetPlatformSlug = normalizeSlug(link.platform || link.label)
    const originalSlug = link.id ? normalizeSlug(link.id) : ""

    const updatedLink: SocialLink = {
      icon: link.icon || link.platform.toLowerCase(),
      title: link.label || link.platform,
      href: link.url,
      // Persist visible flag: omit field (defaults true) when visible, save false when hidden
      ...(link.visible === false ? { visible: false } : {}),
    }

    // Match existing link being edited: either by original ID/slug or matching title
    const existingIdx = links.findIndex((l) => {
      const lSlug = normalizeSlug(l.title)
      return (
        (originalSlug && (lSlug === originalSlug || originalSlug.startsWith(`${lSlug}-`))) ||
        lSlug === targetPlatformSlug
      )
    })

    // Validate duplicate: prevent adding more than one link of the same platform
    const duplicateIdx = links.findIndex(
      (l, idx) =>
        normalizeSlug(l.title) === targetPlatformSlug &&
        (existingIdx >= 0 ? idx !== existingIdx : true)
    )
    if (duplicateIdx >= 0) {
      throw new Error(
        `Platform "${link.platform}" sudah terdaftar. Setiap platform hanya dapat ditambahkan 1 link.`
      )
    }

    if (existingIdx >= 0) {
      links[existingIdx] = updatedLink
    } else {
      links.push(updatedLink)
    }

    await writeJsonFile(path.join(CONTENT_DIR, "social-links.json"), links)
  },

  async saveAllSocialLinks(adminLinks: AdminSocialLink[]): Promise<void> {
    // Store ALL links including hidden ones — visible field controls display, not storage
    const allLinks: SocialLink[] = adminLinks.map((l) => ({
      icon: l.icon || l.platform.toLowerCase(),
      title: l.label || l.platform,
      href: l.url,
      ...(l.visible === false ? { visible: false } : {}),
    }))

    await writeJsonFile(path.join(CONTENT_DIR, "social-links.json"), allLinks)
  },

  async reorderSocialLinks(adminLinks: AdminSocialLink[]): Promise<AdminSocialLink[]> {
    await this.saveAllSocialLinks(adminLinks)
    return await this.getAdminSocialLinks()
  },

  async deleteSocialLink(id: string): Promise<void> {
    const links = await this.getSocialLinks()
    const targetSlug = normalizeSlug(id)
    const filtered = links.filter((l, idx) => {
      const slug = normalizeSlug(l.title)
      return slug !== targetSlug && `${slug}-${idx}` !== targetSlug
    })
    await writeJsonFile(path.join(CONTENT_DIR, "social-links.json"), filtered)
  },

  // ─── Awards ────────────────────────────────────────────────────────────────

  async getAwards(): Promise<Award[]> {
    return readJsonFile<Award[]>(path.join(CONTENT_DIR, "awards.json"))
  },

  async saveAward(award: Award): Promise<{ id: string }> {
    const awards = await this.getAwards()
    const slug = normalizeSlug(award.id || award.title)
    if (!slug) throw new Error("Award id or title is required.")
    const cleanAward: Award = {
      id: slug,
      prize: award.prize,
      title: award.title,
      date: award.date,
      grade: award.grade,
      ...(award.description ? { description: award.description } : {}),
      ...(award.descriptionId ? { descriptionId: award.descriptionId } : {}),
      ...(award.referenceLink ? { referenceLink: award.referenceLink } : {}),
    }
    const idx = awards.findIndex((a) => a.id === slug)
    if (idx >= 0) {
      awards[idx] = cleanAward
    } else {
      awards.unshift(cleanAward)
    }
    await writeJsonFile(path.join(CONTENT_DIR, "awards.json"), awards)
    return { id: slug }
  },

  async reorderAwards(awards: Award[]): Promise<Award[]> {
    const cleanAwards: Award[] = awards.map((a) => ({
      id: normalizeSlug(a.id || a.title),
      prize: a.prize,
      title: a.title,
      date: a.date,
      grade: a.grade,
      ...(a.description ? { description: a.description } : {}),
      ...(a.descriptionId ? { descriptionId: a.descriptionId } : {}),
      ...(a.referenceLink ? { referenceLink: a.referenceLink } : {}),
    }))
    await writeJsonFile(path.join(CONTENT_DIR, "awards.json"), cleanAwards)
    return cleanAwards
  },

  async deleteAward(id: string): Promise<void> {
    const awards = await this.getAwards()
    const slug = normalizeSlug(id)
    const filtered = awards.filter((a) => normalizeSlug(a.id) !== slug)
    await writeJsonFile(path.join(CONTENT_DIR, "awards.json"), filtered)
  },

  // ─── Certifications ────────────────────────────────────────────────────────

  async getCertifications(): Promise<Certification[]> {
    return readJsonFile<Certification[]>(path.join(CONTENT_DIR, "certifications.json"))
  },

  certAdminId(cert: Certification): string {
    const primary = cert.credentialID?.trim() || `${cert.title}-${cert.issuer}-${cert.issueDate}`
    return normalizeSlug(primary)
  },

  async reorderCertifications(certs: Certification[]): Promise<Certification[]> {
    const cleanCerts: Certification[] = certs.map((cert) => ({
      title: cert.title,
      issuer: cert.issuer,
      ...(cert.issuerLogoURL ? { issuerLogoURL: cert.issuerLogoURL } : {}),
      ...(cert.issuerIconName ? { issuerIconName: cert.issuerIconName } : {}),
      issueDate: cert.issueDate,
      credentialID: cert.credentialID,
      credentialURL: cert.credentialURL,
    }))
    await writeJsonFile(path.join(CONTENT_DIR, "certifications.json"), cleanCerts)
    return cleanCerts
  },

  async saveCertification(cert: Certification): Promise<{ _adminId: string }> {
    const certs = await this.getCertifications()
    const adminId = this.certAdminId(cert)
    const cleanCert: Certification = {
      title: cert.title,
      issuer: cert.issuer,
      ...(cert.issuerLogoURL ? { issuerLogoURL: cert.issuerLogoURL } : {}),
      ...(cert.issuerIconName ? { issuerIconName: cert.issuerIconName } : {}),
      issueDate: cert.issueDate,
      credentialID: cert.credentialID,
      credentialURL: cert.credentialURL,
    }
    const idx = certs.findIndex((c) => this.certAdminId(c) === adminId)
    if (idx >= 0) {
      certs[idx] = cleanCert
    } else {
      certs.unshift(cleanCert)
    }
    await writeJsonFile(path.join(CONTENT_DIR, "certifications.json"), certs)
    return { _adminId: adminId }
  },

  async deleteCertification(adminId: string): Promise<void> {
    const certs = await this.getCertifications()
    const filtered = certs.filter((c) => this.certAdminId(c) !== adminId)
    await writeJsonFile(path.join(CONTENT_DIR, "certifications.json"), filtered)
  },

  // ─── Publications ──────────────────────────────────────────────────────────

  async getPublications(): Promise<Publication[]> {
    return readJsonFile<Publication[]>(path.join(CONTENT_DIR, "publications.json"))
  },

  async reorderPublications(pubs: Publication[]): Promise<Publication[]> {
    const cleanPubs: Publication[] = pubs.map((pub) => ({
      id: normalizeSlug(pub.id || pub.title),
      title: pub.title,
      journal: pub.journal,
      date: pub.date,
      url: pub.url,
      ...(pub.description ? { description: pub.description } : {}),
    }))
    await writeJsonFile(path.join(CONTENT_DIR, "publications.json"), cleanPubs)
    return cleanPubs
  },

  async savePublication(pub: Publication): Promise<{ id: string }> {
    const pubs = await this.getPublications()
    const slug = normalizeSlug(pub.id || pub.title)
    if (!slug) throw new Error("Publication id or title is required.")
    const cleanPub: Publication = {
      id: slug,
      title: pub.title,
      journal: pub.journal,
      date: pub.date,
      url: pub.url,
      ...(pub.description ? { description: pub.description } : {}),
    }
    const idx = pubs.findIndex((p) => p.id === slug)
    if (idx >= 0) {
      pubs[idx] = cleanPub
    } else {
      pubs.unshift(cleanPub)
    }
    await writeJsonFile(path.join(CONTENT_DIR, "publications.json"), pubs)
    return { id: slug }
  },

  async deletePublication(id: string): Promise<void> {
    const pubs = await this.getPublications()
    const slug = normalizeSlug(id)
    const filtered = pubs.filter((p) => p.id !== slug && normalizeSlug(p.id) !== slug)
    await writeJsonFile(path.join(CONTENT_DIR, "publications.json"), filtered)
  },

  // ─── Gallery ───────────────────────────────────────────────────────────────

  async getGalleryItems(): Promise<GalleryItem[]> {
    try {
      return await readJsonFile<GalleryItem[]>(path.join(CONTENT_DIR, "gallery.json"))
    } catch {
      return []
    }
  },

  async saveGalleryItem(item: GalleryItem): Promise<{ id: string }> {
    const items = await this.getGalleryItems()
    const slug = normalizeSlug(item.id || item.title)
    if (!slug) throw new Error("Gallery item id or title is required.")

    if (item.src && item.type !== "video") {
      const imgCheck = validateImageUrl(item.src)
      if (!imgCheck.isValid) {
        throw new Error(`Gallery media error: ${imgCheck.error}`)
      }
    }

    const cleanItem: GalleryItem = {
      id: slug,
      title: item.title,
      src: item.src,
      date: item.date || String(new Date().getFullYear()),
      type: item.type || "image",
      aspect: item.aspect || "square",
      ...(item.description ? { description: item.description } : {}),
      ...(item.displayOrder !== undefined ? { displayOrder: item.displayOrder } : {}),
    }

    const idx = items.findIndex((i) => i.id === slug)
    if (idx >= 0) {
      items[idx] = cleanItem
    } else {
      items.unshift(cleanItem)
    }

    await writeJsonFile(path.join(CONTENT_DIR, "gallery.json"), items)
    return { id: slug }
  },

  async reorderGalleryItems(items: GalleryItem[]): Promise<GalleryItem[]> {
    const cleanItems: GalleryItem[] = items.map((i, idx) => ({
      id: normalizeSlug(i.id || i.title),
      title: i.title,
      src: i.src,
      date: i.date || String(new Date().getFullYear()),
      type: i.type || "image",
      aspect: i.aspect || "square",
      ...(i.description ? { description: i.description } : {}),
      displayOrder: idx + 1,
    }))
    await writeJsonFile(path.join(CONTENT_DIR, "gallery.json"), cleanItems)
    return cleanItems
  },

  async deleteGalleryItem(id: string): Promise<void> {
    const items = await this.getGalleryItems()
    const slug = normalizeSlug(id)
    const filtered = items.filter((i) => normalizeSlug(i.id) !== slug)
    await writeJsonFile(path.join(CONTENT_DIR, "gallery.json"), filtered)
  },

  // ─── Blog ──────────────────────────────────────────────────────────────────

  async getBlogPosts(): Promise<BlogPost[]> {
    try {
      return await readJsonFile<BlogPost[]>(path.join(CONTENT_DIR, "blog.json"))
    } catch {
      return []
    }
  },

  async saveBlogPost(post: BlogPost): Promise<{ id: string }> {
    const posts = await this.getBlogPosts()
    const slug = normalizeSlug(post.slug || post.id || post.title)
    if (!slug) throw new Error("Blog post slug or title is required.")

    if (post.thumbnail) {
      const imgCheck = validateImageUrl(post.thumbnail)
      if (!imgCheck.isValid) {
        throw new Error(`Blog thumbnail error: ${imgCheck.error}`)
      }
    }

    const cleanPost: BlogPost = {
      id: slug,
      title: post.title,
      slug,
      description: post.description,
      publishedAt: post.publishedAt || new Date().toISOString().slice(0, 10),
      categories: Array.isArray(post.categories) ? post.categories : [],
      status: post.status || "published",
      ...(post.thumbnail ? { thumbnail: post.thumbnail } : {}),
      ...(post.link ? { link: post.link } : {}),
      ...(post.content ? { content: post.content } : {}),
      ...(post.displayOrder !== undefined ? { displayOrder: post.displayOrder } : {}),
    }

    const idx = posts.findIndex((p) => p.id === slug || p.slug === slug)
    if (idx >= 0) {
      posts[idx] = cleanPost
    } else {
      posts.unshift(cleanPost)
    }

    await writeJsonFile(path.join(CONTENT_DIR, "blog.json"), posts)
    return { id: slug }
  },

  async reorderBlogPosts(posts: BlogPost[]): Promise<BlogPost[]> {
    const cleanPosts: BlogPost[] = posts.map((p, idx) => ({
      id: normalizeSlug(p.slug || p.id || p.title),
      title: p.title,
      slug: normalizeSlug(p.slug || p.id || p.title),
      description: p.description,
      publishedAt: p.publishedAt,
      categories: Array.isArray(p.categories) ? p.categories : [],
      status: p.status || "published",
      ...(p.thumbnail ? { thumbnail: p.thumbnail } : {}),
      ...(p.link ? { link: p.link } : {}),
      ...(p.content ? { content: p.content } : {}),
      displayOrder: idx + 1,
    }))
    await writeJsonFile(path.join(CONTENT_DIR, "blog.json"), cleanPosts)
    return cleanPosts
  },

  async deleteBlogPost(id: string): Promise<void> {
    const posts = await this.getBlogPosts()
    const slug = normalizeSlug(id)
    const filtered = posts.filter((p) => normalizeSlug(p.id) !== slug && normalizeSlug(p.slug) !== slug)
    await writeJsonFile(path.join(CONTENT_DIR, "blog.json"), filtered)
  },
}

export const LocalContentRepository = localRepo

