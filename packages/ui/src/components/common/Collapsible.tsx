import React from "react"

type Props = {
  show: boolean
  children: React.ReactNode
}

export const Collapsible = ({ show, children }: Props) => {
  return (
    <div
      className="grid transition-[grid-template-rows]"
      style={{ gridTemplateRows: show ? "1fr" : "0fr" }}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  )
}
