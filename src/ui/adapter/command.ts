import { run } from "../lib/effect/run"

import { store } from "./store"

import type { OpenAPIObject } from "openapi3-ts/oas31"
import type { Json } from "@/utils/json"
import type { PrimitiveRoute, RouteId } from "@/domain/entity/route/route"
import type { OmitId } from "@/utils/idType"
import type { NodeId } from "@/domain/entity/node/node"
import type {
  ActionInstance,
  ActionInstanceId,
} from "@/domain/entity/node/actionInstance"
import type { LocalVariableId } from "@/domain/entity/variable/variable"
import type { ActionId } from "@/domain/entity/action/action"
import type {
  GlobalVariable,
  GlobalVariableValueId,
} from "@/domain/entity/globalVariable/globalVariable"
import type { TypedValue } from "@/domain/entity/value/dataType"
import type { Resource, ResourceId } from "@/domain/entity/resource/resource"

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
import {
  toActionInstanceId,
  toValidatorId,
} from "@/domain/entity/node/actionInstance.util"
import { toActionRefId } from "@/domain/entity/node/actionRef.util"
import { toExpression } from "@/domain/entity/value/expression.util"
import { resolveRefs } from "@/lib/json-schema/resolveRefs"

export const createRootNode = (actionId: ActionId) => {
  run(
    createRootNodeWf({
      actionInstances: [
        {
          actionInstanceId: toActionInstanceId(genId()),
          type: "rest_call",
          instanceParameter: {
            description: "",
            config: {
              followRedirect: false,
              useCookie: false,
            },
          },
          actionRef: {
            id: toActionRefId(genId()),
            actionId,
          },
        },
        {
          actionInstanceId: toActionInstanceId(genId()),
          type: "validator",
          instanceParameter: {
            id: toValidatorId(genId()),
            description: "",
            contents: toExpression(""),
          },
        },
        {
          actionInstanceId: toActionInstanceId(genId()),
          type: "binder",
          instanceParameter: {
            description: "",
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

export const appendNode = (nodeId: NodeId, actionId: ActionId) => {
  run(
    appendNodeWf(
      {
        actionInstances: [
          {
            actionInstanceId: toActionInstanceId(genId()),
            type: "rest_call",
            instanceParameter: {
              description: "",
              config: {
                followRedirect: false,
                useCookie: false,
              },
            },
            actionRef: {
              id: toActionRefId(genId()),
              actionId,
            },
          },
          {
            actionInstanceId: toActionInstanceId(genId()),
            type: "validator",
            instanceParameter: {
              id: toValidatorId(genId()),
              description: "",
              contents: toExpression(""),
            },
          },
          {
            actionInstanceId: toActionInstanceId(genId()),
            type: "binder",
            instanceParameter: {
              description: "",
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

export const uploadOpenApiFile = async (
  name: string,
  description: string,
  openApi: Json,
) => {
  const content = await resolveRefs(openApi as unknown as OpenAPIObject)
  const resource = {
    name,
    description,
    content,
    type: "OpenApi",
    locationType: "Temporal",
  } as const

  addResource(resource, {
    genId: genId,
    addResource: (resource) => {
      resourceAtom(resource.id, resource)
      store.update(resourceIdsAtom, addSetOp(resource.id))
    },
  })
}

export const putOpenApiFile = async (
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
    type: "OpenApi",
    locationType: "Temporal",
  } as const

  putResource(id, resource, {
    putResource: (resourceId, resource) => {
      store.set(resourceAtom(resourceId), {
        id: resourceId,
        ...resource,
      } as Resource)
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
  data: { id: LocalVariableId; name: string }[],
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
  id: GlobalVariableValueId,
  value: TypedValue,
) => {
  run(updateGlobalVariableValueWf(id, value))
}

export const replaceAction = (oldActionId: ActionId, newActionId: ActionId) => {
  run(replaceActionWf(oldActionId, newActionId))
}
