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
    <section className="flex w-full flex-col gap-2 border-t border-t-slate-200 bg-white px-3 pb-4 pt-3 first:border-t-0">
      {title != null && (
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-600">{title}</h3>
        </div>
      )}
      <div>{children}</div>
    </section>
  )
}
