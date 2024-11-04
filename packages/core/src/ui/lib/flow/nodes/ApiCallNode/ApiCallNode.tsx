import { memo } from "react"
import { Handle, NodeToolbar, Position, useConnection } from "@xyflow/react"
import { HiPlus } from "react-icons/hi2"
import { FiTrash } from "react-icons/fi"

import { OpenCreateDropdown } from "../../components/OpenCreateDropdown"
import { ApiCallSection } from "../sections/ApiCallSection"
import { ValidatorSection } from "../sections/ValidatorSection"
import { useUpdateNodeSize } from "../../FlowProvider"

import { ResultChips } from "./ResultChips"

import type { NodeProps } from "@xyflow/react"
import type { GeneralUiNode } from "../../type"
import type { ActionSourceIdentifier } from "@/domain/entity/action/identifier"

import { useNode } from "@/ui/adapter/query"
import { useIsNodeFocused } from "@/ui/state/focusedNodeId"
import { useFocusedRouteByNodeId } from "@/ui/state/focusedRouteId"
import { appendNode, deleteNode } from "@/ui/adapter/command"
import { useIsNodeHighlighted } from "@/ui/state/highlightedNodeId"
import { useHotkey } from "@/ui/lib/hotkey"
import { IconButton } from "@/ui/components/common/IconButton"
import { useObserveElementSize } from "@/ui/utils/useObserveElementSize"

type ApiCallNodeProps = NodeProps<GeneralUiNode>

// 新しくノードをつなぐ
// インラインエディタ

export const ApiCallNode = memo<ApiCallNodeProps>(({ data: { nodeId } }) => {
  const connection = useConnection()

  const updateNodeSize = useUpdateNodeSize()
  const ref = useObserveElementSize<HTMLDivElement>((size) =>
    updateNodeSize(nodeId, size),
  )

  const node = useNode(nodeId)
  const isFocused = useIsNodeFocused(nodeId)
  const isHighlighted = useIsNodeHighlighted(nodeId)
  const focusedRoute = useFocusedRouteByNodeId(nodeId)

  const handleCreateNewApiCallNode = (actionId: ActionSourceIdentifier) => {
    appendNode(nodeId, actionId)
  }

  const keyRef = useHotkey<HTMLButtonElement>("Backspace", {
    meta: false,
    allowedKeyword: "delete",
    enabled: isFocused,
  })

  return (
    <>
      {!connection.inProgress && (
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={false}
          className="opacity-0"
        />
      )}
      <NodeToolbar isVisible={isFocused} position={Position.Left}>
        <IconButton
          label="削除"
          size="sm"
          icon={FiTrash}
          ref={keyRef}
          onClick={() => deleteNode(nodeId)}
        />
      </NodeToolbar>
      <div
        data-node-focused={isFocused}
        data-route-focused={focusedRoute != null}
        data-highlighted={isHighlighted}
        style={{
          "--focused-route-color": focusedRoute?.color ?? "#93c5fd",
        }}
        className="group relative flex w-[240px] flex-col gap-2 rounded-lg bg-[#EFF1F7] p-1 pb-6 outline outline-2 outline-offset-2 outline-transparent data-[highlighted=true]:bg-yellow-100 data-[node-focused=true]:bg-blue-100 data-[highlighted=true]:outline-yellow-300 data-[node-focused=true]:outline-blue-300"
        ref={ref}
      >
        {connection.inProgress && (
          <Handle
            type="target"
            position={Position.Top}
            className="absolute !inset-0 !z-10 !h-full !w-full !translate-x-0 !translate-y-0 !rounded-lg !bg-red-600/20 transition hover:!bg-red-600/30"
          />
        )}
        <div className="line-clamp-1 p-1 pb-0 text-sm transition empty:hidden group-hover:line-clamp-none group-hover:whitespace-pre-line group-hover:empty:hidden">
          {node.name}
        </div>
        {node.actionInstances.map((actionInstance) => (
          <div key={actionInstance.id} className="w-full empty:hidden">
            {actionInstance.type === "rest_call" ? (
              <ApiCallSection
                nodeId={node.id}
                actionInstance={actionInstance}
              />
            ) : actionInstance.type === "validator" ? (
              <ValidatorSection actionInstance={actionInstance} />
            ) : actionInstance.type === "unknown" ? (
              <div className="">ノードが見つかりません</div>
            ) : null}
          </div>
        ))}
        {/* Add Button */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[40%]">
          <OpenCreateDropdown onCreateApiCall={handleCreateNewApiCallNode}>
            <button
              type="button"
              className="relative rounded-full border-[3px] border-white bg-[#D9DCDF] p-1 text-[#333333] transition hover:bg-[#cdd0d3] focus:outline-none data-[state=open]:bg-[#cdd0d3]"
            >
              <HiPlus size={15} strokeWidth={1} />
              <Handle
                type="source"
                position={Position.Bottom}
                className="!pointer-events-none !inset-0 !h-full !w-full !translate-x-0 !translate-y-0 !opacity-0"
              />
            </button>
          </OpenCreateDropdown>
        </div>
        {/* Result */}
        <div className="absolute left-full top-0 ml-2 w-max empty:hidden">
          <ResultChips nodeId={node.id} />
        </div>
      </div>
    </>
  )
})
