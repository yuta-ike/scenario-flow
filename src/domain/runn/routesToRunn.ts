import { resolveExpression } from "../entity/value/expression.util"

import type { Meta } from "../entity/meta/meta"
import type { Route } from "../entity/route/route"
import type {
  RunnFormat,
  RunnMethodObject,
  RunnOperationObject,
  RunnPathObject,
  RunnStep,
} from "./runn.type"

import { toLowerCase } from "@/utils/string"
import { kvToRecordNullable } from "@/ui/lib/kv"
import { buildPath } from "@/utils/url"

export const routesToRunn = (routes: Route[], meta: Meta): RunnFormat[] => {
  return routes.map((route) => ({
    "x-id": route.id,
    "x-color": route.color,
    desc: route.name,
    runners: {
      req: meta.endpoint,
    },
    vars: {
      dummy: "dummy",
    },
    steps: route.path.flatMap((node) => {
      const restCallNode = node.actionInstances.filter(
        (ai) => ai.type === "rest_call",
      )
      const validatorNode = node.actionInstances.filter(
        (ai) => ai.type === "validator",
      )
      return [
        ...restCallNode.map((ai) => {
          const pathParams =
            kvToRecordNullable(ai.instanceParameter.pathParams) ?? {}
          const pathWithSearchParams = buildPath(
            resolveExpression(ai.action.parameter.path, pathParams),
            kvToRecordNullable(ai.instanceParameter.queryParams) ?? undefined,
          )

          return {
            req: {
              [pathWithSearchParams]: {
                [toLowerCase(ai.action.parameter.method)]: {
                  headers:
                    kvToRecordNullable(ai.instanceParameter.headers) ??
                    undefined,
                  cookies:
                    kvToRecordNullable(ai.instanceParameter.cookies) ??
                    undefined,
                  body: {
                    "application/json":
                      ai.instanceParameter.body?.["application/json"],
                    "application/form-data": kvToRecordNullable(
                      ai.instanceParameter.body?.["application/form-data"],
                    ),
                  },
                } satisfies RunnOperationObject,
              } satisfies RunnMethodObject,
            } satisfies RunnPathObject,
          } satisfies RunnStep
        }),
        ...validatorNode.map((ai) => ({
          test: ai.instanceParameter.contents,
        })),
      ]
    }),
  }))
}
