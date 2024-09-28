import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { primitiveRoutesAtom } from "../datasource/route"

import type { NodeId } from "../entity/node/node"
import type { RouteId } from "../entity/route/route"

export const routeNodeMap = atom((get) => {
  const routes = get(primitiveRoutesAtom)

  const map = new Map<NodeId, Set<RouteId>>()

  for (const route of routes) {
    for (const nodeId of route.path) {
      const prevSet = map.get(nodeId) ?? new Set()
      map.set(nodeId, prevSet.union(new Set([route.id])))
    }
  }

  return map
})

// TODO: 再レンダリングを防ぐ方法
export const getRouteIdsByNodeId = atomFamily((nodeId: NodeId) =>
  atom((get) => get(routeNodeMap).get(nodeId)?.values().toArray() ?? []),
)
