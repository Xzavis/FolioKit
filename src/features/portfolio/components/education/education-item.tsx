import Image from "next/image"

import { UTM_PARAMS } from "@/config/site"
import type { Education } from "@/features/portfolio/types/education"
import { addQueryParams } from "@/utils/url"

import { EducationDegreeItem } from "./education-degree-item"

export function EducationItem({ education }: { education: Education }) {
  return (
    <div
      id={`education-${education.id}`}
      className="scroll-mt-14 space-y-4 border-b border-line px-4 py-4 last:border-b-0"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-6 shrink-0 items-center justify-center select-none">
          {education.schoolLogo ? (
            <Image
              src={education.schoolLogo}
              alt={`${education.schoolName} logo`}
              width={24}
              height={24}
              quality={85}
              className={`rounded-full ${education.schoolLogo.endsWith(".svg") ? "" : "dark:bg-white dark:p-0.5"}`}
              aria-hidden
            />
          ) : (
            <span className="flex size-2 rounded-full bg-muted-foreground/40" />
          )}
        </div>

        <h3 className="text-lg leading-snug font-semibold">
          {education.schoolWebsite ? (
            <a
              className="link"
              href={addQueryParams(education.schoolWebsite, UTM_PARAMS)}
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              {education.schoolName}
            </a>
          ) : (
            education.schoolName
          )}
        </h3>
      </div>

      <div className="relative space-y-4 before:absolute before:left-3 before:h-full before:w-px before:bg-border">
        {education.degrees.map((degree) => (
          <EducationDegreeItem key={degree.id} degree={degree} />
        ))}
      </div>
    </div>
  )
}
