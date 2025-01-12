import type {
  Decomposed,
  DecomposedStep,
} from "@/domain/entity/decompose/decomposed"
import type { ActionInstance } from "@/domain/entity/node/actionInstance"
import type { Expression } from "@/domain/entity/value/expression"
import type { Resource } from "@/domain/entity/resource/resource"
import type { ResourceActionIdentifierParam } from "@/domain/entity/action/identifier"
import type { ResolvedAction } from "@/domain/entity/action/action"
import type { MethodAndPath } from "@/domain/entity/resource/identifier"

import {
  buildBinderActionInstance,
  buildDbActionInstance,
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
import { typedValueToValue } from "@/domain/entity/value/dataType"

export type ResourceContext = {
  resourceNameMap: Map<string, Resource>
  getResourceAction: (id: ResourceActionIdentifierParam) => ResolvedAction
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
  udaPathMap: Map<string, string>,
  context: ResourceContext,
): ActionInstance => {
  if (action.type === "rest_call") {
    const method = parseHttpMethod(action.method) ?? "GET"

    const resourceIdentifier = parseXActionId(
      action.meta?.["x-action-id"],
      context.resourceNameMap,
    )

    // NOTE: パスパラーメータの解決
    // let pathParams: KVItem[] = []
    // let path: string | undefined = action.path
    // if (resourceIdentifier != null) {
    //   const resourceAction = context.getResourceAction(resourceIdentifier)
    //   path =
    //     "path" in resourceAction.schema.base
    //       ? resourceAction.schema.base.path
    //       : undefined
    //   if (path != null) {
    //     pathParams = getPathParams(path, action.path)
    //   }
    // }

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
                userDefinedActionId:
                  udaPathMap.get(toMethodAndPath(method, action.path)) ??
                  genId(),
              },
            }),
      instanceParameter: {
        headers: action.headers,
        cookies: action.cookies,
        queryParams: action.queryParams,
        // pathParams: pathParams,
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
  } else if (action.type === "db") {
    return buildDbActionInstance(genId(), {
      type: "db",
      instanceParameter: {
        query: action.query,
      },
    })
  } else if (action.type === "include") {
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
  }

  return action
}

export const parseToEntities = (
  decomposedList: (Decomposed & { page: string })[],
  context: ResourceContext,
) => {
  // path routeId Map
  const pathRouteIdMap = new Map(
    decomposedList.map(({ id, title, page }) => {
      const path =
        page === ""
          ? `/${title}.yaml`
          : page.startsWith("/")
            ? `${page}/${title}.yaml`
            : `/${page}/${title}.yaml`
      return [path, id]
    }),
  )

  const udaPathMap = new Map<MethodAndPath, string>()

  // ud action
  const _userDefinedActions = decomposedList
    .map((decomposed) =>
      decomposed.steps.map((step) =>
        step.actions
          .filter((action) => action.type === "rest_call")
          .map((action) => {
            const method = parseHttpMethod(action.method) ?? "GET"
            const udaId = genId()
            udaPathMap.set(toMethodAndPath(method, action.path), udaId)
            return buildUserDefinedAction(udaId, {
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
            udaPathMap,
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

  // variables
  const variables = [
    ...decomposedList.flatMap((decomposed) =>
      decomposed.steps.flatMap((step) =>
        step.actions
          .filter((action) => action.type === "binder")
          .flatMap((action) =>
            action.assignments.map(({ variable }) => variable),
          ),
      ),
    ),
    ...decomposedList.flatMap((decomposed) =>
      decomposed.variables.map(({ variable }) => variable),
    ),
  ]

  // route
  const routes = decomposedList.map((decomposed) => {
    return buildPrimitiveRoute(decomposed.id, {
      name: decomposed.title,
      description: decomposed.description ?? "",
      page: decomposed.page,
      color: decomposed.color,
      path: decomposed.steps.map((step) => toNodeId(`${step.id}`)),
      variables: decomposed.variables.map(({ variable, value }) => ({
        id: variable.id,
        value: typedValueToValue(value) as Expression,
      })),
    })
  })

  return {
    userDefinedActions,
    variables,
    nodes,
    routes,
  }
}
