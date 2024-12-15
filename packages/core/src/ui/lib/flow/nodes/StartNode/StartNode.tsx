import { HiPlus } from "react-icons/hi2"
import { Handle, Position } from "@xyflow/react"
import { useAtomCallback } from "jotai/utils"
import { useCallback } from "react"

import { OpenCreateDropdown } from "../../components/OpenCreateDropdown"

import type { ActionSourceIdentifier } from "@/domain/entity/action/identifier"
import type { RouteId } from "@/domain/entity/route/route"

import {
  createIncludeRootNode,
  createRestCallRootNode,
} from "@/ui/adapter/command"
import { currentPageAtom } from "@/ui/state/page"

export const StartNode = () => {
  const handleCreateNewApiCallNode = useAtomCallback(
    useCallback((get, __, actionIdentifier: ActionSourceIdentifier) => {
      createRestCallRootNode(actionIdentifier, get(currentPageAtom))
    }, []),
  )

  const handleCreateNewIncludeNode = useAtomCallback(
    useCallback((get, __, routeId: RouteId) => {
      createIncludeRootNode(routeId, get(currentPageAtom))
    }, []),
  )

  return (
    <div className="cursor-arrowhead w-[240px] rounded-lg bg-slate-100 p-2 pb-6">
      <section className="flex w-full flex-col items-center gap-1 rounded-lg bg-white py-3 text-sm shadow-object">
        シナリオ開始
      </section>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[40%]">
        <OpenCreateDropdown
          onCreateApiCall={handleCreateNewApiCallNode}
          onCreateIclude={handleCreateNewIncludeNode}
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
