import React from "react"
import * as Popover from "@radix-ui/react-popover"

import { MagicVariablePopover } from "../../../components/MagicVariablePopover"
import { Section } from "../ApiCallNodeEditPanelPopover/Section"

import { Editor } from "@/ui/lib/editor/Editor"

type CustomCheckPanelProps = {
  children: React.ReactNode
}

export const CustomCheckPanel = ({ children }: CustomCheckPanelProps) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="right"
          sideOffset={12}
          align="start"
          className="w-[400px]"
        >
          <Section
            title="カスタムチェック"
            inputType="code"
            onChangeInputType={() => {
              // noop
            }}
          >
            <div className="mt-2 flex flex-col gap-2">
              <div className="rounded bg-slate-100 px-4 py-2 text-xs">
                runn記法でバリデーションロジックを記述できます。
              </div>
              <div className="flex w-full justify-end">
                <MagicVariablePopover />
              </div>
              <Editor lang="javascript" />
            </div>
          </Section>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
