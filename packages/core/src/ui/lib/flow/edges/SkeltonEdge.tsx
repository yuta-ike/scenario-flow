import { memo } from "react"
import { BaseEdge, getSmoothStepPath } from "@xyflow/react"

import type { Edge, EdgeProps } from "@xyflow/react"
import type { Replace } from "@/utils/typeUtil"

type EdgeData = {
  points: { x: number; y: number }[]
}
export const SkleltonEdge = memo<EdgeProps<Replace<Edge, "data", EdgeData>>>(
  ({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition }) => {
    const [edgePath] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    })
    return (
      <BaseEdge
        path={edgePath}
        interactionWidth={20}
        style={{
          strokeWidth: 1,
          strokeDasharray: "4 4",
        }}
        className="stroke-slate-200 stroke-[8px] opacity-50 transition-[translate]"
      />
    )
  },
)
