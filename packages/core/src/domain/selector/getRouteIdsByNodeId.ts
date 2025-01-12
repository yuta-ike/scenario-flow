import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { nodeIdRouteIdCache, primitiveRouteAtom } from "../datasource/route"

import type { NodeId } from "../entity/node/node"

export const getRouteIdsByNodeId = atomFamily((nodeId: NodeId) => {
  const newAtom = atom(
    (get) => get(nodeIdRouteIdCache).get(nodeId)?.values().toArray() ?? [],
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
