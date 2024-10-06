import { resolveExpression } from "../entity/value/expression.util"

import type { TypedValue } from "../entity/value/dataType"
import type { Meta } from "../entity/meta/meta"
import type { Decomposed, DecomposedStep } from "../entity/decompose/decomposed"
import type { GlobalVariable } from "../entity/globalVariable/globalVariable"
import type { Route } from "../entity/route/route"
import type { Node } from "../entity/node/node"

import { genId } from "@/utils/uuid"
import { kvToRecordNullable } from "@/ui/lib/kv"

const decomposeStepItem = (node: Node): DecomposedStep => {
  const title =
    node.actionInstances.find((ai) => ai.type === "rest_call")?.action.name ??
    genId()

  return {
    id: title,
    title,
    actions: node.actionInstances.map((ai) => {
      if (ai.type === "rest_call") {
        const pathParams =
          kvToRecordNullable(ai.instanceParameter.pathParams) ?? {}
        const body = ai.instanceParameter.body

        return {
          type: "rest_call",
          description: ai.instanceParameter.description,
          path: resolveExpression(ai.action.parameter.path, pathParams),
          method: ai.action.parameter.method,
          headers: ai.instanceParameter.headers,
          cookies: ai.instanceParameter.cookies,
          queryParams: ai.instanceParameter.queryParams,
          contentType: body?.selected ?? undefined,
          body: body?.selected != null && body.params[body.selected],
        }
      } else if (ai.type === "validator") {
        return {
          type: "validator",
          description: ai.instanceParameter.description,
          contents: ai.instanceParameter.contents,
        }
      } else {
        return {
          type: "binder",
          assignments: ai.instanceParameter.assignments.map((assignment) => ({
            variable: assignment.variable,
            value: assignment.value,
          })),
        }
      }
    }),
  }
}

const decomposeRoute = (
  route: Route,
  globalVariables: (GlobalVariable & { value: TypedValue })[],
  meta: Meta,
): Decomposed => {
  return {
    id: route.id,
    color: route.color,
    title: route.name,
    globalVariables,
    endpoint: meta.endpoint,
    steps: route.path.map(decomposeStepItem),
  } satisfies Decomposed
}

export const decompose = (
  routes: Route[],
  globalVariables: (GlobalVariable & {
    value: TypedValue
  })[],
  meta: Meta,
): Decomposed[] => {
  return routes.map((route) => decomposeRoute(route, globalVariables, meta))
}
