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

  const environment = useNodeEnvironment(nodeId)

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* タイトル */}
      <Section title="バリデーション">
        {/* <TextareaAutosize
          className="resize-none rounded border border-slate-200 p-2 font-mono text-sm focus:outline-none"
          rows={10}
          placeholder={`steps[1].response.body.user_id === "John Doe"`}
          value={ai.instanceParameter.contents}
          onChange={(e) => handleUpdateValidator(e.target.value)}
        /> */}
        <Editor2
          lang="plaintext"
          initValue={ai.instanceParameter.contents}
          onChange={(value) => handleUpdateValidator(value)}
          environment={environment}
        />
      </Section>
    </div>
  )
}
