import { atom, useAtomValue } from "jotai"
import { useCallback } from "react"
import { atomFamily, useAtomCallback } from "jotai/utils"

import type { NodeId } from "@/domain/entity/node/node"

const focusedNodeId = atom<NodeId | null>(null)

const isNodeFocused = atomFamily((nodeId: NodeId) =>
  atom((get) => get(focusedNodeId) === nodeId),
)

export const useFocusNode = () =>
  useAtomCallback(
    useCallback((_, set, nodeId: NodeId) => {
      set(focusedNodeId, nodeId)
    }, []),
  )
export const useResetFocusNodeId = () =>
  useAtomCallback(useCallback((_, set) => set(focusedNodeId, null), []))

export const useFocusedNodeId = () => useAtomValue(focusedNodeId)

export const useIsNodeFocused = (nodeId: NodeId) => {
  return useAtomValue(isNodeFocused(nodeId))
}
