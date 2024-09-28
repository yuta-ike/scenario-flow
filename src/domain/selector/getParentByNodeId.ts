import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { primitiveRoutesAtom } from "../datasource/route"

import type { NodeId } from "../entity/node/node"

export const parentNodeMapAtom = atom((get) => {
  const routes = get(primitiveRoutesAtom)

  const map = new Map<NodeId, Set<NodeId>>()

  for (const route of routes) {
    let parentNodeId: NodeId | null = null
    for (const nodeId of route.path) {
      if (parentNodeId != null) {
        const prevSet = map.get(nodeId) ?? new Set()
        map.set(nodeId, prevSet.union(new Set([parentNodeId])))
      }

      parentNodeId = nodeId
    }
  }

  return map
})

export const getParentByNodeId = atomFamily((nodeId: NodeId) =>
  atom((get) => get(parentNodeMapAtom).get(nodeId)?.values().toArray() ?? []),
)
