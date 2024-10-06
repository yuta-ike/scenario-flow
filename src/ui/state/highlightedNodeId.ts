import { atom, useAtomValue, useSetAtom } from "jotai"
import { useCallback, useEffect } from "react"
import { atomFamily } from "jotai/utils"

import type { NodeId } from "@/domain/entity/node/node"

const highlightedNodeId = atom<NodeId | null>(null)

const isNodeHighlighted = atomFamily((nodeId: NodeId) =>
  atom((get) => get(highlightedNodeId) === nodeId),
)

export const useSetHighlightedNodeId = () => {
  const set = useSetAtom(highlightedNodeId)
  return useCallback((nodeId: NodeId | null) => set(nodeId), [set])
}
export const useHighlightedNodeId = () => useAtomValue(highlightedNodeId)

export const useIsNodeHighlighted = (nodeId: NodeId) => {
  return useAtomValue(isNodeHighlighted(nodeId))
}

export const useReleaseHighlight = () => {
  const set = useSetHighlightedNodeId()
  useEffect(() => {
    const handler = () => {
      set(null)
    }
    window.addEventListener("click", handler)
    return () => window.removeEventListener("click", handler)
  }, [set])
}
