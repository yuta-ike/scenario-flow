import { atom, useAtomValue, useSetAtom } from "jotai"
import { useCallback } from "react"
import { atomFamily } from "jotai/utils"

import type { NodeId } from "@/domain/entity/node/node"

// TODO: action instance id単体で動作するように
const focusedNodeId = atom<NodeId | null>(null)

const isNodeFocused = atomFamily((nodeId: NodeId) =>
  atom((get) => get(focusedNodeId) === nodeId),
)

export const useSetFocusedActionInstanceId = (nodeId: NodeId) => {
  const set = useSetAtom(focusedNodeId)
  return useCallback(() => set(nodeId), [nodeId, set])
}
export const useResetFocusNodeId = () => {
  const set = useSetAtom(focusedNodeId)
  return useCallback(() => set(null), [set])
}

export const useFocusedNodeId = () => useAtomValue(focusedNodeId)

export const useIsNodeFocused = (nodeId: NodeId) => {
  return useAtomValue(isNodeFocused(nodeId))
}
