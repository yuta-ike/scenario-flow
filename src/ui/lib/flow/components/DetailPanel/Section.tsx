import React from "react"

type SectionProps = {
  title?: string
  children: React.ReactNode
} & (
  | {
      inputType: "gui" | "code"
      onChangeInputType: (inputType: "gui" | "code") => void
    }
  | {
      inputType?: undefined
      onChangeInputType?: undefined
    }
)

export const Section = ({ title, children }: SectionProps) => {
  return (
    <section className="flex w-full flex-col gap-2 border-t border-t-slate-200 bg-white px-4 pb-6 pt-4 first:border-t-0">
      <div className="flex items-center justify-between">
        {title != null && (
          <h3 className="text-xs font-bold text-slate-600">{title}</h3>
        )}
      </div>
      <div>{children}</div>
    </section>
  )
}
