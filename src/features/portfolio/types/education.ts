export type EducationDegree = {
  id: string
  /** Name of the degree, certificate, or program (e.g. "Bachelor of Computer Science") */
  title: string
  /**
   * Study period.
   * Use "MM.YYYY" or "YYYY" format. Omit `end` for current studies.
   */
  period: {
    /** Start date (e.g. "09.2021" or "2021") */
    start: string
    /** End date; leave undefined for "Present" */
    end?: string
  }
  /** Bachelor's Degree | Master's Degree | High School | Bootcamp | Certification, etc. */
  degreeType?: string
  /** Activities, achievements, honors, or GPA description */
  description?: string
  /** Indonesian translation of `description`; supports Markdown */
  descriptionId?: string
  /** UI icon identifier representing the academic program (resolved via IconRegistry) */
  icon?: string
  /** Relevant coursework, honors, or skills acquired */
  skills?: string[]
  /** Whether the degree is expanded by default in the UI */
  isExpanded?: boolean
}

export type Education = {
  id: string
  schoolName: string
  /** URL to the institution logo (absolute URL or path under /public) */
  schoolLogo?: string
  /** URL to the institution's official website */
  schoolWebsite?: string
  /** Degrees, certificates, or programs obtained at this institution */
  degrees: EducationDegree[]
  /** Marks as current institution being attended */
  isCurrent?: boolean
}
