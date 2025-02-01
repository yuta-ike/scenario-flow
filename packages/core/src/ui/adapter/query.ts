import { atom, useAtom, useAtomValue } from "jotai"
import { useMemo } from "react"
import { atomFamily } from "jotai/utils"

import { currentPageAtom } from "../state/page"
import {
  actionIdsAtom,
  resolvedActionAtom,
  actionsAtom,
} from "../../domain/datasource/actions"
import {
  globalVariableMatrixAtom,
  patternsAtom,
  globalVariablesAtom,
} from "../../domain/datasource/globalVariable"
import { metaAtom } from "../../domain/datasource/meta"
import {
  nodeIdsAtom,
  primitiveNodeAtom,
  nodeAtom,
  actionIdCountCache,
} from "../../domain/datasource/node"
import {
  nodeStatesAtom,
  latestResolvedNodeRunResultAtom,
} from "../../domain/datasource/nodeStates"
import {
  resourceAtom,
  resourceIdsAtom,
  resourcesAtom,
} from "../../domain/datasource/resource"
import {
  routeIdsAtom,
  routeAtom,
  primitiveRouteAtom,
  primitiveRoutesAtom,
} from "../../domain/datasource/route"
import { userDefinedActionIdsAtom } from "../../domain/datasource/userDefinedAction"
import { decomposedForLibAtom } from "../../domain/selector/decomposedForPlugin"
import {
  getResolvedNodeEnvironment,
  getResolvedParentNodeEnvironment,
} from "../../domain/selector/getRouteEnvironment"
import {
  getRouteIdsByNodeId,
  getRoutesByNodeId,
} from "../../domain/selector/getRouteIdsByNodeId"
import {
  NodeId,
  ActionSourceIdentifier,
  ResolvedAction,
  ResourceId,
  getUserDefinedActionIdOrNull,
  RouteId,
} from "../../domain/entity"
import { useStore } from "../lib/provider"

const nullAtom = atom(null)

// STOREの更新！！！！！！！！！
export const useNodeIds = () =>
  useAtomValue(nodeIdsAtom, { store: useStore().store }).values().toArray()

export const usePrimitveNode = (id: NodeId) =>
  useAtomValue(primitiveNodeAtom(id), { store: useStore().store })

export const useNode = (id: NodeId) =>
  useAtomValue(nodeAtom(id), { store: useStore().store })

export const useActionIds = (): ActionSourceIdentifier[] =>
  useAtomValue(actionIdsAtom, { store: useStore().store }).values().toArray()

export const useAction = (identifier: ActionSourceIdentifier): ResolvedAction =>
  useAtomValue(resolvedActionAtom(identifier), { store: useStore().store })

export const useActions = () =>
  useAtomValue(actionsAtom, { store: useStore().store })

export const useResource = (id: ResourceId) =>
  useAtomValue(resourceAtom(id), { store: useStore().store })

const resourceNameAtom = atomFamily((identifier: ActionSourceIdentifier) => {
  const newAtom = atom((get) => {
    if (identifier.resourceType === "user_defined") {
      return "ユーザー定義"
    }
    const resource = get(resourceAtom(identifier.resourceIdentifier.resourceId))
    return resource.name
  })
  return newAtom
})

export const useResourceName = (identifier: ActionSourceIdentifier) =>
  useAtomValue(resourceNameAtom(identifier), { store: useStore().store })

export const useResourceIds = () =>
  useAtomValue(resourceIdsAtom, { store: useStore().store }).values().toArray()

export const useUserDefinedActionIds = () =>
  useAtomValue(userDefinedActionIdsAtom, { store: useStore().store })
    .values()
    .toArray()

export const userDefinedActionByIdCountAtom = atomFamily(
  (identifier: ActionSourceIdentifier) =>
    atom((get) => {
      const id = getUserDefinedActionIdOrNull(identifier)
      return id == null ? 0 : (get(actionIdCountCache).get(id) ?? 0)
    }),
)
export const useUserDefinedActionRefCount = (
  identifier: ActionSourceIdentifier,
) =>
  useAtomValue(userDefinedActionByIdCountAtom(identifier), {
    store: useStore().store,
  })

export const useResources = () =>
  useAtomValue(resourcesAtom, { store: useStore().store })

export const useRouteIds = () =>
  useAtomValue(routeIdsAtom, { store: useStore().store }).values().toArray()
export const useRoute = (routeId: RouteId) =>
  useAtomValue(routeAtom(routeId), { store: useStore().store })
export const usePrimitiveRoute = (routeId: RouteId) =>
  useAtomValue(primitiveRouteAtom(routeId), { store: useStore().store })
export const useNullablePrimitiveRoute = (routeId: RouteId | null) =>
  useAtomValue(
    useMemo(
      () => (routeId == null ? nullAtom : primitiveRouteAtom(routeId)),
      [routeId],
    ),
    { store: useStore().store },
  )
export const useRoutes = () =>
  useAtomValue(primitiveRoutesAtom, { store: useStore().store })

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
    { store: useStore().store },
  )
}

// environment
export const useNodeEnvironment = (nodeId: NodeId) =>
  useAtomValue(getResolvedNodeEnvironment(nodeId), { store: useStore().store })

export const useParentNodeEnvironment = (nodeId: NodeId) =>
  useAtomValue(getResolvedParentNodeEnvironment(nodeId), {
    store: useStore().store,
  })

// global variable
export const useGlobalVariableMatrix = () => {
  const globalVariableMatrix = useAtomValue(globalVariableMatrixAtom, {
    store: useStore().store,
  })
  return globalVariableMatrix
}
export const usePatterns = () =>
  useAtomValue(patternsAtom, { store: useStore().store })
export const useGlobalVariables = () =>
  useAtomValue(globalVariablesAtom, { store: useStore().store })

// code export
export const useDecomposedForLib = () =>
  useAtomValue(decomposedForLibAtom, { store: useStore().store })

export const useMeta = () => useAtom(metaAtom, { store: useStore().store })

// node states
export const useNodeStates = (nodeId: NodeId) =>
  useAtomValue(nodeStatesAtom(nodeId), { store: useStore().store })

export const useLatestResolvedRunResult = (nodeId: NodeId) =>
  useAtomValue(latestResolvedNodeRunResultAtom(nodeId), {
    store: useStore().store,
  })
