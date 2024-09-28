import type { NodeId, Node } from "../node/node"
import type { Receiver } from "@/lib/receiver"
import type { Id } from "@/utils/idType"
import type { Replace } from "@/utils/typeUtil"

export type RouteId = Id & { __routeId: never }

export type Color = string
export type Page = number

export type Route = {
  id: RouteId
  name: string
  path: Node[]
  color: Color
  page: Page
}

export type PrimitiveRoute = Replace<Route, "path", NodeId[]>

export const appendNodeToRoute = ((route: PrimitiveRoute, nodeId: NodeId) => {
  return {
    ...route,
    path: [...route.path, nodeId],
  }
}) satisfies Receiver<PrimitiveRoute>

export const insertNodeToRoute = ((
  route: PrimitiveRoute,
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
}) satisfies Receiver<PrimitiveRoute>

export const updateRoute = ((
  route: PrimitiveRoute,
  newRoute: Partial<Pick<PrimitiveRoute, "name" | "color" | "page">>,
) => {
  return {
    ...route,
    ...newRoute,
  }
}) satisfies Receiver<PrimitiveRoute>

export const removeNodeFromRoute = ((route: PrimitiveRoute, nodeId: NodeId) => {
  return {
    ...route,
    paths: route.path.filter((id) => id !== nodeId),
  }
}) satisfies Receiver<PrimitiveRoute>

// レシーバーの要件を満たすか微妙
export const cloneRoute = ((route: PrimitiveRoute, newId: RouteId) => {
  const { path, color, page } = route
  return {
    id: newId,
    name: `${route.name} (copy)`,
    path,
    color,
    page,
  }
}) satisfies Receiver<PrimitiveRoute>
