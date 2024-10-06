import { atom, useAtom, useAtomValue } from "jotai"
import { useMemo } from "react"

import type { ActionId, ResolvedAction } from "@/domain/entity/action/action"
import type { NodeId } from "@/domain/entity/node/node"
import type { ResourceId } from "@/domain/entity/resource/resource"
import type { RouteId } from "@/domain/entity/route/route"

import { nodeAtom, nodeIdsAtom } from "@/domain/datasource/node"
import {
  resourceAtom,
  resourceIdsAtom,
  resourcesAtom,
} from "@/domain/datasource/resource"
import {
  primitiveRouteAtom,
  routeAtom,
  routeIdsAtom,
  primitiveRoutesAtom,
} from "@/domain/datasource/route"
import {
  actionIdsAtom,
  actionsAtom,
  resolvedActionAtom,
} from "@/domain/datasource/actions"
import { getRouteIdsByNodeId } from "@/domain/selector/getRouteIdsByNodeId"
import {
  getResolvedNodeEnvironment,
  getResolvedParentNodeEnvironment,
} from "@/domain/selector/getRouteEnvironment"
import { metaAtom } from "@/domain/datasource/meta"
import {
  globalVariableMatrixAtom,
  globalVariablesAtom,
  patternsAtom,
} from "@/domain/datasource/globalVariable"
import { decomposedAtom } from "@/domain/selector/decomposed"
import { exportPluginIdAtom } from "@/domain/datasource/plugin"
import { exportPlugins } from "@/plugins"

const nullAtom = atom(null)

export const useNodeIds = () => useAtomValue(nodeIdsAtom).values().toArray()

export const useNode = (id: NodeId) => useAtomValue(nodeAtom(id))

export const useActionIds = (): ActionId[] =>
  useAtomValue(actionIdsAtom).values().toArray()

export const useAction = (actionId: ActionId): ResolvedAction =>
  useAtomValue(resolvedActionAtom(actionId))

export const useActions = () => useAtomValue(actionsAtom)

export const useResource = (id: ResourceId) => useAtomValue(resourceAtom(id))

export const useResourceIds = () =>
  useAtomValue(resourceIdsAtom).values().toArray()

export const useResources = () => useAtomValue(resourcesAtom)

export const useRouteIds = () => useAtomValue(routeIdsAtom).values().toArray()
export const useRoute = (routeId: RouteId) => useAtomValue(routeAtom(routeId))
export const usePrimitiveRoute = (routeId: RouteId) =>
  useAtomValue(primitiveRouteAtom(routeId))
export const useNullablePrimitiveRoute = (routeId: RouteId | null) =>
  useAtomValue(
    useMemo(
      () => (routeId == null ? nullAtom : primitiveRouteAtom(routeId)),
      [routeId],
    ),
  )
export const useRoutes = () => useAtomValue(primitiveRoutesAtom)

export const useRouteIdsBetween = (
  sourceNodeId: NodeId | null,
  targetNodeId: NodeId,
) => {
  const sourceIds = useAtomValue(
    useMemo(
      () =>
        sourceNodeId == null ? atom(null) : getRouteIdsByNodeId(sourceNodeId),
      [sourceNodeId],
    ),
  )
  const targetIds = useAtomValue(getRouteIdsByNodeId(targetNodeId))

  const routeIds = useMemo(() => {
    if (sourceIds == null) {
      return targetIds
    }
    return new Set(sourceIds)
      .intersection(new Set(targetIds))
      .values()
      .toArray()
  }, [sourceIds, targetIds])
  return routeIds
}

export const useEdges = (initialNodeId: NodeId) => {
  const routes = useRoutes()

  return useMemo(() => {
    const rootNodeIds = new Set(
      routes.map((route) => route.path[0]).filter((nodeId) => nodeId != null),
    )
      .values()
      .toArray()

    const edges = routes.flatMap((route) => {
      const edges: [NodeId, NodeId][] = []
      let prevNodeId: NodeId | null = null
      for (const nodeId of route.path) {
        if (prevNodeId != null) {
          edges.push([prevNodeId, nodeId])
        }
        prevNodeId = nodeId
      }
      return edges
    })

    rootNodeIds.forEach((rootNodeId) => {
      edges.push([initialNodeId, rootNodeId])
    })

    return edges.map(([source, target]) => ({
      id: `${source}-${target}`,
      source,
      target,
      type: "basicEdge",
    }))
  }, [initialNodeId, routes])
}

// environment
export const useNodeEnvironment = (nodeId: NodeId) =>
  useAtomValue(getResolvedNodeEnvironment(nodeId))

export const useParentNodeEnvironment = (nodeId: NodeId) =>
  useAtomValue(getResolvedParentNodeEnvironment(nodeId))

// global variable
export const useGlobalVariableMatrix = () => {
  const globalVariableMatrix = useAtomValue(globalVariableMatrixAtom)
  return globalVariableMatrix
}
export const usePatterns = () => useAtomValue(patternsAtom)
export const useGlobalVariables = () => useAtomValue(globalVariablesAtom)

// code export
const decomposedForLibAtom = atom((get) => {
  const exportPluginId = get(exportPluginIdAtom)
  const decomposed = get(decomposedAtom)
  return decomposed.map((scenario) =>
    exportPlugins[exportPluginId].convertDecomposedToLibFormat(scenario),
  )
})
export const useDecomposedForLib = () => useAtomValue(decomposedForLibAtom)

export const useMeta = () => useAtom(metaAtom)
