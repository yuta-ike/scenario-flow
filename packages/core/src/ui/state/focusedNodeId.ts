import { atom, useAtomValue } from "jotai"
import { useCallback } from "react"
import { atomFamily, useAtomCallback } from "jotai/utils"
import { NodeId } from "../../domain/entity"
import { useStore } from "../lib/provider"

const focusedNodeId = atom<NodeId | null>(null)

const isNodeFocused = atomFamily((nodeId: NodeId) =>
  atom((get) => get(focusedNodeId) === nodeId),
)

export const useFocusNode = () =>
  useAtomCallback(
    useCallback((_, set, nodeId: NodeId) => {
      set(focusedNodeId, nodeId)
    }, []),
    { store: useStore().store },
  )
export const useResetFocusNodeId = () =>
  useAtomCallback(
    useCallback((_, set) => set(focusedNodeId, null), []),
    { store: useStore().store },
  )

export const useFocusedNodeId = () =>
  useAtomValue(focusedNodeId, { store: useStore().store })

export const useIsNodeFocused = (nodeId: NodeId) => {
  return useAtomValue(isNodeFocused(nodeId), { store: useStore().store })
}

const focusedNodeExists = atom((get) => get(focusedNodeId) !== null)
export const useFocusedNodeExists = () =>
  useAtomValue(focusedNodeExists, { store: useStore().store })
