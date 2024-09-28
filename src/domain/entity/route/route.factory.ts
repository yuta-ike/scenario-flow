import { toNodeId } from "../node/node.util"

import { toRouteId } from "./route.util"

import type { Node } from "../node/node"
import type { PrimitiveRoute, Route } from "./route"

export const genPrimitiveRoute = (
  id: string,
  path: string[],
  overrides?: Partial<PrimitiveRoute>,
): PrimitiveRoute => ({
  id: toRouteId(id),
  path: path.map(toNodeId),
  name: `route ${id}`,
  color: "#000000",
  page: 0,
  ...overrides,
})

export const genRoute = (
  id: string,
  path: Node[],
  overrides?: Partial<Route>,
): Route => ({
  id: toRouteId(id),
  path,
  name: `route ${id}`,
  color: "#000000",
  page: 0,
  ...overrides,
})
