import type {
  Decomposed,
  DecomposedStep,
} from "@/domain/entity/decompose/decomposed"
import type { ActionInstance } from "@/domain/entity/node/actionInstance"

import {
  buildBinderActionInstance,
  buildRestCallActionInstance,
  buildValidatorActionInstance,
} from "@/domain/entity/node/actionInstance"
import { buildPrimitiveRoute } from "@/domain/entity/route/route"
import { toNodeId } from "@/domain/entity/node/node.util"
import { genId } from "@/utils/uuid"
import { buildPrimitiveNode } from "@/domain/entity/node/node"
import { buildActionSourceIdentifier } from "@/domain/entity/action/identifier"
import { buildUserDefinedAction } from "@/domain/entity/userDefinedAction/userDefinedAction"
import { parseHttpMethod } from "@/utils/http"
import { dedupe } from "@/lib/array/utils"
import { toMethodAndPath } from "@/domain/entity/resource/identifier.utli"

const parseDecomposedActionToActionInstance = (
  action: DecomposedStep["actions"][number],
): ActionInstance => {
  if (action.type === "rest_call") {
    const method = parseHttpMethod(action.path) ?? "GET"
    const udaId = toMethodAndPath(method, action.path)

    return buildRestCallActionInstance(genId(), {
      type: "rest_call",
      description: action.description ?? "",
      actionIdentifier: buildActionSourceIdentifier({
        resourceType: "user_defined",
        resourceIdentifier: {
          userDefinedActionId: udaId,
        },
      }),
      instanceParameter: {
        method: action.method,
        path: action.path,
        headers: action.headers,
        cookies: action.cookies,
        queryParams: action.queryParams,
        pathParams: [], // TODO:
        body:
          action.body != null
            ? {
                selected: "application/json",
                params: { "application/json": action.body },
              }
            : undefined,
        baseUrl: "", // TODO:
      },
      config: {
        followRedirect: false,
        useCookie: false,
      },
    })
  } else if (action.type === "binder") {
    return buildBinderActionInstance(genId(), {
      type: "binder",
      instanceParameter: {
        assignments: action.assignments.map((assignment) => ({
          variableId: assignment.variable.id,
          value: assignment.value,
        })),
      },
    })
  } else {
    return buildValidatorActionInstance(genId(), {
      type: "validator",
      instanceParameter: {
        contents: action.contents,
      },
    })
  }
}

export const parseToEntities = (
  decomposedList: (Decomposed & { page: string })[],
) => {
  // ud action
  const _userDefinedActions = decomposedList
    .map((decomposed) =>
      decomposed.steps.map((step) =>
        step.actions
          .filter((action) => action.type === "rest_call")
          .map((action) => {
            // [x-operationId] が存在しないもののみを取り出す

            const method = parseHttpMethod(action.path) ?? "GET"
            const id = toMethodAndPath(method, action.path)
            return buildUserDefinedAction(id, {
              name: `${method} ${action.path}`,
              description: action.description ?? "",
              type: "rest_call",
              schema: {
                base: {
                  method,
                  path: action.path,
                },
                examples: [],
              },
            })
          }),
      ),
    )
    .flat(2)
  const userDefinedActions = dedupe(
    _userDefinedActions,
    (action) => action.name,
  )

  // global variable
  const globalVariables = decomposedList.flatMap(
    (decomposed) => decomposed.globalVariables,
  )

  // node
  const nodes = decomposedList
    .flatMap((decomposed) => decomposed.steps)
    .map((step) =>
      buildPrimitiveNode(`${step.id}`, {
        name: step.title,
        actionInstances: step.actions.map(
          parseDecomposedActionToActionInstance,
        ),
        config: {
          condition: step.condition,
          loop: step.loop,
        },
      }),
    )

  // route
  const routes = decomposedList.map((decomposed) => {
    return buildPrimitiveRoute(genId(), {
      name: decomposed.title,
      page: decomposed.page,
      color: decomposed.color,
      path: decomposed.steps.map((step) => toNodeId(`${step.id}`)),
    })
  })

  return {
    userDefinedActions,
    globalVariables,
    nodes,
    routes,
  }
}
