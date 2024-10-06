import { memo } from "react"
import { Handle, Position } from "@xyflow/react"
import { HiPlus } from "react-icons/hi2"

import { OpenCreateDropdown } from "../../components/OpenCreateDropdown"
import { ApiCallSection } from "../sections/ApiCallSection"
import { ValidatorSection } from "../sections/ValidatorSection"

import type { NodeProps } from "@xyflow/react"
import type { GeneralUiNode } from "../../type"
import type { ActionId } from "@/domain/entity/action/action"

import { useNode } from "@/ui/adapter/query"
import { useIsNodeFocused } from "@/ui/state/focusedNodeId"
import { useFocusedRouteByNodeId } from "@/ui/state/focusedRouteId"
import { appendNode } from "@/ui/adapter/command"
import { useIsNodeHighlighted } from "@/ui/state/highlightedNodeId"

type ApiCallNodeProps = NodeProps<GeneralUiNode>

export const ApiCallNode = memo<ApiCallNodeProps>(({ data: { nodeId } }) => {
  const node = useNode(nodeId)
  const isFocused = useIsNodeFocused(nodeId)
  const isHighlighted = useIsNodeHighlighted(nodeId)
  const focusedRoute = useFocusedRouteByNodeId(nodeId)

  const handleCreateNewApiCallNode = (actionId: ActionId) => {
    appendNode(nodeId, actionId)
  }

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className="opacity-0"
      />

      <div
        data-node-focused={isFocused}
        data-route-focused={focusedRoute != null}
        data-highlighted={isHighlighted}
        style={{
          "--focused-route-color": focusedRoute?.color ?? "#93c5fd",
        }}
        className="flex w-[240px] flex-col gap-2 rounded-lg bg-[#EFF1F7] p-1 pb-6 outline outline-2 outline-offset-2 outline-transparent data-[highlighted=true]:bg-yellow-100 data-[node-focused=true]:bg-blue-100 data-[highlighted=true]:outline-yellow-300 data-[node-focused=true]:outline-blue-300"
      >
        {node.actionInstances.map((actionInstance) => (
          <div
            key={actionInstance.actionInstanceId}
            className="w-full empty:hidden"
          >
            {actionInstance.type === "rest_call" ? (
              <ApiCallSection
                nodeId={node.id}
                actionInstance={actionInstance}
              />
            ) : actionInstance.type === "validator" ? (
              <ValidatorSection actionInstance={actionInstance} />
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
                isConnectable={false}
                className="!inset-0 !h-full !w-full !translate-x-0 !translate-y-0 !opacity-0"
              />
            </button>
          </OpenCreateDropdown>
        </div>
      </div>
    </>
  )
})
