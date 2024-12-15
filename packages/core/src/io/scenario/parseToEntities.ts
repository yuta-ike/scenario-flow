import { resolvePath } from "./resolvePath"
import { extractPathParams } from "./extractPathParams"

import type {
  Decomposed,
  DecomposedStep,
} from "@/domain/entity/decompose/decomposed"
import type { ActionInstance } from "@/domain/entity/node/actionInstance"
import type { Expression } from "@/domain/entity/value/expression"
import type { Resource } from "@/domain/entity/resource/resource"
import type { KVItem } from "@/ui/lib/kv"
import type { ResourceActionIdentifier } from "@/domain/entity/action/identifier"
import type { ResolvedAction } from "@/domain/entity/action/action"

import {
  buildBinderActionInstance,
  buildIncludeActionInstance,
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
import { buildOpenApiResourceIdentifierWithOperationId } from "@/domain/entity/resource/identifier"

export type ResourceContext = {
  resourceNameMap: Map<string, Resource>
  getResourceAction: (id: ResourceActionIdentifier) => ResolvedAction
}

const parseXActionId = (
  xActionId: string | undefined,
  resourceNameMap: Map<string, Resource>,
) => {
  if (xActionId == null) return null
  const [resourceName, operationId] = xActionId.split(":")
  if (typeof resourceName === "string" && typeof operationId === "string") {
    const resourceId = resourceNameMap.get(resourceName)?.id
    if (resourceId == null) {
      return null
    }
    return {
      resourceId,
      identifier: buildOpenApiResourceIdentifierWithOperationId(operationId),
    }
  }
  return null
}

const parseDecomposedActionToActionInstance = (
  action: DecomposedStep["actions"][number],
  page: string,
  pathRouteIdMap: Map<string, string>,
  context: ResourceContext,
): ActionInstance => {
  if (action.type === "rest_call") {
    const method = parseHttpMethod(action.path) ?? "GET"
    const udaId = toMethodAndPath(method, action.path)

    const resourceIdentifier = parseXActionId(
      action.meta?.["x-action-id"],
      context.resourceNameMap,
    )

    // NOTE: パスパラーメータの解決
    let pathParams: KVItem[] = []
    let path: string | undefined = undefined
    if (resourceIdentifier != null) {
      const resourceAction = context.getResourceAction(resourceIdentifier)
      path =
        "path" in resourceAction.schema.base
          ? resourceAction.schema.base.path
          : undefined
      if (path != null) {
        pathParams = extractPathParams(path, action.path)
      }
    }

    return buildRestCallActionInstance(genId(), {
      type: "rest_call",
      description: action.description ?? "",
      actionIdentifier:
        resourceIdentifier != null
          ? buildActionSourceIdentifier({
              resourceType: "resource",
              resourceIdentifier,
            })
          : buildActionSourceIdentifier({
              resourceType: "user_defined",
              resourceIdentifier: {
                userDefinedActionId: udaId,
              },
            }),
      instanceParameter: {
        method: action.method,
        path,
        headers: action.headers,
        cookies: action.cookies,
        queryParams: action.queryParams,
        pathParams: pathParams.length === 0 ? undefined : pathParams,
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
  } else if (action.type === "validator") {
    return buildValidatorActionInstance(genId(), {
      type: "validator",
      instanceParameter: {
        contents: action.contents,
      },
    })
  } else {
    console.log(resolvePath(page, action.ref))
    return buildIncludeActionInstance(genId(), {
      type: "include",
      instanceParameter: {
        ref: pathRouteIdMap.get(
          action.ref.startsWith("/") ? action.ref : `/${action.ref}`,
        )!,
        parameters: action.parameters.map(({ variable, value }) => ({
          variable,
          value: value as Expression,
        })),
      },
    })
  }
}

export const parseToEntities = (
  decomposedList: (Decomposed & { page: string })[],
  context: ResourceContext,
) => {
  // path routeId Map
  const pathRouteIdMap = new Map(
    decomposedList.map(({ id, title, page }) => {
      const path = `${page}/${title}.yml`
      return [path, id]
    }),
  )

  // ud action
  const _userDefinedActions = decomposedList
    .map((decomposed) =>
      decomposed.steps.map((step) =>
        step.actions
          .filter((action) => action.type === "rest_call")
          .map((action) => {
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
  const nodes = decomposedList.flatMap((decomposed) =>
    decomposed.steps.map((step) =>
      buildPrimitiveNode(`${step.id}`, {
        name: step.title,
        description: step.description,
        actionInstances: step.actions.map((ai) =>
          parseDecomposedActionToActionInstance(
            ai,
            decomposed.page,
            pathRouteIdMap,
            context,
          ),
        ),
        config: {
          condition: step.condition,
          loop: step.loop,
        },
      }),
    ),
  )

  // route
  const routes = decomposedList.map((decomposed) => {
    return buildPrimitiveRoute(decomposed.id, {
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
