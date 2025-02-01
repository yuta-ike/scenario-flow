import { useCallback, useMemo, useState } from "react"

import { Section } from "./Section"

import type { SetStateAction } from "react"
import { KVItem, applyUpdate } from "@scenario-flow/util"

import {
  upsertVariables,
  updateActionInstance,
} from "../../../../adapter/command"
import { useNodeEnvironment } from "../../../../adapter/query"
import { ParameterTable } from "../../../ParameterTable"
import { useStore } from "../../../provider"
import {
  NodeId,
  ResolvedBinderActionInstance,
  toLocalVariableId,
  Expression,
} from "../../../../../domain/entity"

type BinderTabPanelProps = {
  nodeId: NodeId
  ai: ResolvedBinderActionInstance
}

export const BinderTabPanel = ({ nodeId, ai }: BinderTabPanelProps) => {
  const store = useStore()
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
        store,
        updatedAssignments.map(({ id, key }) => ({
          id: toLocalVariableId(id),
          name: key,
          boundIn: nodeId,
        })),
      )

      updateActionInstance(store, nodeId, ai.id, {
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
          lang="expression"
        />
      </Section>
    </div>
  )
}
