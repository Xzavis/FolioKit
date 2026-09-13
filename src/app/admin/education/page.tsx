"use client"

import { differenceInMonths, parse } from "date-fns"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BookOpenIcon,
  EditIcon,
  GraduationCapIcon,
  ImageIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import React, { useEffect, useState } from "react"

import { IconRegistry } from "@/components/icon-registry"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tag } from "@/components/ui/tag"
import {
  deleteEducationAction,
  fetchEducationsAction,
  reorderEducationsAction,
  saveEducationAction,
} from "@/features/admin/actions/content-actions"
import { AdminAlertDialog, AdminDialog } from "@/features/admin/components/admin-dialog"
import {
  FormField,
  FormInput,
  FormMediaUpload,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/features/admin/components/admin-form-elements"
import { AdminHeader } from "@/features/admin/components/admin-header"
import { useToast } from "@/features/admin/components/admin-toast"
import type { AdminEducation } from "@/features/admin/types/admin"
import { cn } from "@/lib/utils"

function formatDuration(start: string, end?: string): string {
  if (!start) return ""
  const startHasMonth = start.includes(".")
  const endHasMonth = end ? end.includes(".") : true

  if (!startHasMonth && end && !endHasMonth) {
    const years = parseInt(end, 10) - parseInt(start, 10)
    if (years <= 0) return ""
    return `${years}y`
  }

  const parsePeriodDate = (str: string, fallbackMonth: "first" | "last"): Date => {
    if (str.includes(".")) {
      return parse(str, "MM.yyyy", new Date())
    }
    return parse(`${fallbackMonth === "last" ? "12" : "01"}.${str}`, "MM.yyyy", new Date())
  }

  const startDate = parsePeriodDate(start, "first")
  const endDate = end ? parsePeriodDate(end, "last") : new Date()

  const totalMonths = differenceInMonths(endDate, startDate) + 1
  if (totalMonths <= 0) return ""
  if (totalMonths < 12) return `${totalMonths}m`
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  if (months === 0) return `${years}y`
  return `${years}y ${months}m`
}

const EDUCATION_ICONS = [
  { id: "graduation-cap", label: "University / Degree", description: "Higher Education, Bachelor, Master, PhD" },
  { id: "school", label: "School / Academic", description: "High School, Secondary, Academy" },
  { id: "book-open", label: "Studies / Coursework", description: "Academic Track, Curriculum, Studies" },
  { id: "library", label: "Institution / Campus", description: "University, College, Faculty" },
  { id: "award", label: "Honors / Dean's List", description: "Academic Honors, Merit, Distinction" },
  { id: "medal", label: "Achievement / Award", description: "Olympiad, Competition, Valedictorian" },
  { id: "scroll", label: "Diploma / Certificate", description: "Degree Certificate, Graduation" },
  { id: "code-2", label: "Bootcamp / Coding School", description: "Intensive Tech Cohort, Bootcamp" },
  { id: "flask-conical", label: "Research / Thesis", description: "Academic Research, Lab, Thesis" },
  { id: "lightbulb", label: "Specialization / Track", description: "Self-directed Study, Concentration" },
]

const PRESET_LOGOS = [
  { label: "Udinus", path: "/logos/udinus.webp" },
  { label: "Dicoding", path: "/logos/dicoding.webp" },
  { label: "Coursera", path: "/logos/coursera.webp" },
  { label: "IBM", path: "/logos/ibm.webp" },
  { label: "Asah", path: "/logos/asah.webp" },
  { label: "McKinsey", path: "/logos/mckinsey.webp" },
  { label: "Anthropic", path: "/logos/anthropic.webp" },
  { label: "DNCC", path: "/logos/dncc.webp" },
]

const SUGGESTED_COURSEWORK = [
  "Computer Science",
  "Data Structures & Algorithms",
  "Artificial Intelligence",
  "Machine Learning",
  "Database Systems",
  "Software Engineering",
  "Web Development",
  "Operating Systems",
  "Computer Networks",
  "Linear Algebra",
  "Probability & Statistics",
  "Object-Oriented Programming",
]

const DEGREE_TYPES = [
  { label: "Bachelor's Degree", value: "Bachelor's Degree" },
  { label: "Master's Degree", value: "Master's Degree" },
  { label: "Doctorate / PhD", value: "Doctorate / PhD" },
  { label: "Associate Degree", value: "Associate Degree" },
  { label: "High School Diploma", value: "High School Diploma" },
  { label: "Bootcamp / Academy", value: "Bootcamp / Academy" },
  { label: "Certification Program", value: "Certification Program" },
  { label: "Non-Degree / Coursework", value: "Non-Degree / Coursework" },
]

export default function AdminEducationPage() {
  const [educations, setEducations] = useState<AdminEducation[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEdu, setEditingEdu] = useState<AdminEducation | null>(null)
  const [isCurrent, setIsCurrent] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<AdminEducation | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { success, error } = useToast()

  const loadData = () => {
    fetchEducationsAction().then((data) => {
      setEducations(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCreateModal = () => {
    const newEdu: AdminEducation = {
      id: `edu-${Date.now()}`,
      schoolName: "",
      schoolLogo: "/logos/udinus.webp",
      schoolWebsite: "",
      degrees: [
        {
          id: `deg-${Date.now()}`,
          title: "",
          period: {
            start: "09.2022",
            end: undefined,
          },
          degreeType: "Bachelor's Degree",
          icon: "graduation-cap",
          description: "",
          skills: ["Computer Science", "Artificial Intelligence"],
        },
      ],
      isCurrent: true,
      displayOrder: educations.length + 1,
    }
    setEditingEdu(newEdu)
    setIsCurrent(true)
    setNewSkill("")
    setErrors({})
    setModalOpen(true)
  }

  const openEditModal = (edu: AdminEducation) => {
    setEditingEdu(JSON.parse(JSON.stringify(edu)))
    setIsCurrent(edu.isCurrent ?? !edu.degrees[0]?.period?.end)
    setNewSkill("")
    setErrors({})
    setModalOpen(true)
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= educations.length) return

    const previous = [...educations]
    const updated = [...educations]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    updated.forEach((item, idx) => {
      item.displayOrder = idx + 1
    })

    setEducations(updated)

    try {
      const res = await reorderEducationsAction(updated)
      if (res.success) {
        if (res.data) setEducations(res.data)
        success("Education order updated.")
      } else {
        setEducations(previous)
        error(res.message || "Failed to save education order.")
      }
    } catch {
      setEducations(previous)
      error("Failed to save education order.")
    }
  }

  const handleAddSkill = (skillToAdd?: string) => {
    if (!editingEdu) return
    const tag = (skillToAdd || newSkill).trim()
    if (!tag) return

    const degrees = [...editingEdu.degrees]
    const currentSkills = degrees[0]?.skills || []

    if (!currentSkills.includes(tag)) {
      degrees[0] = {
        ...degrees[0],
        skills: [...currentSkills, tag],
      }
      setEditingEdu({ ...editingEdu, degrees })
    }
    if (!skillToAdd) {
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!editingEdu) return
    const degrees = [...editingEdu.degrees]
    const currentSkills = degrees[0]?.skills || []

    degrees[0] = {
      ...degrees[0],
      skills: currentSkills.filter((s) => s !== skillToRemove),
    }
    setEditingEdu({ ...editingEdu, degrees })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEdu) return

    const deg = editingEdu.degrees[0]
    const errs: Record<string, string> = {}
    if (!editingEdu.schoolName.trim()) errs.schoolName = "Institution / School name is required."
    if (!deg?.title?.trim()) errs.title = "Degree / Major / Program title is required."
    if (!deg?.period?.start?.trim()) errs.start = "Start date is required."

    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setIsSaving(true)
    const payload: AdminEducation = {
      ...editingEdu,
      schoolWebsite: editingEdu.schoolWebsite?.trim() || "",
      schoolLogo: editingEdu.schoolLogo?.trim() || undefined,
      isCurrent: isCurrent,
      degrees: [
        {
          ...deg,
          icon: deg.icon || "graduation-cap",
          skills: deg.skills || [],
          period: {
            start: deg.period.start,
            end: isCurrent ? undefined : deg.period.end,
          },
        },
      ],
    }

    try {
      const res = await saveEducationAction(payload)
      if (res.success) {
        success(res.message)
        setModalOpen(false)
        loadData()
      } else {
        error(res.message)
      }
    } catch {
      error("Failed to save education record.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await deleteEducationAction(deleteTarget.id)
      if (res.success) {
        success(res.message)
        setDeleteTarget(null)
        loadData()
      } else {
        error(res.message)
      }
    } catch {
      error("Failed to delete education record.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Education Management"
        subtitle="Manage academic degrees, institutions, coursework, achievements, logos, and graduation timeline."
        actions={
          <Button size="sm" onClick={openCreateModal} className="gap-1.5">
            <PlusIcon className="size-3.5" /> Add Education
          </Button>
        }
      />

      {/* Education List */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden dark:border-line">
        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Loading education history...</div>
        ) : educations.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs text-muted-foreground">No education records added yet.</p>
            <Button size="xs" onClick={openCreateModal} className="gap-1">
              <PlusIcon className="size-3" /> Add Education
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/60 dark:divide-line">
            {educations.map((edu, idx) => {
              return (
                <div
                  key={edu.id}
                  className="flex items-start gap-3.5 p-4 sm:p-5 hover:bg-muted/20 transition-colors"
                >
                  {/* Left Column: Stacked Reorder Buttons */}
                  <div className="flex flex-col gap-1 pt-0.5 shrink-0">
                    <button
                      onClick={() => handleMove(idx, "up")}
                      disabled={idx === 0}
                      className="rounded p-1 hover:bg-muted disabled:opacity-25 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Move up"
                    >
                      <ArrowUpIcon className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, "down")}
                      disabled={idx === educations.length - 1}
                      className="rounded p-1 hover:bg-muted disabled:opacity-25 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Move down"
                    >
                      <ArrowDownIcon className="size-3.5" />
                    </button>
                  </div>

                  {/* Center Column: School Header + Timeline Nodes */}
                  <div className="flex-1 min-w-0 space-y-4">
                    {/* Institution Header */}
                    <div className="flex items-center gap-3">
                      <div className="flex size-6 shrink-0 items-center justify-center select-none">
                        {edu.schoolLogo ? (
                          <img
                            src={edu.schoolLogo}
                            alt={`${edu.schoolName} logo`}
                            width={24}
                            height={24}
                            className="size-6 rounded-full dark:bg-white dark:p-0.5 object-cover"
                            onError={(e) => {
                              ;(e.currentTarget as HTMLElement).style.display = "none"
                            }}
                          />
                        ) : (
                          <span className="flex size-2 rounded-full bg-muted-foreground/40" />
                        )}
                      </div>

                      <h3 className="text-lg leading-snug font-semibold text-foreground">
                        {edu.schoolName}
                      </h3>
                    </div>

                    {/* Connected Timeline Degrees */}
                    <div className="relative space-y-4 before:absolute before:left-3 before:h-full before:w-px before:bg-border">
                      {edu.degrees.map((deg, dIdx) => {
                        const dStart = deg.period?.start || ""
                        const dEnd = deg.period?.end
                        const dOngoing = edu.isCurrent || !dEnd
                        const dDuration = formatDuration(dStart, dOngoing ? undefined : dEnd)

                        return (
                          <div key={deg.id || dIdx} className="group/education-degree relative">
                            <div
                              className="pointer-events-none absolute bottom-0 left-3 hidden size-4 bg-card group-last/education-degree:flex"
                              aria-hidden
                            >
                              <span className="size-full -translate-y-2.25 rounded-bl-sm border-b border-l border-border" />
                            </div>

                            <div>
                              <div className="relative z-1 mb-1 flex items-start gap-3">
                                <div
                                  className={cn(
                                    "flex size-6 shrink-0 items-center justify-center rounded-lg",
                                    "bg-muted text-muted-foreground",
                                    "border border-muted-foreground/15 ring-1 ring-line ring-offset-1 ring-offset-background",
                                    "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                                  )}
                                >
                                  <IconRegistry name={deg.icon || "graduation-cap"} />
                                </div>

                                <span className="flex-1 font-medium text-foreground text-balance">
                                  {deg.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 pl-9 text-sm text-muted-foreground">
                                {deg.degreeType && (
                                  <>
                                    <span>{deg.degreeType}</span>
                                    <Separator
                                      className="data-vertical:h-4 data-vertical:self-center"
                                      orientation="vertical"
                                    />
                                  </>
                                )}

                                <span className="flex items-center gap-0.5 font-mono text-xs tabular-nums">
                                  <span>{dStart}</span>
                                  <span>-</span>
                                  <span>{dOngoing ? "Present" : dEnd}</span>
                                </span>

                                {dDuration && (
                                  <>
                                    <Separator
                                      className="data-vertical:h-4 data-vertical:self-center"
                                      orientation="vertical"
                                    />
                                    <span className="font-mono text-xs tabular-nums">{dDuration}</span>
                                  </>
                                )}
                              </div>

                              {Array.isArray(deg.skills) && deg.skills.length > 0 && (
                                <ul className="flex flex-wrap gap-1.5 pt-3 pl-9">
                                  {deg.skills.map((skill, sIdx) => (
                                    <li key={sIdx} className="flex">
                                      <Tag>{skill}</Tag>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Right Column: Edit & Delete Actions */}
                  <div className="flex items-center gap-1 shrink-0 self-start">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEditModal(edu)}
                      aria-label="Edit education"
                    >
                      <EditIcon className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(edu)}
                      aria-label="Delete education"
                    >
                      <Trash2Icon className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Education Edit / Create Modal */}
      {editingEdu && (
        <AdminDialog
          open={modalOpen}
          onClose={() => !isSaving && setModalOpen(false)}
          title={editingEdu.schoolName ? `Edit: ${editingEdu.schoolName}` : "Add Education"}
          maxWidth="lg"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5">
                <SaveIcon className="size-3.5" />
                {isSaving ? "Saving..." : "Save Education"}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSave} className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Institution / School / University" required error={errors.schoolName}>
                <FormInput
                  value={editingEdu.schoolName}
                  onChange={(e) =>
                    setEditingEdu({ ...editingEdu, schoolName: e.target.value })
                  }
                  placeholder="Universitas Dian Nuswantoro"
                  error={errors.schoolName}
                />
              </FormField>

              <FormField label="Degree / Major / Program Title" required error={errors.title}>
                <FormInput
                  value={editingEdu.degrees[0]?.title || ""}
                  onChange={(e) => {
                    const degrees = [...editingEdu.degrees]
                    degrees[0] = { ...degrees[0], title: e.target.value }
                    setEditingEdu({ ...editingEdu, degrees })
                  }}
                  placeholder="Bachelor of Computer Science"
                  error={errors.title}
                />
              </FormField>
            </div>

            {/* School Logo & Image Section */}
            <div className="rounded-lg border border-border/80 bg-muted/20 p-3 dark:border-line space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="size-3.5 text-primary" /> Institution Logo / Image (Optional)
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Displays next to institution name
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full border-2 border-border bg-muted flex items-center justify-center">
                  {editingEdu.schoolLogo ? (
                    <img
                      src={editingEdu.schoolLogo}
                      alt={editingEdu.schoolName || "Logo preview"}
                      className="size-full object-cover"
                      onError={(e) => {
                        ;(e.currentTarget as HTMLElement).style.display = "none"
                      }}
                    />
                  ) : (
                    <BookOpenIcon className="size-6 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <FormMediaUpload
                    value={editingEdu.schoolLogo || ""}
                    onChange={(val) => setEditingEdu({ ...editingEdu, schoolLogo: val })}
                    accept="image/*"
                    targetFolder="logos"
                  />

                  {/* Preset Quick Logos */}
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[0.625rem] text-muted-foreground mr-1">Presets:</span>
                    {PRESET_LOGOS.map((preset) => {
                      const isCurrentLogo = editingEdu.schoolLogo === preset.path
                      return (
                        <button
                          key={preset.path}
                          type="button"
                          onClick={() => setEditingEdu({ ...editingEdu, schoolLogo: preset.path })}
                          className={`rounded px-1.5 py-0.5 text-[0.625rem] font-mono transition-colors ${
                            isCurrentLogo
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                          }`}
                        >
                          {preset.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Role / Degree Icon Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <GraduationCapIcon className="size-3.5 text-primary" /> Academic Icon{" "}
                  <span className="text-muted-foreground font-normal">(displayed next to degree)</span>
                </label>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Selected:</span>
                  <div className="flex size-5 items-center justify-center rounded bg-muted text-foreground border border-border [&_svg]:size-3.5">
                    <IconRegistry name={editingEdu.degrees[0]?.icon || "graduation-cap"} />
                  </div>
                  <span className="font-mono text-[11px] text-foreground font-medium">
                    {editingEdu.degrees[0]?.icon || "graduation-cap"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {EDUCATION_ICONS.map((iconItem) => {
                  const isSelected =
                    (editingEdu.degrees[0]?.icon || "graduation-cap").toLowerCase() === iconItem.id.toLowerCase()

                  return (
                    <button
                      key={iconItem.id}
                      type="button"
                      onClick={() => {
                        const degrees = [...editingEdu.degrees]
                        degrees[0] = { ...degrees[0], icon: iconItem.id }
                        setEditingEdu({ ...editingEdu, degrees })
                      }}
                      className={`flex items-center gap-2 rounded-lg border p-2 text-left transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary"
                          : "border-border/70 bg-card hover:bg-muted/60 text-foreground"
                      }`}
                    >
                      <div className="flex size-6 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground [&_svg]:size-3.5">
                        <IconRegistry name={iconItem.id} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">{iconItem.label}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Degree / Program Type">
                <FormSelect
                  value={editingEdu.degrees[0]?.degreeType || "Bachelor's Degree"}
                  onChange={(e) => {
                    const degrees = [...editingEdu.degrees]
                    degrees[0] = { ...degrees[0], degreeType: e.target.value }
                    setEditingEdu({ ...editingEdu, degrees })
                  }}
                  options={DEGREE_TYPES}
                />
              </FormField>

              <FormField
                label="Institution Website (Optional)"
                description="Link opens in new tab from the public portfolio"
              >
                <FormInput
                  value={editingEdu.schoolWebsite || ""}
                  onChange={(e) =>
                    setEditingEdu({ ...editingEdu, schoolWebsite: e.target.value })
                  }
                  placeholder="https://dinus.ac.id"
                />
              </FormField>
            </div>

            {/* Currently Studying Toggle & Dates */}
            <div className="rounded-lg border border-border/80 bg-muted/30 p-3 space-y-3 dark:border-line">
              <FormSwitch
                checked={isCurrent}
                onChange={(val) => setIsCurrent(val)}
                label="Currently Studying Here"
                description="Marks this academic program as ongoing (End Date will display as 'Present')"
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2 border-t border-border/50">
                <FormField label="Start Date" required error={errors.start} description="Format: MM.YYYY or YYYY">
                  <FormInput
                    value={editingEdu.degrees[0]?.period?.start || ""}
                    onChange={(e) => {
                      const degrees = [...editingEdu.degrees]
                      degrees[0] = {
                        ...degrees[0],
                        period: {
                          ...degrees[0].period,
                          start: e.target.value,
                        },
                      }
                      setEditingEdu({ ...editingEdu, degrees })
                    }}
                    placeholder="09.2022"
                    error={errors.start}
                  />
                </FormField>

                {!isCurrent && (
                  <FormField label="End Date / Expected Graduation" description="Format: MM.YYYY or YYYY">
                    <FormInput
                      value={editingEdu.degrees[0]?.period?.end || ""}
                      onChange={(e) => {
                        const degrees = [...editingEdu.degrees]
                        degrees[0] = {
                          ...degrees[0],
                          period: {
                            ...degrees[0].period,
                            end: e.target.value,
                          },
                        }
                        setEditingEdu({ ...editingEdu, degrees })
                      }}
                      placeholder="07.2026"
                    />
                  </FormField>
                )}
              </div>
            </div>

            {/* Relevant Coursework & Skills Badges Manager */}
            <div className="space-y-2 rounded-lg border border-border/80 bg-muted/20 p-3 dark:border-line">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Relevant Coursework & Competency Badges{" "}
                  <span className="text-muted-foreground font-normal">(displays under degree)</span>
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {(editingEdu.degrees[0]?.skills || []).length} badge(s)
                </span>
              </div>

              {/* Tag Input */}
              <div className="flex items-center gap-2">
                <FormInput
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddSkill()
                    }
                  }}
                  placeholder="Type coursework (e.g. Data Structures, Machine Learning) & press Enter..."
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSkill()}
                  className="gap-1 shrink-0"
                >
                  <PlusIcon className="size-3.5" /> Add
                </Button>
              </div>

              {/* Active Badges List */}
              <div className="flex flex-wrap gap-1.5 pt-1 min-h-6">
                {(editingEdu.degrees[0]?.skills || []).map((skill, sIdx) => (
                  <Tag key={sIdx} className="flex items-center gap-1.5 py-1 px-2.5 text-xs font-mono">
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-muted-foreground hover:text-foreground ml-0.5"
                      aria-label={`Remove ${skill}`}
                    >
                      <XIcon className="size-3" />
                    </button>
                  </Tag>
                ))}
              </div>

              {/* Quick Suggestions Chips */}
              <div className="pt-2 border-t border-border/40">
                <div className="text-[0.6875rem] font-medium text-muted-foreground mb-1.5">
                  Quick Add Suggestions:
                </div>
                <div className="flex flex-wrap gap-1">
                  {SUGGESTED_COURSEWORK.map((suggestion) => {
                    const isAlreadyAdded = (editingEdu.degrees[0]?.skills || []).includes(suggestion)
                    return (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleAddSkill(suggestion)}
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
            </div>

            <FormField
              label="Academic Achievements, Honors & GPA (Markdown)"
              description="Highlight GPA, Dean's List, scholarships, student organization roles, and thesis focus"
            >
              <FormTextarea
                rows={5}
                value={editingEdu.degrees[0]?.description || ""}
                onChange={(e) => {
                  const degrees = [...editingEdu.degrees]
                  degrees[0] = { ...degrees[0], description: e.target.value }
                  setEditingEdu({ ...editingEdu, degrees })
                }}
                placeholder="- Current GPA: 3.85 / 4.00\n- Dean's List for 4 consecutive semesters\n- Focus: Intelligent Systems & Full Stack Engineering"
              />
            </FormField>
          </form>
        </AdminDialog>
      )}

      {/* Delete Confirmation Alert */}
      <AdminAlertDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Education Record?"
        description={`Are you sure you want to delete "${deleteTarget?.schoolName}" from your education history? This action cannot be undone.`}
        confirmText="Delete Education"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  )
}
