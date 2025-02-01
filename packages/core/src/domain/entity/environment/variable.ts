import type { PrimitiveRoute, RouteId } from "../route/route"
import type { Receiver } from "../type"
import type { NodeId, PrimitiveNode } from "../node/node"
import type {
  GlobalVariable,
  GlobalVariableId,
} from "../globalVariable/globalVariable"
import type { LocalVariable, LocalVariableId } from "../variable/variable"
import { Replace } from "@scenario-flow/util"

export type Variable = GlobalVariable | LocalVariable
export type VariableId = GlobalVariableId | LocalVariableId

export type ResolvedVariable = Replace<
  Variable,
  "boundIn",
  | "global"
  | { type: "node"; node: PrimitiveNode }
  | { type: "route"; route: PrimitiveRoute }
>

export const getVariableName: Receiver<
  Variable | ResolvedVariable,
  [],
  string
> = (variable) =>
  variable.namespace == null
    ? variable.name
    : `${variable.namespace}.${variable.name}`

export const resolveVariable: Receiver<
  Variable,
  [
    {
      getRoute?: (routeId: RouteId) => PrimitiveRoute
      getNode?: (nodeId: NodeId) => PrimitiveNode
    },
  ],
  ResolvedVariable
> = (variable, { getRoute, getNode }) => {
  if (variable.boundIn === "global") {
    return {
      ...variable,
      boundIn: "global",
    }
  }

  if (typeof variable.boundIn === "string") {
    if (getNode === undefined) {
      throw new Error("getNode is required to resolve variable bound to node")
    }

    return {
      ...variable,
      boundIn: {
        type: "node",
        node: getNode(variable.boundIn),
      },
    }
  }

  if (getRoute === undefined) {
    throw new Error("getRoute is required to resolve variable bound to route")
  }
  return {
    ...variable,
    boundIn: {
      type: "route",
      route: getRoute(variable.boundIn.routeId),
    },
  }
}
