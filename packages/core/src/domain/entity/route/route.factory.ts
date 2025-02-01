import { toNodeId } from "../node/node.util"

import {
  buildPrimitiveRoute,
  buildRoute,
  type PrimitiveRoute,
  type Route,
} from "./route"

import type { Node } from "../node/node"

export const genPrimitiveRoute = (
  id: string,
  path: string[],
  overrides?: Partial<PrimitiveRoute>,
): PrimitiveRoute =>
  buildPrimitiveRoute(id, {
    path: path.map(toNodeId),
    name: `route ${id}`,
    description: "",
    color: "#000000",
    page: "0",
    variables: [],
    ...overrides,
  })

export const genRoute = (
  id: string,
  path: Node[],
  overrides?: Partial<Route>,
): Route =>
  buildRoute(id, {
    path,
    name: `route ${id}`,
    description: "",
    color: "#000000",
    page: "0",
    variables: [],
    ...overrides,
  })
