import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { primitiveRouteAtom, primitiveRoutesAtom } from "../datasource/route"

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

export const getRouteIdsByNodeId = atomFamily((nodeId: NodeId) => {
  const newAtom = atom(
    (get) => get(routeNodeMap).get(nodeId)?.values().toArray() ?? [],
  )
  newAtom.debugLabel = `getRouteIdsByNodeId(${nodeId})`
  return newAtom
})

export const getRoutesByNodeId = atomFamily((nodeId: NodeId) => {
  const newAtom = atom((get) =>
    get(getRouteIdsByNodeId(nodeId)).map((routeId) =>
      get(primitiveRouteAtom(routeId)),
    ),
  )
  newAtom.debugLabel = `getRoutesByNodeId(${nodeId})`
  return newAtom
})
