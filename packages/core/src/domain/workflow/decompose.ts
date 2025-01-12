import { resolveExpression } from "../entity/value/expression"
import { display } from "../entity/resource/identifier"

import type { Resource } from "../entity/resource/resource"
import type { Expression } from "../entity/value/expression"
import type { Meta } from "../entity/meta/meta"
import type { Decomposed, DecomposedStep } from "../entity/decompose/decomposed"
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

        console.log("================")
        console.log(
          ai.instanceParameter.path,
          pathParams,
          resolveExpression(
            ai.instanceParameter.path as Expression,
            pathParams,
          ),
        )
        return {
          type: "rest_call" as const,
          description: ai.description,
          path: resolveExpression(
            ai.instanceParameter.path as Expression,
            pathParams,
          ),
          method: ai.instanceParameter.method!,
          headers: ai.instanceParameter.headers?.filter(
            ({ key }) => 0 < key.length,
          ),
          cookies: ai.instanceParameter.cookies?.filter(
            ({ key }) => 0 < key.length,
          ),
          queryParams: ai.instanceParameter.queryParams?.filter(
            ({ key }) => 0 < key.length,
          ),
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
          assignments: ai.instanceParameter.assignments
            .map((assignment) => ({
              variable: assignment.variable,
              value: assignment.value,
            }))
            .filter(({ variable }) => 0 < variable.name.length),
        }
      } else if (ai.type === "include") {
        return {
          type: "include" as const,
          ref: unwrapNull(ai.instanceParameter.ref)?.id ?? "",
          parameters: ai.instanceParameter.parameters
            .map((parameter) => ({
              variable: parameter.variable,
              value: parameter.value,
            }))
            .filter(({ variable }) => 0 < variable.name.length),
        }
      } else if (ai.type === "db") {
        return {
          type: "db" as const,
          query: ai.instanceParameter.query,
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
  resourceMap: Map<string, Resource>,
  meta: Meta,
): Decomposed => {
  return {
    id: route.id,
    color: route.color,
    title: route.name,
    variables: route.variables.map(({ variable, value }) => ({
      variable,
      value: { type: "any", value },
    })),
    endpoint: meta.endpoint,
    steps: route.path.map((node) => decomposeStepItem(node, resourceMap)),
    page: route.page,
  } satisfies Decomposed
}

export const decompose = (
  routes: Route[],
  resourceMap: Map<string, Resource>,
  meta: Meta,
): Decomposed[] => {
  return routes.map((route) => decomposeRoute(route, resourceMap, meta))
}
