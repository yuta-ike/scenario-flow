import { TbPlus } from "react-icons/tb"
import { useAtomCallback } from "jotai/utils"
import { useCallback } from "react"

import { OpenCreateDropdown } from "../components/OpenCreateDropdown"

import type { NodeId } from "@/domain/entity/node/node"
import type { ActionSourceIdentifier } from "@/domain/entity/action/identifier"
import type { RouteId } from "@/domain/entity/route/route"

import {
  insertDbNode,
  insertIncludeNode,
  insertNode,
  insertUserDefinedRestCallNode,
  unshiftDbNode,
  unshiftIncludeNode,
  unshiftNode,
  unshiftUserDefinedRestCallNode,
} from "@/ui/adapter/command"
import { currentPageAtom } from "@/ui/state/page"

type Props = {
  routeIds: RouteId[]
  expanded: boolean
  fromNodeId: NodeId
  toNodeId: NodeId
}

export const InsertButton = ({
  routeIds,
  expanded,
  fromNodeId,
  toNodeId,
}: Props) => {
  const handleInsertApiCallNode = useAtomCallback(
    useCallback(
      (get, _, actionId: ActionSourceIdentifier) => {
        if (fromNodeId === "$root") {
          unshiftNode(routeIds[0]!, actionId)
        } else {
          insertNode(fromNodeId, toNodeId, actionId, get(currentPageAtom))
        }
      },
      [fromNodeId, routeIds, toNodeId],
    ),
  )

  const handleInsertIncludeNode = useAtomCallback(
    useCallback(
      (get, _, routeId: RouteId) => {
        if (fromNodeId === "$root") {
          return unshiftIncludeNode(routeId)
        } else {
          return insertIncludeNode(
            fromNodeId,
            toNodeId,
            routeId,
            get(currentPageAtom),
          )
        }
      },
      [fromNodeId, toNodeId],
    ),
  )

  const handleInsertUserDefinedApiCallNode = useAtomCallback(
    useCallback(
      (get, _) => {
        if (fromNodeId === "$root") {
          unshiftUserDefinedRestCallNode(routeIds[0]!)
        } else {
          insertUserDefinedRestCallNode(
            fromNodeId,
            toNodeId,
            get(currentPageAtom),
          )
        }
      },
      [fromNodeId, routeIds, toNodeId],
    ),
  )

  const handleCreateDbNode = useAtomCallback(
    useCallback(
      (get, _) => {
        if (fromNodeId === "$root") {
          unshiftDbNode(routeIds[0]!)
        } else {
          insertDbNode(fromNodeId, toNodeId, get(currentPageAtom))
        }
      },
      [fromNodeId, routeIds, toNodeId],
    ),
  )

  return (
    <OpenCreateDropdown
      mode="insert"
      onCreateApiCall={handleInsertApiCallNode}
      onCreateIclude={handleInsertIncludeNode}
      onCreateUserDefinedApiCall={handleInsertUserDefinedApiCallNode}
      onCreateDbNode={handleCreateDbNode}
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
