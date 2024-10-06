import { useCallback, useMemo, useState } from "react"

import { Section } from "./Section"

import type { SetStateAction } from "react"
import type { NodeId } from "@/domain/entity/node/node"
import type { ResolvedBinderActionInstance } from "@/domain/entity/node/actionInstance"
import type { Expression } from "@/domain/entity/value/expression"
import type { KVItem } from "@/ui/lib/kv"

import { ParameterTable } from "@/ui/lib/ParameterTable"
import { updateActionInstance, upsertVariables } from "@/ui/adapter/command"
import { applyUpdate } from "@/ui/utils/applyUpdate"
import { toLocalVariableId } from "@/domain/entity/variable/variable.util"
import { useNodeEnvironment } from "@/ui/adapter/query"

type BinderTabPanelProps = {
  nodeId: NodeId
  ai: ResolvedBinderActionInstance
}

export const BinderTabPanel = ({ nodeId, ai }: BinderTabPanelProps) => {
  const handleUpdateBinder = useCallback(
    (update: SetStateAction<KVItem[]>) => {
      const updatedAssignments = applyUpdate(
        update,
        ai.instanceParameter.assignments.map(({ variable, value }) => ({
          id: variable.id,
          key: variable.name,
          value: value,
        })),
      )

      upsertVariables(
        updatedAssignments.map(({ id, key }) => ({
          id: toLocalVariableId(id),
          name: key,
        })),
      )

      updateActionInstance(nodeId, ai.actionInstanceId, {
        ...ai,
        instanceParameter: {
          ...ai.instanceParameter,
          assignments: updatedAssignments.map(({ id, value }) => ({
            variableId: toLocalVariableId(id),
            value: value as Expression,
          })),
        },
      })
    },
    [ai, nodeId],
  )

  const _environment = useNodeEnvironment(nodeId)
  const [environment] = useState(_environment)

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* タイトル */}
      <Section title="変数の設定">
        <ParameterTable
          rows={useMemo(
            () =>
              ai.instanceParameter.assignments.map(({ variable, value }) => ({
                id: variable.id,
                key: variable.name,
                value: value,
              })),
            [ai.instanceParameter.assignments],
          )}
          setRows={handleUpdateBinder}
          placeholderKey="userId"
          placeholderValue="abcdef"
          currentNodeId={nodeId}
          environment={environment}
        />
      </Section>
    </div>
  )
}
