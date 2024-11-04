import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { primitiveRoutesAtom } from "../datasource/route"

import type { NodeId } from "../entity/node/node"

export const childrenNodeMapAtom = atom((get) => {
  const routes = get(primitiveRoutesAtom)

  const map = new Map<NodeId, Set<NodeId>>()

  for (const route of routes) {
    let parentNodeId: NodeId | null = null
    for (const nodeId of route.path) {
      if (parentNodeId != null) {
        const prevSet = map.get(parentNodeId) ?? new Set()
        map.set(parentNodeId, prevSet.union(new Set([nodeId])))
      }
      parentNodeId = nodeId
    }
  }

  return map
})

export const getChildrenByNodeId = atomFamily((nodeId: NodeId) =>
  atom((get) => get(childrenNodeMapAtom).get(nodeId)?.values().toArray() ?? []),
)
