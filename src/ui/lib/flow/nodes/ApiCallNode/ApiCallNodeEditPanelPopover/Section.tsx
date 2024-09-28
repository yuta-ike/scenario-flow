import React from "react"
import { TbCode, TbPointer } from "react-icons/tb"

import { SegmentedButton } from "./SegmentedButton"

type SectionProps = {
  title: string
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

export const Section = ({ title, children, inputType }: SectionProps) => {
  return (
    <section className="flex w-full flex-col gap-1 rounded-lg bg-white p-3 shadow-object">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#8E8E8E]">{title}</h3>
        {inputType != null ? (
          <SegmentedButton
            options={[
              { id: "gui", label: "GUI形式", icon: TbPointer },
              { id: "code", label: "コード形式", icon: TbCode },
            ]}
            label="入力方法"
            value={inputType}
            onSelected={() => {}}
          />
        ) : (
          <div />
        )}
      </div>
      <div>{children}</div>
    </section>
  )
}
