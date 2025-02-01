import { Fragment, useState } from "react"
import { FiPlus } from "react-icons/fi"

import { BinderTabPanel } from "./BinderDetailPanel"
import { RestCallTabPanel } from "./RestCallTabPanel"
import { ValidatorTabPanel } from "./ValidatorTabPanel"
import { NodeTitleSection } from "./NodeTitleSection"
import { IncludeDetailPanel } from "./IncludeDetailPanel"
import { DbDetailPanel } from "./DbDetailPanel"
import { ErrorBoundary, ErrorDisplay } from "@scenario-flow/ui"
import { appendActionInstance } from "../../../../adapter/command"
import { useNode } from "../../../../adapter/query"
import { useFocusedNodeId } from "../../../../state/focusedNodeId"
import { useStore } from "../../../provider"
import { ActionInstanceId, NodeId } from "../../../../../domain/entity"

export const DetailPanel = () => {
  const focusedNodeId = useFocusedNodeId()

  if (focusedNodeId == null) {
    return null
  }

  return (
    <div className="relative w-full bg-white empty:hidden">
      <Fragment key={focusedNodeId}>
        <ErrorBoundary fallback={<ErrorDisplay />}>
          <NodeTitleSection nodeId={focusedNodeId} />
        </ErrorBoundary>
        <ErrorBoundary fallback={<ErrorDisplay />}>
          <DetailPanelInner nodeId={focusedNodeId} />
        </ErrorBoundary>
      </Fragment>
    </div>
  )
}

type DetailPanelInnerProps = {
  nodeId: NodeId
}
const DetailPanelInner = ({ nodeId }: DetailPanelInnerProps) => {
  const store = useStore()
  const node = useNode(nodeId)

  const actionInstances = node.actionInstances

  const [selectedInstanceId, setSelectedInstanceId] =
    useState<ActionInstanceId | null>(actionInstances[0]?.id ?? null)

  const targetActionInstance = actionInstances.find(
    (ai) => ai.id === selectedInstanceId,
  )

  return (
    <div>
      <div className="flex w-full items-center overflow-x-auto border-b border-b-slate-200 bg-slate-50 pb-0 pr-4">
        {actionInstances.map((ai) => (
          <button
            key={ai.id}
            type="button"
            aria-pressed={ai.id === selectedInstanceId}
            onClick={() => setSelectedInstanceId(ai.id)}
            className="relative px-3 py-2.5 text-xs text-slate-600 hover:bg-slate-100 aria-[pressed=true]:text-black aria-[pressed=true]:before:absolute aria-[pressed=true]:before:inset-x-0 aria-[pressed=true]:before:bottom-0 aria-[pressed=true]:before:h-[2px] aria-[pressed=true]:before:rounded-sm aria-[pressed=true]:before:bg-slate-500"
          >
            {ai.type === "rest_call"
              ? "API呼び出し"
              : ai.type === "validator"
                ? "テスト"
                : ai.type === "include"
                  ? "シナリオ呼び出し"
                  : ai.type === "db"
                    ? "クエリ"
                    : "変数"}
          </button>
        ))}
        <hr className="mx-2 my-2 h-auto w-px self-stretch border-r border-r-slate-200 last:hidden" />
        {!actionInstances.some((ai) => ai.type === "validator") && (
          <button
            type="button"
            className="flex items-center gap-0.5 rounded-full py-1.5 pl-2 pr-3 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={() => {
              const actionInstanceId = appendActionInstance(
                store,
                nodeId,
                "validator",
              )
              setSelectedInstanceId(actionInstanceId)
            }}
          >
            <FiPlus />
            <span>テストを追加</span>
          </button>
        )}
        {!actionInstances.some((ai) => ai.type === "binder") && (
          <button
            type="button"
            className="flex items-center gap-0.5 rounded-full py-1.5 pl-2 pr-3 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={() => {
              const actionInstanceId = appendActionInstance(
                store,
                nodeId,
                "binder",
              )
              setSelectedInstanceId(actionInstanceId)
            }}
          >
            <FiPlus />
            <span>変数を追加</span>
          </button>
        )}
      </div>
      <ErrorBoundary fallback={<ErrorDisplay />}>
        {targetActionInstance != null &&
          (targetActionInstance.type === "rest_call" ? (
            <RestCallTabPanel nodeId={nodeId} ai={targetActionInstance} />
          ) : targetActionInstance.type === "validator" ? (
            <ValidatorTabPanel nodeId={nodeId} ai={targetActionInstance} />
          ) : targetActionInstance.type === "binder" ? (
            <BinderTabPanel nodeId={nodeId} ai={targetActionInstance} />
          ) : targetActionInstance.type === "include" ? (
            <IncludeDetailPanel nodeId={nodeId} ai={targetActionInstance} />
          ) : targetActionInstance.type === "db" ? (
            <DbDetailPanel nodeId={nodeId} ai={targetActionInstance} />
          ) : (
            <div>No</div>
          ))}
      </ErrorBoundary>
      <div className="ml-auto border-t border-t-slate-200 bg-slate-50 px-4 py-1 text-xs text-slate-400">
        {node.id}
      </div>
    </div>
  )
}
