import { memo, useCallback } from "react"
import { Handle, NodeToolbar, Position, useConnection } from "@xyflow/react"
import { HiPlus } from "react-icons/hi2"
import { FiTrash } from "react-icons/fi"
import { useAtomCallback } from "jotai/utils"

import { OpenCreateDropdown } from "../../components/OpenCreateDropdown"
import { ApiCallSection } from "../sections/ApiCallSection"
import { ValidatorSection } from "../sections/ValidatorSection"
import { useUpdateNodeSize } from "../../FlowProvider"
import { IncludeSection } from "../sections/IncludeSection"
import { DbSection } from "../sections/DbSection"

import { ResultChips } from "./ResultChips"

import type { NodeProps } from "@xyflow/react"
import type { GeneralUiNode } from "../../type"
import type { ActionSourceIdentifier } from "@/domain/entity/action/identifier"
import type { ActionInstance } from "@/domain/entity/node/actionInstance"
import type { RouteId } from "@/domain/entity/route/route"
import type { NodeId } from "@/domain/entity/node/node"

import { useNode } from "@/ui/adapter/query"
import { useIsNodeFocused } from "@/ui/state/focusedNodeId"
import { useFocusedRouteByNodeId } from "@/ui/state/focusedRouteId"
import {
  appendDbNode,
  appendIncludeNode,
  appendNode,
  appendUserDefinedRestCallNode,
  deleteNode,
} from "@/ui/adapter/command"
import { useIsNodeHighlighted } from "@/ui/state/highlightedNodeId"
import { useHotkey } from "@/ui/lib/hotkey"
import { IconButton } from "@/ui/components/common/IconButton"
import { useObserveElementSize } from "@/ui/utils/useObserveElementSize"
import { currentPageAtom } from "@/ui/state/page"

type ApiCallNodeProps = NodeProps<GeneralUiNode>

const NotFound = () => <div>ノードが見つかりません</div>

const getComponent = (type: ActionInstance["type"]) => {
  if (type === "rest_call") {
    return ApiCallSection
  } else if (type === "validator") {
    return ValidatorSection
  } else if (type === "include") {
    return IncludeSection
  } else if (type === "db") {
    return DbSection
  } else if (type === "unknown") {
    return NotFound
  }
  return () => null
}

export const ApiCallNode = memo<ApiCallNodeProps>(({ data: { nodeId } }) => {
  const connection = useConnection()

  const updateNodeSize = useUpdateNodeSize()
  const ref = useObserveElementSize<HTMLDivElement>((size) =>
    updateNodeSize(nodeId, size),
  )

  const isFocused = useIsNodeFocused(nodeId)
  const isHighlighted = useIsNodeHighlighted(nodeId)
  const focusedRoute = useFocusedRouteByNodeId(nodeId)

  const handleCreateNewApiCallNode = useAtomCallback(
    useCallback(
      (get, _, actionId: ActionSourceIdentifier) =>
        appendNode(nodeId, actionId, get(currentPageAtom)),
      [nodeId],
    ),
  )

  const handleCreateNewIncludeNode = useAtomCallback(
    useCallback(
      (get, _, routeId: RouteId) =>
        appendIncludeNode(nodeId, routeId, get(currentPageAtom)),
      [nodeId],
    ),
  )

  const handleCreateUserDefinedApiCallNode = useAtomCallback(
    useCallback(
      (get, _) => appendUserDefinedRestCallNode(nodeId, get(currentPageAtom)),
      [nodeId],
    ),
  )

  const handleAppendDbNode = useAtomCallback(
    useCallback(
      (get, _) => appendDbNode(nodeId, get(currentPageAtom)),
      [nodeId],
    ),
  )

  const keyRef = useHotkey<HTMLButtonElement>("Backspace", {
    meta: false,
    allowedKeyword: "delete",
    enabled: isFocused,
  })

  const handleDelete = useCallback(() => {
    deleteNode(nodeId)
  }, [nodeId])

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
          onClick={handleDelete}
        />
      </NodeToolbar>
      <div
        data-node-focused={isFocused}
        data-route-focused={focusedRoute != null}
        data-highlighted={isHighlighted}
        style={{
          "--focused-route-color": focusedRoute?.color ?? "#93c5fd",
        }}
        className="group relative flex w-[240px] flex-col gap-2 rounded-lg bg-slate-100 p-1 pb-6 outline outline-2 outline-offset-2 outline-transparent data-[highlighted=true]:bg-yellow-100 data-[node-focused=true]:bg-blue-100 data-[highlighted=true]:outline-yellow-300 data-[node-focused=true]:outline-blue-300"
        ref={ref}
      >
        {connection.inProgress && (
          <Handle
            type="target"
            position={Position.Top}
            className="absolute !inset-0 !z-10 !h-full !w-full !translate-x-0 !translate-y-0 !rounded-lg !bg-red-600/20 transition hover:!bg-red-600/30"
          />
        )}
        {/* MainBody */}
        <NodeMainBody nodeId={nodeId} />
        {/* Add Button */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[40%]">
          <OpenCreateDropdown
            mode="append"
            onCreateApiCall={handleCreateNewApiCallNode}
            onCreateUserDefinedApiCall={handleCreateUserDefinedApiCallNode}
            onCreateIclude={handleCreateNewIncludeNode}
            onCreateDbNode={handleAppendDbNode}
          >
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
          <ResultChips nodeId={nodeId} />
        </div>
      </div>
    </>
  )
})

const NodeMainBody = ({ nodeId }: { nodeId: NodeId }) => {
  const node = useNode(nodeId)

  const handleChangePage = useAtomCallback(
    useCallback((_, set, page: string) => {
      set(currentPageAtom, page)
    }, []),
  )

  return (
    <>
      <div className="pointer-events-none flex flex-col">
        <div className="line-clamp-1 p-1 pb-0 text-[13px] text-slate-800 transition empty:hidden group-hover:line-clamp-none group-hover:whitespace-pre-line group-hover:empty:hidden">
          {node.name}
        </div>
        <div className="z-10 line-clamp-1 max-h-[1.2lh] p-1 pb-0 text-xs text-slate-600 transition empty:hidden group-hover:line-clamp-none group-hover:w-[600px] group-hover:whitespace-pre-line group-hover:empty:hidden">
          {node.description}
        </div>
      </div>
      {node.actionInstances.map((actionInstance) => {
        const Component = getComponent(actionInstance.type)
        return (
          <div key={actionInstance.id} className="w-full empty:hidden">
            <Component
              nodeId={node.id}
              actionInstance={actionInstance}
              onChangePage={handleChangePage}
            />
          </div>
        )
      })}
    </>
  )
}
