import type { Builder, BuilderReturn, Transition } from "../type"
import type { NodeId, Node } from "../node/node"
import type { Id } from "@/utils/idType"
import type { Replace } from "@/utils/typeUtil"

declare const _route: unique symbol
export type RouteId = Id & { [_route]: never }

export type Color = string
export type Page = string

export type Route = {
  [_route]: never
  id: RouteId
  name: string
  path: Node[]
  color: Color
  page: Page
}
export const buildRoute: Builder<Route> = (id, params) => {
  return { id, ...params } satisfies BuilderReturn<Route> as Route
}

export type PrimitiveRoute = Replace<Route, "path", NodeId[]>
export type RawPrimitiveRoute = Omit<PrimitiveRoute, typeof _route>
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

export const insertNodeToRoute: Transition<PrimitiveRoute> = (
  route,
  nodeId: NodeId,
  parentNodeId: NodeId,
) => {
  const index = route.path.indexOf(parentNodeId)

  if (index < -1) {
    throw new Error("parentNode is not found in route")
  }

  return {
    ...route,
    path: [
      ...route.path.slice(0, index),
      nodeId,
      ...route.path.slice(index + 1),
    ],
  }
}

export const updateRoute: Transition<PrimitiveRoute> = (
  route,
  newRoute: Partial<Pick<PrimitiveRoute, "name" | "color" | "page">>,
) => {
  return {
    ...route,
    ...newRoute,
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
