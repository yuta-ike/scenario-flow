import { useCallback } from "react"

import { Section } from "./Section"

import type { NodeId } from "@/domain/entity/node/node"
import type { ValidatorActionInstance } from "@/domain/entity/node/actionInstance"
import type { Expression } from "@/domain/entity/value/expression"

import { updateActionInstance } from "@/ui/adapter/command"
import { applyUpdate } from "@/ui/utils/applyUpdate"
import { Editor2 } from "@/ui/lib/editor/Editor2"
import { useNodeEnvironment } from "@/ui/adapter/query"

type ValidatorTabPanelProps = {
  nodeId: NodeId
  ai: ValidatorActionInstance
}

export const ValidatorTabPanel = ({ nodeId, ai }: ValidatorTabPanelProps) => {
  const handleUpdateValidator = useCallback(
    (update: string) => {
      updateActionInstance(nodeId, ai.id, {
        ...ai,
        instanceParameter: {
          ...ai.instanceParameter,
          contents: applyUpdate(
            update,
            ai.instanceParameter.contents,
          ) as Expression,
        },
      })
    },
    [ai, nodeId],
  )

  const environment = useNodeEnvironment(nodeId)

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* タイトル */}
      <Section title="バリデーション">
        <div className="relative -mx-3 w-[calc(100%+24px)] overflow-hidden rounded border border-slate-200 text-sm">
          <Editor2
            lang="plaintext"
            theme="light"
            initValue={ai.instanceParameter.contents}
            onChange={(value) => handleUpdateValidator(value)}
            environment={environment}
            fitHeight
            minimap={false}
          />
        </div>
      </Section>
    </div>
  )
}
