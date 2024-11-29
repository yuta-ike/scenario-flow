import { atom, useAtom, useAtomValue } from "jotai"
import { useMemo } from "react"
import { atomFamily } from "jotai/utils"

import { currentPageAtom } from "../state/page"

import type { ResolvedAction } from "@/domain/entity/action/action"
import type { NodeId } from "@/domain/entity/node/node"
import type { ResourceId } from "@/domain/entity/resource/resource"
import type { PrimitiveRoute, RouteId } from "@/domain/entity/route/route"
import type { ActionSourceIdentifier } from "@/domain/entity/action/identifier"

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
import {
  getRouteIdsByNodeId,
  getRoutesByNodeId,
} from "@/domain/selector/getRouteIdsByNodeId"
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
import { decomposedForLibAtom } from "@/domain/selector/decomposedForPlugin"
import {
  latestResolvedNodeRunResultAtom,
  nodeStatesAtom,
} from "@/domain/datasource/nodeStates"
import { dedupeArrayByKey } from "@/utils/array"

const nullAtom = atom(null)

export const useNodeIds = () => useAtomValue(nodeIdsAtom).values().toArray()

export const useNode = (id: NodeId) => useAtomValue(nodeAtom(id))

export const useActionIds = (): ActionSourceIdentifier[] =>
  useAtomValue(actionIdsAtom).values().toArray()

export const useAction = (identifier: ActionSourceIdentifier): ResolvedAction =>
  useAtomValue(resolvedActionAtom(identifier))

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

export const routeIdsBetweenAtom = atomFamily(
  ({ source, target }: { source: NodeId | null; target: NodeId }) => {
    const newAtom = atom((get) => {
      const page = get(currentPageAtom)
      if (source == null) {
        return get(getRouteIdsByNodeId(target)).filter(
          (routeId) => get(primitiveRouteAtom(routeId)).page === page,
        )
      }
      const routes = get(getRoutesByNodeId(target)).filter(
        (route) => route.page === page,
      )
      return routes

        .filter((route) => {
          const sourceIndex = route.path.indexOf(source)
          const targetIndex = route.path.indexOf(target)
          return (
            0 <= sourceIndex &&
            0 <= targetIndex &&
            sourceIndex + 1 === targetIndex
          )
        })
        .map((route) => route.id)
    })
    newAtom.debugLabel = `routeIdsBetweenAtom(${source}, ${target})`
    return newAtom
  },
)

export const useRouteIdsBetween = (source: NodeId, target: NodeId) => {
  return useAtomValue(
    useMemo(
      () =>
        routeIdsBetweenAtom({
          source: source === "$root" ? null : source,
          target,
        }),
      [source, target],
    ),
  )
}

export const useEdges = (routes: PrimitiveRoute[], initialNodeId: NodeId) => {
  return useMemo(() => {
    const rootNodeIds = new Set(
      routes.map((route) => route.path[0]).filter((nodeId) => nodeId != null),
    )
      .values()
      .toArray()

    const edgePairs = routes.flatMap((route) => {
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
      edgePairs.push([initialNodeId, rootNodeId])
    })

    const edges = edgePairs.map(([source, target]) => ({
      id: `${source}-${target}`,
      source,
      target,
      type: "basicEdge",
    }))
    return dedupeArrayByKey(edges, "id")
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
export const useDecomposedForLib = () => useAtomValue(decomposedForLibAtom)

export const useMeta = () => useAtom(metaAtom)

// node states
export const useNodeStates = (nodeId: NodeId) =>
  useAtomValue(nodeStatesAtom(nodeId))

export const useLatestResolvedRunResult = (nodeId: NodeId) =>
  useAtomValue(latestResolvedNodeRunResultAtom(nodeId))
