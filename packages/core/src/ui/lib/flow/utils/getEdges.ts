import type { NodeId } from "@/domain/entity/node/node"
import type { PrimitiveRoute } from "@/domain/entity/route/route"

import { dedupeArrayByKey, uniq } from "@/utils/array"

const getRootNodeIds = (routes: PrimitiveRoute[]) =>
  uniq(routes.map((route) => route.path[0]).filter((nodeId) => nodeId != null))

const getEdgesInRoute = (route: PrimitiveRoute) => {
  const edges: [NodeId, NodeId][] = []
  let prevNodeId: NodeId | null = null
  for (const nodeId of route.path) {
    if (prevNodeId != null) {
      edges.push([prevNodeId, nodeId])
    }
    prevNodeId = nodeId
  }
  return edges
}

export const getEdges = (routes: PrimitiveRoute[], initialNodeId: NodeId) => {
  const edgePairs = routes.flatMap<[string, string]>((route) => {
    const edges = getEdgesInRoute(route)
    if (edges.length === 0) {
      return []
    }
    const lastNodeId = edges.at(-1)?.[1]

    return [...edges, [lastNodeId!, `${lastNodeId!}_virtual`]]
  })

  const rootNodeIds = getRootNodeIds(routes)
  rootNodeIds.forEach((rootNodeId) => {
    edgePairs.push([initialNodeId, rootNodeId])
  })

  const edges = edgePairs.map(([source, target]) => ({
    id: `${source}-${target}`,
    source,
    target,
    type: target.endsWith("_virtual") ? "skeltonEdge" : "basicEdge",
  }))
  return dedupeArrayByKey(edges, "id")
}
