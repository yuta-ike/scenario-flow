import { resolveExpression } from "../entity/value/expression.util"
import { display } from "../entity/resource/identifier"

import type { Resource } from "../entity/resource/resource"
import type { Expression } from "../entity/value/expression"
import type { TypedValue } from "../entity/value/dataType"
import type { Meta } from "../entity/meta/meta"
import type { Decomposed, DecomposedStep } from "../entity/decompose/decomposed"
import type { GlobalVariable } from "../entity/globalVariable/globalVariable"
import type { Route } from "../entity/route/route"
import type { Node } from "../entity/node/node"

import { kvToRecordNullable } from "@/ui/lib/kv"
import { unwrapNull } from "@/utils/result"

const decomposeStepItem = (
  node: Node,
  resourceMap: Map<string, Resource>,
): DecomposedStep => {
  return {
    id: node.id,
    title: node.name,
    description: node.description,
    actions: node.actionInstances.flatMap((ai) => {
      if (ai.type === "rest_call") {
        const pathParams =
          kvToRecordNullable(ai.instanceParameter.pathParams) ?? {}
        const body = ai.instanceParameter.body

        const meta =
          ai.action.resourceType === "resource"
            ? {
                "x-action-id": `${resourceMap.get(ai.action.resourceIdentifier.resourceId)?.name ?? ""}:${display(ai.action.resourceIdentifier.identifier)}`,
              }
            : undefined

        return {
          type: "rest_call" as const,
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
          meta,
        }
      } else if (ai.type === "validator") {
        return {
          type: "validator" as const,
          contents: ai.instanceParameter.contents,
        }
      } else if (ai.type === "binder") {
        return {
          type: "binder" as const,
          assignments: ai.instanceParameter.assignments.map((assignment) => ({
            variable: assignment.variable,
            value: assignment.value,
          })),
        }
      } else if (ai.type === "include") {
        return {
          type: "include" as const,
          ref: unwrapNull(ai.instanceParameter.ref)?.id ?? "",
          parameters: ai.instanceParameter.parameters.map((parameter) => ({
            variable: parameter.variable,
            value: parameter.value,
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
  resourceMap: Map<string, Resource>,
  meta: Meta,
): Decomposed => {
  return {
    id: route.id,
    color: route.color,
    title: route.name,
    globalVariables,
    endpoint: meta.endpoint,
    steps: route.path.map((node) => decomposeStepItem(node, resourceMap)),
    page: route.page,
  } satisfies Decomposed
}

export const decompose = (
  routes: Route[],
  globalVariables: (GlobalVariable & {
    value: TypedValue
  })[],
  resourceMap: Map<string, Resource>,
  meta: Meta,
): Decomposed[] => {
  return routes.map((route) =>
    decomposeRoute(route, globalVariables, resourceMap, meta),
  )
}
