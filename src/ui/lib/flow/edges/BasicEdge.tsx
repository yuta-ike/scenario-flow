import React, { memo } from "react"
import { BaseEdge, EdgeLabelRenderer } from "@xyflow/react"

import { getBezierPath } from "../utils/getBezierPath"

import { RouteFlag } from "./RouteFlag"

import type { EdgeProps } from "@xyflow/react"

import {
  useNullablePrimitiveRoute,
  useRouteIdsBetween,
} from "@/ui/adapter/query"
import { toNodeId } from "@/domain/entity/node/node.util"
import { useToggle } from "@/ui/utils/useToggle"
import { useHasFocusedRouteIdsValue } from "@/ui/state/focusedRouteId"

export const BasicEdge = memo<EdgeProps>(function BasicEdgeInner({
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const routeIds = useRouteIdsBetween(
    source === toNodeId("start") ? null : toNodeId(source),
    toNodeId(target),
  )

  const { state: hovered, setTrue, setFalse } = useToggle(false)

  const focusedRouteId = useHasFocusedRouteIdsValue(routeIds)
  const focusedRoute = useNullablePrimitiveRoute(focusedRouteId ?? null)

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          stroke: focusedRoute != null ? focusedRoute.color : "#A6AEC6",
          strokeWidth: 2,
          zIndex: focusedRoute != null ? 10 : 1,
        }}
        className="stroke-[8px]"
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            "--color": focusedRoute?.color ?? "#EEEEEE",
          }}
        >
          <div
            onPointerEnter={setTrue}
            onPointerLeave={setFalse}
            data-expanded={hovered}
            data-focused={focusedRouteId != null}
            className="group pointer-events-auto flex items-center gap-0.5 rounded-full border border-[var(--color)] bg-white p-1 empty:hidden data-[expanded=true]:flex-col data-[expanded=true]:rounded-lg data-[focused=true]:border-2"
          >
            {routeIds.map((routeId) => (
              <RouteFlag key={routeId} routeId={routeId} expanded={hovered} />
            ))}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  )
})
