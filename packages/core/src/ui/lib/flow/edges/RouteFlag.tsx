import { TbFlag2 } from "react-icons/tb"

import type { RouteId } from "@/domain/entity/route/route"

import { useRoute } from "@/ui/adapter/query"
import { useIsFocusedRouteId } from "@/ui/state/focusedRouteId"

type Props = {
  routeId: RouteId
  expanded: boolean
}

export const RouteFlag = ({ routeId, expanded }: Props) => {
  const route = useRoute(routeId)
  const { isFocused, toggle } = useIsFocusedRouteId(routeId)
  return (
    <button
      key={routeId}
      data-focused={isFocused}
      data-expanded={expanded}
      type="button"
      className="focused:border-slate-50 group/button w-full rounded border border-transparent px-1.5 py-1 hover:bg-slate-100 data-[expanded=false]:data-[focused=true]:rounded-full data-[focused=true]:border-[var(--color)] data-[focused=true]:bg-[var(--color)]"
      style={{
        "--color": route.color,
      }}
      onClick={toggle}
    >
      <div className="flex items-center gap-2 group-data-[focused=true]/button:text-white">
        <TbFlag2
          size={18}
          className="fill-[var(--color)] stroke-[var(--color)] group-data-[focused=true]/button:fill-white group-data-[focused=true]/button:stroke-white"
        />
        {expanded && <div>{route.name}</div>}
      </div>
    </button>
  )
}
