import { useCallback } from "react"

import { Section } from "./Section"

import type { NodeId } from "@/domain/entity/node/node"
import type { ValidatorActionInstance } from "@/domain/entity/node/actionInstance"
import type { Expression } from "@/domain/entity/value/expression"

import { updateActionInstance } from "@/ui/adapter/command"
import { applyUpdate } from "@/ui/utils/applyUpdate"
import { TextareaAutosize } from "@/ui/components/common/TextareaAutosize"

type ValidatorTabPanelProps = {
  nodeId: NodeId
  ai: ValidatorActionInstance
}

export const ValidatorTabPanel = ({ nodeId, ai }: ValidatorTabPanelProps) => {
  const handleUpdateValidator = useCallback(
    (update: string) => {
      updateActionInstance(nodeId, ai.actionInstanceId, {
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

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* タイトル */}
      <Section title="バリデーション">
        <TextareaAutosize
          className="resize-none rounded border border-slate-200 p-2 font-mono text-sm focus:outline-none"
          rows={10}
          placeholder={`steps[1].response.body.user_id === "John Doe"`}
          value={ai.instanceParameter.contents}
          onChange={(e) => handleUpdateValidator(e.target.value)}
        />
      </Section>
    </div>
  )
}
