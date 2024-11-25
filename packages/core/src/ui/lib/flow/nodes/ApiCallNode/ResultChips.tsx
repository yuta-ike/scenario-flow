import { TbFlag2, TbLoader } from "react-icons/tb"
import { useMemo } from "react"

import type { NodeId } from "@/domain/entity/node/node"

import { useLatestResolvedRunResult } from "@/ui/adapter/query"
import { getText, ResultIcon } from "@/ui/components/common/ResultIcon"
import { useHasFocusedRouteIdsValue } from "@/ui/state/focusedRouteId"

type Props = {
  nodeId: NodeId
}

export const ResultChips = ({ nodeId }: Props) => {
  const nodeStates = useLatestResolvedRunResult(nodeId)

  const focusedRouteId = useHasFocusedRouteIdsValue(
    useMemo(
      () => nodeStates?.results?.map((result) => result.route.id) ?? [],
      [nodeStates?.results],
    ),
  )

  if (nodeStates == null || nodeStates.status === "notExecuted") {
    return null
  }

  if (nodeStates.status === "loading") {
    return (
      <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1">
        <TbLoader size={20} className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-1">
      {nodeStates.results?.map((result) => {
        return (
          <div
            key={result.route.id}
            data-focused={focusedRouteId === result.route.id}
            className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 data-[focused=true]:border-2 data-[focused=true]:border-[var(--color)]"
            style={{
              "--color": result.route.color,
            }}
          >
            <div className="shrink-0">
              <TbFlag2
                size={20}
                fill={result.route.color}
                stroke={result.route.color}
              />
            </div>
            <div className="w-[12px] grow translate-y-1/2 border-t border-t-slate-200" />
            <div className="flex shrink-0 items-center gap-0.5">
              <div className="">
                <ResultIcon result={result.result} />
              </div>
              <div className="text-xs">{getText(result.result)}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
