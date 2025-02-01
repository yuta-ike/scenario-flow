import { HiPlus } from "react-icons/hi2"
import { Handle, Position } from "@xyflow/react"
import { useAtomCallback } from "jotai/utils"
import { useCallback } from "react"

import { OpenCreateDropdown } from "../../components/OpenCreateDropdown"
import { ActionSourceIdentifier, RouteId } from "../../../../../domain/entity"
import {
  createRestCallRootNode,
  createIncludeRootNode,
  createUserDefinedRestCallRootNode,
  createDbNode,
} from "../../../../adapter/command"
import { currentPageAtom } from "../../../../state/page"
import { useStore } from "../../../provider"

export const StartNode = () => {
  const store = useStore()

  const handleCreateNewApiCallNode = useAtomCallback(
    useCallback((get, __, actionIdentifier: ActionSourceIdentifier) => {
      return createRestCallRootNode(
        store,
        actionIdentifier,
        get(currentPageAtom),
      )
    }, []),
    { store: store.store },
  )

  const handleCreateNewIncludeNode = useAtomCallback(
    useCallback((get, __, routeId: RouteId) => {
      return createIncludeRootNode(store, routeId, get(currentPageAtom))
    }, []),
    { store: store.store },
  )

  const handleInsertUserDefinedApiCallNode = useAtomCallback(
    useCallback((get) => {
      return createUserDefinedRestCallRootNode(store, get(currentPageAtom))
    }, []),
    { store: store.store },
  )

  const handleCreateDbNode = useAtomCallback(
    useCallback((get) => {
      return createDbNode(store, get(currentPageAtom))
    }, []),
    { store: store.store },
  )

  return (
    <div className="w-[240px] cursor-arrowhead rounded-lg bg-slate-100 p-2 pb-6">
      <section className="flex w-full flex-col items-center gap-1 rounded-lg bg-white py-3 text-sm shadow-object">
        シナリオ開始
      </section>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[40%]">
        <OpenCreateDropdown
          onCreateApiCall={handleCreateNewApiCallNode}
          onCreateUserDefinedApiCall={handleInsertUserDefinedApiCallNode}
          onCreateIclude={handleCreateNewIncludeNode}
          onCreateDbNode={handleCreateDbNode}
          mode="append"
        >
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
  )
}
