"use client"

import React from "react"

import { SectionCallout } from "@/components/section-callout"
import type { Education } from "@/features/portfolio/types/education"
import { useTranslation } from "@/lib/i18n/use-translation"

import { Panel, PanelHeader, PanelTitle, PanelTitleSup } from "../panel"
import { EducationItem } from "./education-item"

export function Educations({ educations = [] }: { educations?: Education[] } = {}) {
  const { t } = useTranslation()

  if (educations.length === 0) {
    return null
  }

  return (
    <Panel id="education">
      <SectionCallout side="left">{t.education.callout}</SectionCallout>

      <PanelHeader>
        <PanelTitle>
          {t.education.title}
          <PanelTitleSup>({educations.length})</PanelTitleSup>
        </PanelTitle>
      </PanelHeader>

      <div>
        {educations.map((education) => (
          <EducationItem key={education.id} education={education} />
        ))}
      </div>
    </Panel>
  )
}
