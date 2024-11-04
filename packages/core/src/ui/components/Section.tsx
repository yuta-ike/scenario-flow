import React from "react"

type SectionProps = {
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export const Section = ({ title, children, footer }: SectionProps) => {
  return (
    <div className="flex w-full flex-col rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 p-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <div>{children}</div>
      </div>
      <div className="flex justify-end border-t border-t-slate-200 p-2 empty:hidden">
        {footer}
      </div>
    </div>
  )
}
