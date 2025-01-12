import { getUniqName } from "../getUniqName"

import type { Expression } from "../value/expression"
import type { LocalVariable, LocalVariableId } from "../variable/variable"
import type { Builder, BuilderReturn, Transition } from "../type"
import type { NodeId, Node } from "../node/node"
import type { Id } from "@/utils/idType"

declare const _route: unique symbol
export type RouteId = Id & { [_route]: never }

export type Color = string
export type Page = string

export type PrimitiveRoute = {
  [_route]: never
  id: RouteId
  name: string
  description: string
  path: NodeId[]
  color: Color
  page: Page
  variables: { id: LocalVariableId; value: Expression }[]
}

export type Route = {
  [_route]: never
  id: RouteId
  name: string
  path: Node[]
  color: Color
  page: Page
  variables: { variable: LocalVariable; value: Expression }[]
}

export const buildRoute: Builder<Route, [usedNames?: string[]]> = (
  id,
  { name, ...params },
  usedNames = [],
) => {
  const uniqName = getUniqName(name, usedNames)
  return {
    id,
    name: uniqName,
    ...params,
  } satisfies BuilderReturn<Route> as Route
}

export const buildPrimitiveRoute: Builder<PrimitiveRoute> = (id, params) => {
  return {
    id,
    ...params,
  } satisfies BuilderReturn<PrimitiveRoute> as PrimitiveRoute
}

export const appendNodesToRoute: Transition<PrimitiveRoute, NodeId[]> = (
  route,
  ...nodeIds
) => {
  return {
    ...route,
    path: [...route.path, ...nodeIds],
  }
}

export const insertNodeToRoute: Transition<
  PrimitiveRoute,
  [NodeId, NodeId | null]
> = (route, nodeId, parentNodeId) => {
  if (parentNodeId == null) {
    return {
      ...route,
      path: [nodeId, ...route.path],
    }
  } else {
    const index = route.path.indexOf(parentNodeId)

    if (index < -1) {
      throw new Error("parentNode is not found in route")
    }

    return {
      ...route,
      path: [
        ...route.path.slice(0, index),
        parentNodeId,
        nodeId,
        ...route.path.slice(index + 1),
      ],
    }
  }
}
export const updateRoute: Transition<PrimitiveRoute> = (
  route,
  params: Partial<Pick<PrimitiveRoute, "name" | "color" | "page">>,
  usedNames: string[],
) => {
  const name =
    params.name === route.name
      ? route.name
      : params.name != null
        ? getUniqName(params.name, usedNames)
        : undefined

  return {
    ...route,
    ...params,
    name: name ?? route.name,
  }
}

export const swapRoutePath: Transition<
  PrimitiveRoute,
  [a: NodeId, b: NodeId]
> = (route, routeIdA, routeIdB) => {
  const path = route.path.slice()
  const indexA = path.indexOf(routeIdA)
  const indexB = path.indexOf(routeIdB)
  path[indexA] = routeIdB
  path[indexB] = routeIdA
  return {
    ...route,
    path,
  }
}

export const removeNodeFromRoute: Transition<PrimitiveRoute, [NodeId]> = (
  route,
  nodeId,
) => {
  return {
    ...route,
    path: route.path.filter((id) => id !== nodeId),
  }
}

export const sliceRoute: Transition<PrimitiveRoute, [NodeId]> = (
  route,
  nodeId,
) => {
  const index = route.path.indexOf(nodeId)
  return {
    ...route,
    path: route.path.slice(0, index),
  }
}

export const updateRouteVariables: Transition<
  PrimitiveRoute,
  [{ id: LocalVariableId; value: Expression }[]]
> = (route, variables) => {
  const newVariables = route.variables.slice()
  variables.forEach(({ id: variableId, value }) => {
    const index = newVariables.findIndex((v) => v.id === variableId)
    if (index === -1) {
      newVariables.push({ id: variableId, value })
    } else {
      newVariables[index] = { id: variableId, value }
    }
  })

  return {
    ...route,
    variables: newVariables,
  }
}
