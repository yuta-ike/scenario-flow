import { useCallback } from "react"

import { useReactFlow } from "./FlowProvider"
import { NodeId } from "../../../domain/entity"

export const useFocusOn = () => {
  const reactFlow = useReactFlow()
  return useCallback(
    async (nodeIds: NodeId[]) => {
      await reactFlow?.fitView({
        nodes: nodeIds.map((nodeId) => ({ id: nodeId })),
        duration: 150,
        maxZoom: 1,
      })
    },
    [reactFlow],
  )
}
