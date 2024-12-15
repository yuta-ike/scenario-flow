import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { primitiveRoutesAtom } from "../datasource/route"

import type { NodeId } from "../entity/node/node"

export const childrenNodeMapAtom = atomFamily((page?: string) => {
  const newAtom = atom((get) => {
    const routes = get(primitiveRoutesAtom)
    const filtered =
      page == null ? routes : routes.filter((route) => route.page === page)

    const map = new Map<NodeId, Set<NodeId>>()

    for (const route of filtered) {
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
  newAtom.debugLabel = `childrenNodeMapAtom(${page})`
  return newAtom
})

export const getChildrenByNodeId = atomFamily((nodeId: NodeId, page?: string) =>
  atom(
    (get) =>
      get(childrenNodeMapAtom(page)).get(nodeId)?.values().toArray() ?? [],
  ),
)
