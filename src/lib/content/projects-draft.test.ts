import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import type { AdminProject } from "@/features/admin/types/admin"

import { LocalContentRepository } from "./local-repo"

describe("Project Draft and Publishing Status", () => {
  const testDraftProject: AdminProject = {
    id: "test-draft-project",
    title: "Draft Test Project",
    category: "AI / Full Stack",
    tagline: "This is a draft project that should not be visible on public portfolio.",
    year: "2026",
    period: { start: "2026" },
    image: "/banner.webp",
    link: "https://example.com",
    links: { repo: "", live: "" },
    collaboration: {
      ownership: "Solo",
      label: "Solo",
      team: "Solo",
      role: "Developer",
      contributions: ["Created project"],
    },
    status: "draft",
    featured: false,
    displayOrder: 99,
    skills: ["TypeScript"],
    coverSkills: ["TypeScript"],
    features: ["Feature 1"],
    impact: ["Impact 1"],
    description: "Detailed draft description",
  }

  const testPublishedProject: AdminProject = {
    id: "test-published-project",
    title: "Published Test Project",
    category: "AI / Full Stack",
    tagline: "This is a published project that should be visible on public portfolio.",
    year: "2026",
    period: { start: "2026" },
    image: "/banner.webp",
    link: "https://example.com",
    links: { repo: "", live: "" },
    collaboration: {
      ownership: "Solo",
      label: "Solo",
      team: "Solo",
      role: "Developer",
      contributions: ["Created project"],
    },
    status: "published",
    featured: true,
    displayOrder: 1,
    skills: ["React"],
    coverSkills: ["React"],
    features: ["Feature 2"],
    impact: ["Impact 2"],
    description: "Detailed published description",
  }

  it("persists status correctly when saving draft and published projects", async () => {
    try {
      await LocalContentRepository.saveProject(testDraftProject)
      await LocalContentRepository.saveProject(testPublishedProject)

      const fetchedDraft = await LocalContentRepository.getProjectById("test-draft-project")
      const fetchedPublished = await LocalContentRepository.getProjectById("test-published-project")

      expect(fetchedDraft).not.toBeNull()
      expect(fetchedDraft?.status).toBe("draft")

      expect(fetchedPublished).not.toBeNull()
      expect(fetchedPublished?.status).toBe("published")

      // Check getAdminProjects returns both with correct statuses
      const adminProjects = await LocalContentRepository.getAdminProjects()
      const adminDraft = adminProjects.find((p) => p.id === "test-draft-project")
      const adminPub = adminProjects.find((p) => p.id === "test-published-project")

      expect(adminDraft?.status).toBe("draft")
      expect(adminPub?.status).toBe("published")

      // Check getProjects() for public site filters out drafts
      const publicProjects = await LocalContentRepository.getProjects()
      const publicDraft = publicProjects.find((p) => p.id === "test-draft-project")
      const publicPub = publicProjects.find((p) => p.id === "test-published-project")

      expect(publicDraft).toBeUndefined()
      expect(publicPub).toBeDefined()
    } finally {
      // Clean up test files
      await LocalContentRepository.deleteProject("test-draft-project")
      await LocalContentRepository.deleteProject("test-published-project")
    }
  })
})
