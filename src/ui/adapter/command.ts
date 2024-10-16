import { run } from "../lib/effect/run"

import { store } from "./store"

import type { OpenAPIObject } from "openapi3-ts/oas31"
import type { Json } from "@/utils/json"
import type { PrimitiveRoute, RouteId } from "@/domain/entity/route/route"
import type { OmitId } from "@/utils/idType"
import type { NodeId } from "@/domain/entity/node/node"
import type { LocalVariableId } from "@/domain/entity/variable/variable"
import type { ActionId } from "@/domain/entity/action/action"
import type {
  GlobalVariable,
  GlobalVariableBindId,
} from "@/domain/entity/globalVariable/globalVariable"
import type { TypedValue } from "@/domain/entity/value/dataType"
import type { ActionSourceIdentifier } from "@/domain/entity/action/identifier"

import {
  buildResource,
  type ResourceId,
} from "@/domain/entity/resource/resource"
import {
  type ActionInstance,
  type ActionInstanceId,
} from "@/domain/entity/node/actionInstance"
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
} from "@/domain/workflow/node"
import {
  addGlobalVariable as addGlobalVariableWf,
  updateGlobalVariable as updateGlobalVariableWf,
  updateGlobalVariableValue as updateGlobalVariableValueWf,
} from "@/domain/workflow/globalVariable"
import { toActionInstanceId } from "@/domain/entity/node/actionInstance.util"
import { toExpression } from "@/domain/entity/value/expression.util"
import { resolveRefs } from "@/lib/json-schema/resolveRefs"

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
          times: 0,
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
        config: {
          condition: toExpression("true"),
          loop: {
            times: 0,
          },
        },
      },
      nodeId,
    ),
  )
}

export const uploadopen_apiFile = async (
  name: string,
  description: string,
  openApi: Json,
) => {
  const content = await resolveRefs(openApi as unknown as OpenAPIObject)
  addResource(
    {
      name,
      description,
      content,
      type: "open_api",
      locationType: "temporal",
    },
    {
      genId: genId,
      addResource: (resource) => {
        resourceAtom(resource.id, resource)
        store.update(resourceIdsAtom, addSetOp(resource.id))
      },
    },
  )
}

export const putopen_apiFile = async (
  id: ResourceId,
  name: string,
  description: string,
  openApi: Json,
) => {
  const content = await resolveRefs(openApi as unknown as OpenAPIObject)
  const resource = {
    name,
    description,
    content,
    type: "open_api",
    locationType: "temporal",
  } as const

  putResource(id, resource, {
    putResource: (id, params) => {
      store.set(resourceAtom(id), buildResource(id, params))
    },
  })
}

export const updteRoute = (
  routeId: RouteId,
  param: Partial<Pick<PrimitiveRoute, "name" | "color" | "page">>,
) => {
  updateRouteEntity(routeId, param, {
    getRoute: (routeId: RouteId) => store.get(primitiveRouteAtom(routeId)),
    updateRoute: (routeId: RouteId, route: OmitId<PrimitiveRoute>) => {
      store.set(primitiveRouteAtom(routeId), (prevRoute) => ({
        ...prevRoute,
        ...route,
      }))
    },
  })
}

export const updateActionInstance = (
  nodeId: NodeId,
  actionInstanceId: ActionInstanceId,
  actionInstance: ActionInstance,
) => {
  run(updateActionInstancesParameter(nodeId, actionInstanceId, actionInstance))
}

export const upsertVariables = (
  data: { id: LocalVariableId; name: string; boundIn: NodeId }[],
) => {
  run(upsertVariablesWf(data))
}

export const addGlobalVariable = (id: string, name: string) => {
  return run(addGlobalVariableWf({ id, name }))
}

export const updateGlobalVariable = (variable: GlobalVariable) => {
  run(updateGlobalVariableWf(variable))
}

export const updateGlobalVariableValue = (
  id: GlobalVariableBindId,
  value: TypedValue,
) => {
  run(updateGlobalVariableValueWf(id, value))
}

export const replaceAction = (oldActionId: ActionId, newActionId: ActionId) => {
  run(replaceActionWf(oldActionId, newActionId))
}
