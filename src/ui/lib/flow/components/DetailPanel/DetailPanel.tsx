import { useState } from "react"

import { BinderTabPanel } from "./BinderDetailPanel"
import { RestCallTabPanel } from "./RestCallTabPanel"
import { ValidatorTabPanel } from "./ValidatorTabPanel"

import type { NodeId } from "@/domain/entity/node/node"
import type { ActionInstanceId } from "@/domain/entity/node/actionInstance"

import { useFocusedNodeId } from "@/ui/state/focusedNodeId"
import { useNode } from "@/ui/adapter/query"

export const DetailPanel = () => {
  const focusedNodeId = useFocusedNodeId()

  if (focusedNodeId == null) {
    return null
  }
  return <DetailPanelInner key={focusedNodeId} nodeId={focusedNodeId} />
}

type DetailPanelInnerProps = {
  nodeId: NodeId
}
const DetailPanelInner = ({ nodeId }: DetailPanelInnerProps) => {
  const { actionInstances } = useNode(nodeId)

  const [selectedInstanceId, setSelectedInstanceId] =
    useState<ActionInstanceId | null>(
      actionInstances[0]?.actionInstanceId ?? null,
    )

  const targetActionInstance = actionInstances.find(
    (ai) => ai.actionInstanceId === selectedInstanceId,
  )

  return (
    <div>
      <div className="flex w-full items-center border-b border-b-slate-200 pb-0">
        {actionInstances.map((ai) => (
          <button
            key={ai.actionInstanceId}
            type="button"
            aria-pressed={ai.actionInstanceId === selectedInstanceId}
            onClick={() => setSelectedInstanceId(ai.actionInstanceId)}
            className="relative px-3 py-2.5 text-xs text-slate-600 hover:bg-slate-100 aria-[pressed=true]:text-black aria-[pressed=true]:before:absolute aria-[pressed=true]:before:inset-x-0 aria-[pressed=true]:before:bottom-0 aria-[pressed=true]:before:h-[2px] aria-[pressed=true]:before:rounded-sm aria-[pressed=true]:before:bg-slate-500"
          >
            {ai.type === "rest_call"
              ? "API呼び出し"
              : ai.type === "validator"
                ? "バリデーション"
                : "変数"}
          </button>
        ))}
      </div>
      {targetActionInstance != null &&
        (targetActionInstance.type === "rest_call" ? (
          <RestCallTabPanel nodeId={nodeId} ai={targetActionInstance} />
        ) : targetActionInstance.type === "validator" ? (
          <ValidatorTabPanel nodeId={nodeId} ai={targetActionInstance} />
        ) : targetActionInstance.type === "binder" ? (
          <BinderTabPanel nodeId={nodeId} ai={targetActionInstance} />
        ) : (
          <div>No</div>
        ))}
    </div>
  )
}
