import { resolveExpression } from "../entity/value/expression.util"

import type { Expression } from "../entity/value/expression"
import type { TypedValue } from "../entity/value/dataType"
import type { Meta } from "../entity/meta/meta"
import type { Decomposed, DecomposedStep } from "../entity/decompose/decomposed"
import type { GlobalVariable } from "../entity/globalVariable/globalVariable"
import type { Route } from "../entity/route/route"
import type { Node } from "../entity/node/node"

import { kvToRecordNullable } from "@/ui/lib/kv"

const decomposeStepItem = (node: Node): DecomposedStep => {
  return {
    id: node.name,
    title: node.name,
    actions: node.actionInstances.flatMap((ai) => {
      if (ai.type === "rest_call") {
        const pathParams =
          kvToRecordNullable(ai.instanceParameter.pathParams) ?? {}
        const body = ai.instanceParameter.body

        return {
          type: "rest_call",
          description: ai.description,
          path: resolveExpression(
            ai.instanceParameter.path as Expression,
            pathParams,
          ),
          method: ai.instanceParameter.method!,
          headers: ai.instanceParameter.headers,
          cookies: ai.instanceParameter.cookies,
          queryParams: ai.instanceParameter.queryParams,
          contentType: body?.selected ?? undefined,
          body: body?.selected != null && body.params[body.selected],
        }
      } else if (ai.type === "validator") {
        return {
          type: "validator",
          contents: ai.instanceParameter.contents,
        }
      } else if (ai.type === "binder") {
        return {
          type: "binder",
          assignments: ai.instanceParameter.assignments.map((assignment) => ({
            variable: assignment.variable,
            value: assignment.value,
          })),
        }
      } else {
        return []
      }
    }),
    condition: node.config.condition,
    loop: node.config.loop,
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
