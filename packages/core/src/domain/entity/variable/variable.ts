import type { ResolvedVariable } from "../environment/variable"
import type { RouteId } from "../route/route"
import type { NodeId } from "../node/node"
import type { Builder, BuilderReturn, Receiver } from "../type"
import type { JSONSchema7 } from "json-schema"
import type { Id } from "@/utils/idType"

declare const _localVariable: unique symbol

export type LocalVariableId = Id & { [_localVariable]: never }

export type LocalVariableBoundIn = NodeId | { type: "route"; routeId: RouteId }

export type LocalVariable = {
  [_localVariable]: never
  id: LocalVariableId
  namespace?: "vars" | "steps"
  name: string
  schema: "any" | JSONSchema7
  description: string
  boundIn: LocalVariableBoundIn
}

export const buildLocalVariable: Builder<LocalVariable> = (id, params) => {
  return {
    id,
    ...params,
  } satisfies BuilderReturn<LocalVariable> as LocalVariable
}

export const getBoundIn: Receiver<
  ResolvedVariable,
  [],
  { global?: true; nodeId?: NodeId; routeId?: RouteId } | null
> = (variable) =>
  variable.boundIn === "global"
    ? {
        global: true,
      }
    : variable.boundIn.type === "node"
      ? {
          nodeId: variable.boundIn.node.id,
        }
      : {
          routeId: variable.boundIn.route.id,
        }
