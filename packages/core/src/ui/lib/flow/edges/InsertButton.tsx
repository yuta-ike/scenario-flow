import { TbPlus } from "react-icons/tb"
import { useAtomCallback } from "jotai/utils"
import { useCallback } from "react"

import { OpenCreateDropdown } from "../components/OpenCreateDropdown"

import { useStore } from "../../provider"
import {
  RouteId,
  NodeId,
  ActionSourceIdentifier,
} from "../../../../domain/entity"
import {
  unshiftNode,
  insertNode,
  unshiftIncludeNode,
  insertIncludeNode,
  unshiftUserDefinedRestCallNode,
  insertUserDefinedRestCallNode,
  unshiftDbNode,
  insertDbNode,
} from "../../../adapter/command"
import { currentPageAtom } from "../../../state/page"

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
  const store = useStore()

  const handleInsertApiCallNode = useAtomCallback(
    useCallback(
      (get, _, actionId: ActionSourceIdentifier) => {
        if (fromNodeId === "$root") {
          return unshiftNode(store, routeIds[0]!, actionId)
        } else {
          return insertNode(
            store,
            fromNodeId,
            toNodeId,
            actionId,
            get(currentPageAtom),
          )
        }
      },
      [fromNodeId, routeIds, toNodeId],
    ),
    { store: store.store },
  )

  const handleInsertIncludeNode = useAtomCallback(
    useCallback(
      (get, _, routeId: RouteId) => {
        if (fromNodeId === "$root") {
          return unshiftIncludeNode(store, routeId)
        } else {
          return insertIncludeNode(
            store,
            fromNodeId,
            toNodeId,
            routeId,
            get(currentPageAtom),
          )
        }
      },
      [fromNodeId, toNodeId],
    ),
    { store: store.store },
  )

  const handleInsertUserDefinedApiCallNode = useAtomCallback(
    useCallback(
      (get, _) => {
        if (fromNodeId === "$root") {
          return unshiftUserDefinedRestCallNode(store, routeIds[0]!)
        } else {
          return insertUserDefinedRestCallNode(
            store,
            fromNodeId,
            toNodeId,
            get(currentPageAtom),
          )
        }
      },
      [fromNodeId, routeIds, toNodeId],
    ),
    { store: store.store },
  )

  const handleCreateDbNode = useAtomCallback(
    useCallback(
      (get, _) => {
        if (fromNodeId === "$root") {
          return unshiftDbNode(store, routeIds[0]!)
        } else {
          return insertDbNode(store, fromNodeId, toNodeId, get(currentPageAtom))
        }
      },
      [fromNodeId, routeIds, toNodeId],
    ),
    { store: store.store },
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
