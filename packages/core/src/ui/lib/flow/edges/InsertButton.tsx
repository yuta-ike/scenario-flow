import { TbPlus } from "react-icons/tb"
import { useAtomCallback } from "jotai/utils"
import { useCallback } from "react"

import { OpenCreateDropdown } from "../components/OpenCreateDropdown"

import type { NodeId } from "@/domain/entity/node/node"
import type { ActionSourceIdentifier } from "@/domain/entity/action/identifier"
import type { RouteId } from "@/domain/entity/route/route"

import {
  insertIncludeNode,
  insertNode,
  unshiftIncludeNode,
  unshiftNode,
} from "@/ui/adapter/command"
import { currentPageAtom } from "@/ui/state/page"

type Props = {
  routeIds: RouteId[]
  expanded: boolean
  fromNodeId: NodeId
  toNodeId: NodeId
}

export const InsertButton = ({ routeIds, expanded, fromNodeId }: Props) => {
  const handleInsertApiCallNode = useAtomCallback(
    useCallback(
      (get, _, actionId: ActionSourceIdentifier) => {
        if (fromNodeId === "$root") {
          unshiftNode(routeIds[0]!, actionId)
        } else {
          insertNode(fromNodeId, actionId, get(currentPageAtom))
        }
      },
      [fromNodeId, routeIds],
    ),
  )

  const handleInsertIncludeNode = useAtomCallback(
    useCallback(
      (get, _, routeId: RouteId) => {
        if (fromNodeId === "$root") {
          return unshiftIncludeNode(routeId)
        } else {
          return insertIncludeNode(fromNodeId, routeId, get(currentPageAtom))
        }
      },
      [fromNodeId],
    ),
  )

  return (
    <OpenCreateDropdown
      mode="insert"
      onCreateApiCall={handleInsertApiCallNode}
      onCreateIclude={handleInsertIncludeNode}
    >
      <button
        data-expanded={expanded}
        type="button"
        className="focused:border-slate-50 group/button w-full rounded border border-transparent px-1.5 py-1 hover:bg-slate-100 data-[expanded=false]:data-[focused=true]:rounded-full data-[focused=true]:border-[var(--color)] data-[focused=true]:bg-[var(--color)]"
      >
        <div className="flex items-center gap-2 group-data-[focused=true]/button:text-white">
          <TbPlus size={16} />
          <div>追加</div>
        </div>
      </button>
    </OpenCreateDropdown>
  )
}
