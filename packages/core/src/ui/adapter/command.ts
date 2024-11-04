import { run } from "../lib/effect/run"

import { store } from "./store"

import type { Effect } from "effect/Effect"
import type { OpenAPIObject } from "openapi3-ts/oas31"
import type { Json } from "@/utils/json"
import type { PrimitiveRoute, RouteId } from "@/domain/entity/route/route"
import type { OmitId } from "@/utils/idType"
import type { NodeId } from "@/domain/entity/node/node"
import type { ActionType } from "@/domain/entity/action/action"
import type { ActionSourceIdentifier } from "@/domain/entity/action/identifier"
import type { Result } from "@/utils/result"
import type { JsonParseError } from "@/lib/json-schema/error"
import type { Resource } from "@/domain/entity/resource/resource"
import type { StripeSymbol } from "@/domain/entity/type"

import {
  buildResource,
  type ResourceId,
} from "@/domain/entity/resource/resource"
import { resourceAtom, resourceIdsAtom } from "@/domain/datasource/resource"
import { addResource, putResource } from "@/domain/workflow/resource"
import { addSetOp } from "@/utils/set"
import { genId } from "@/utils/uuid"
import { updateRoute as updateRouteEntity } from "@/domain/workflow/route"
import { primitiveRouteAtom } from "@/domain/datasource/route"
import {
  appendNode as appendNodeWf,
  createRootNode as createRootNodeWf,
  updateActionInstancesParameter,
  upsertVariables as upsertVariablesWf,
  replaceAction as replaceActionWf,
  updateNode as updateNodeWf,
  updateNodeConfig as updateNodeConfigWf,
  appendActionInstance as appendActionInstanceWf,
  deleteNode as deleteNodeWf,
  connectNodes as connectNodesWf,
} from "@/domain/workflow/node"
import {
  addGlobalVariable as addGlobalVariableWf,
  updateGlobalVariable as updateGlobalVariableWf,
  updateGlobalVariableValue as updateGlobalVariableValueWf,
} from "@/domain/workflow/globalVariable"
import { toActionInstanceId } from "@/domain/entity/node/actionInstance.util"
import { toExpression } from "@/domain/entity/value/expression.util"
import { resolveRefs } from "@/lib/json-schema/resolveRefs"
import { success } from "@/utils/result"

export const applyRunner =
  <
    Eff extends (...args: any[]) => Effect<unknown, unknown, unknown>,
    Args extends Parameters<Eff>,
  >(
    effect: Eff,
  ) =>
  (...args: Args) =>
    run(effect(...args))

export const createRootNode = (actionIdentifier: ActionSourceIdentifier) => {
  run(
    createRootNodeWf({
      actionInstances: [
        {
          id: toActionInstanceId(genId()),
          type: "rest_call",
          description: "",
          instanceParameter: {},
          config: {
            followRedirect: false,
            useCookie: false,
          },
          actionIdentifier: actionIdentifier,
        },
        {
          id: toActionInstanceId(genId()),
          type: "validator",
          instanceParameter: {
            contents: toExpression(""),
          },
        },
        {
          id: toActionInstanceId(genId()),
          type: "binder",
          instanceParameter: {
            assignments: [],
          },
        },
      ],
      config: {
        condition: toExpression("true"),
        loop: {
          maxRetries: 0,
        },
      },
    }),
  )
}

export const appendNode = (
  nodeId: NodeId,
  actionIdentifier: ActionSourceIdentifier,
) => {
  run(
    appendNodeWf(
      {
        actionInstances: [
          {
            id: toActionInstanceId(genId()),
            type: "rest_call",
            description: "",
            instanceParameter: {},
            config: {
              followRedirect: false,
              useCookie: false,
            },
            actionIdentifier,
          },
          {
            id: toActionInstanceId(genId()),
            type: "validator",
            instanceParameter: {
              contents: toExpression(""),
            },
          },
          {
            id: toActionInstanceId(genId()),
            type: "binder",
            instanceParameter: {
              assignments: [],
            },
          },
        ],
        config: {},
      },
      nodeId,
    ),
  )
}

// action instanceを追加する
export const appendActionInstance = (
  nodeId: NodeId,
  type: Exclude<ActionType, "unknown">,
) => run(appendActionInstanceWf(nodeId, type))

export const uploadOpenApiFile = async (
  name: string,
  description: string,
  path: string,
  openApi: Json,
): Promise<Result<null, JsonParseError>> => {
  const content = await resolveRefs(openApi as unknown as OpenAPIObject)
  if (content.result === "error") {
    return content
  }

  addResource(
    {
      name,
      description,
      content: content.value,
      type: "open_api",
      location: {
        locationType: "local_file" as const,
        path,
      },
    } satisfies StripeSymbol<Omit<Resource, "id">>,
    {
      genId: genId,
      addResource: (resource) => {
        resourceAtom(resource.id, resource)
        store.update(resourceIdsAtom, addSetOp(resource.id))
      },
    },
  )
  return success(null)
}

export const putOpenApiFile = async (
  id: ResourceId,
  name: string,
  description: string,
  path: string,
  openApi: Json,
): Promise<Result<null, JsonParseError>> => {
  const content = await resolveRefs(openApi as unknown as OpenAPIObject)
  if (content.result === "error") {
    return content
  }

  const resource = {
    name,
    description,
    content: content.value,
    type: "open_api",
    location: {
      locationType: "local_file",
      path,
    },
  } as const

  putResource(id, resource, {
    putResource: (id, params) => {
      store.set(resourceAtom(id), buildResource(id, params))
    },
  })

  return success(null)
}

export const updteRoute = (
  routeId: RouteId,
  param: Partial<Pick<PrimitiveRoute, "name" | "color" | "page">>,
) => {
  updateRouteEntity(routeId, param, {
    getRoute: (routeId: RouteId) => store.get(primitiveRouteAtom(routeId)),
    updateRoute: (routeId: RouteId, route: OmitId<PrimitiveRoute>) => {
      store.set(primitiveRouteAtom(routeId), {
        update: (prevRoute) => ({
          ...prevRoute,
          ...route,
        }),
      })
    },
  })
}

export const updateNode = applyRunner(updateNodeWf)

export const updateNodeConfig = applyRunner(updateNodeConfigWf)

export const deleteNode = applyRunner(deleteNodeWf)

export const connectNodes = applyRunner(connectNodesWf)

export const updateActionInstance = applyRunner(updateActionInstancesParameter)

export const upsertVariables = applyRunner(upsertVariablesWf)

export const addGlobalVariable = (id: string, name: string) => {
  return run(addGlobalVariableWf({ id, name }))
}

export const updateGlobalVariable = applyRunner(updateGlobalVariableWf)

export const updateGlobalVariableValue = applyRunner(
  updateGlobalVariableValueWf,
)

export const replaceAction = applyRunner(replaceActionWf)
