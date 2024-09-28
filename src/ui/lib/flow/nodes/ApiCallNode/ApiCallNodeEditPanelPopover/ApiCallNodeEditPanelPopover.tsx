import React, { useState } from "react"
import * as Popover from "@radix-ui/react-popover"

import { MagicVariablePopover } from "../../../components/MagicVariablePopover"

import { Section } from "./Section"

import { Editor } from "@/ui/lib/editor/Editor"
import { ParameterTable } from "@/ui/lib/ParameterTable/ParameterTable"

type ApiCallNodeEditPanelProps = {
  children: React.ReactNode
}

export const ApiCallNodeEditPanel = ({
  children,
}: ApiCallNodeEditPanelProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger className="w-full text-start">
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="rounded-lg border border-slate-100 bg-white shadow-object"
          side="right"
          align="start"
          sideOffset={12}
        >
          <div className="flex w-[400px] flex-col gap-4 p-2">
            <div className="flex flex-col gap-3 px-3 py-1 pt-3">
              <div className="flex items-center gap-2">
                <div className="shrink-0 text-sm font-bold leading-none text-blue-600">
                  POST
                </div>
                <div className="text-md grow leading-none">/organization</div>
              </div>
              <div className="text-sm leading-none">新しい団体を作成する</div>
            </div>
            <Section title="リクエストボディ">
              <Editor lang="json" init="{}" />
            </Section>
            <Section title="パスパラメータ">
              <div className="flex flex-col gap-0.5">
                <div className="flex w-full justify-end">
                  <MagicVariablePopover />
                </div>
                <ParameterTable
                  rows={[
                    {
                      id: "PP:1",
                      key: "organization_id",
                      value: "demo_org",
                    },
                    {
                      id: "PP:2",
                      key: "user_id",
                      value: "{$.1.response.body.user_id}",
                    },
                  ]}
                />
              </div>
            </Section>
            <Section title="ヘッダー">
              <div className="flex flex-col gap-0.5">
                <div className="flex w-full justify-end">
                  <MagicVariablePopover />
                </div>
                <ParameterTable
                  rows={[
                    {
                      id: "HD:1",
                      key: "Authorization",
                      value: "Bearer {$.1.response.body.user_id}",
                    },
                    {
                      id: "HD:2",
                      key: "X-Custom-Header",
                      value: "{$.1.response.body.user_id}",
                    },
                  ]}
                />
              </div>
            </Section>
            <Section title="Cookie">
              <div className="flex flex-col gap-0.5">
                <div className="flex w-full justify-end">
                  <MagicVariablePopover />
                </div>
                <ParameterTable
                  rows={[
                    {
                      id: "HD:1",
                      key: "user-token",
                      value: "{$.1.response.body.user_id}",
                    },
                    {
                      id: "HD:2",
                      key: "version",
                      value: "1.0.2",
                    },
                  ]}
                />
              </div>
            </Section>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
