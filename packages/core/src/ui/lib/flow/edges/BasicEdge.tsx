import React, { memo } from "react"
import { BaseEdge, EdgeLabelRenderer } from "@xyflow/react"
import clsx from "clsx"

import { getBezierPath } from "../utils/getBezierPath"

import { RouteFlag } from "./RouteFlag"

import type { Edge, EdgeProps } from "@xyflow/react"
import type { Replace } from "@/utils/typeUtil"

import {
  useNullablePrimitiveRoute,
  useRouteIdsBetween,
} from "@/ui/adapter/query"
import { toNodeId } from "@/domain/entity/node/node.util"
import { useToggle } from "@/ui/utils/useToggle"
import { useHasFocusedRouteIdsValue } from "@/ui/state/focusedRouteId"

type EdgeData = {
  points: { x: number; y: number }[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getBezierPath5 = (
  points: [
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
  ],
) => {
  const base = points[0]
  const scaleX = 1
  const scaleY = (points[6].y - points[0].y) / (points[6].y - points[1].y)

  return [
    `
    M${base.x},${base.y}

    v${(points[2].y - points[1].y - 28) * scaleY}
    ${points[2].x < points[1].x ? "a12,12 0 0 1 -12,12" : "a12,12 0 0 0 12,12"}

    h${(points[2].x - points[1].x) * scaleX - 26}
    ${points[2].x < points[1].x ? "a12,12 0 0 0 -12,12" : "a12,12 0 0 1 12,12"}

    v${(points[5].y - points[1].y - (points[2].y - points[1].y) - (points[5].y - points[4].y)) * scaleY}
    ${points[5].x < points[4].x ? "a12,12 0 0 1 -12,12" : "a12,12 0 0 0 12,12"}

    h${(points[5].x - points[4].x) * scaleX + 24}
    ${points[5].x < points[4].x ? "a12,12 0 0 0 -12,12" : "a12,12 0 0 1 12,12"}

    v${(points[5].y - points[4].y) * scaleY - 28}
    `,
  ]
}

export const BasicEdge = memo<EdgeProps<Replace<Edge, "data", EdgeData>>>(
  ({
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
  }) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    })
    // const [edgePath, labelX, labelY] =
    //   data.points.length === 3
    //     ? getBezierPath({
    //         sourceX,
    //         sourceY,
    //         sourcePosition,
    //         targetX,
    //         targetY,
    //         targetPosition,
    //         factor:
    //           // @ts-expect-error
    //           (data.points.at((data.points.length - 1) / 2).y -
    //             // @ts-expect-error
    //             data.points[0].y) /
    //           // @ts-expect-error
    //           (data.points.at(-1).y - data.points[0].y),
    //       })
    //     : // @ts-expect-error
    //       getBezierPath5([
    //         { x: sourceX, y: sourceY },
    //         ...data.points,
    //         { x: targetX, y: targetY },
    //       ])

    const routeIds = useRouteIdsBetween(toNodeId(source), toNodeId(target))

    const { state: hovered, setTrue, setFalse } = useToggle(false)

    const focusedRouteId = useHasFocusedRouteIdsValue(routeIds)
    const focusedRoute = useNullablePrimitiveRoute(focusedRouteId ?? null)

    return (
      <>
        <BaseEdge
          path={edgePath}
          interactionWidth={20}
          style={{
            stroke: focusedRoute != null ? focusedRoute.color : "#A6AEC6",
            strokeWidth: 2,
            zIndex: focusedRoute != null ? 10 : 1,
          }}
          className={clsx(
            "stroke-[8px] transition-[translate]",
            focusedRoute != null && "focused",
          )}
        />
        <EdgeLabelRenderer>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              "--color": focusedRoute?.color ?? "#EEEEEE",
              zIndex: 10,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              onPointerEnter={setTrue}
              onPointerLeave={setFalse}
              data-expanded={hovered}
              data-focused={focusedRouteId != null}
              className="group pointer-events-auto flex items-center gap-0.5 rounded-full border border-[var(--color)] bg-white p-1 empty:hidden data-[expanded=true]:flex-col data-[expanded=true]:rounded-lg data-[focused=true]:border-2 data-[expanded=true]:shadow-sm"
            >
              {routeIds.map((routeId) => (
                <RouteFlag key={routeId} routeId={routeId} expanded={hovered} />
              ))}
            </div>
          </div>
        </EdgeLabelRenderer>
      </>
    )
  },
)
