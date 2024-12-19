import { run } from "../lib/effect/run"
import { currentPageAtom } from "../state/page"

import { store } from "./store"

import type { Context } from "./context"
import type { Effect } from "effect/Effect"
import type { OpenAPIObject } from "openapi3-ts/oas31"
import type { Json } from "@/utils/json"
import type { NodeId } from "@/domain/entity/node/node"
import type { ActionType } from "@/domain/entity/action/action"
import type { ActionSourceIdentifier } from "@/domain/entity/action/identifier"
import type { Result } from "@/utils/result"
import type { JsonParseError } from "@/lib/json-schema/error"
import type { Resource } from "@/domain/entity/resource/resource"
import type { StripeSymbol } from "@/domain/entity/type"

import { type RouteId } from "@/domain/entity/route/route"
import {
  buildResource,
  type ResourceId,
} from "@/domain/entity/resource/resource"
import { resourceAtom, resourceIdsAtom } from "@/domain/datasource/resource"
import { addResource, putResource } from "@/domain/workflow/resource"
import { addSetOp } from "@/utils/set"
import { genId } from "@/utils/uuid"
import {
  addRoute as addRouteWf,
  deleteRoute as deleteRouteWf,
  updatePageName as updatePageNameWf,
  updateRoute as updateRouteWf,
  swapRoutePath as swapRoutePathWf,
} from "@/domain/workflow/route"
import {
  appendNode as appendNodeWf,
  createRestCallRootNode as createRestCallRootNodeWf,
  updateActionInstancesParameter as updateActionInstancesParameterWf,
  upsertVariables as upsertVariablesWf,
  replaceAction as replaceActionWf,
  updateNode as updateNodeWf,
  updateNodeConfig as updateNodeConfigWf,
  appendActionInstance as appendActionInstanceWf,
  deleteNode as deleteNodeWf,
  connectNodes as connectNodesWf,
  disconnectNodes as disconnectNodesWf,
  insertNode as insertNodeWf,
  unshiftNode as unshiftNodeWf,
  appendUserDefinedRestCallNode as appendUserDefinedRestCallNodeWf,
  insertUserDefinedRestCallNode as insertUserDefinedRestCallNodeWf,
  unshiftUserDefinedRestCallNode as unshiftUserDefinedRestCallNodeWf,
  createUserDefinedRestCallRootNode as createUserDefinedRestCallRootNodeWf,
  updateUserDefinedAction as updateUserDefinedActionWf,
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
    Eff extends (...args: any[]) => Effect<unknown, unknown, Context>,
    Args extends Parameters<Eff>,
  >(
    effect: Eff,
  ) =>
  (...args: Args) =>
    run(effect(...args))

export const createRestCallRootNode = (
  actionIdentifier: ActionSourceIdentifier,
  page: string,
) => {
  run(
    createRestCallRootNodeWf(
      {
        description: "",
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
      },
      page,
    ),
  )
}

export const createIncludeRootNode = (routeId: RouteId, page: string) => {
  run(
    createRestCallRootNodeWf(
      {
        description: "",
        actionInstances: [
          {
            id: toActionInstanceId(genId()),
            type: "include",
            instanceParameter: {
              ref: routeId,
              parameters: [],
            },
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
      },
      page,
    ),
  )
}

export const createUserDefinedRestCallRootNode = applyRunner(
  createUserDefinedRestCallRootNodeWf,
)

export const appendNode = (
  nodeId: NodeId,
  actionIdentifier: ActionSourceIdentifier,
  page: string,
) => {
  run(
    appendNodeWf(
      {
        description: "",
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
      page,
    ),
  )
}

export const appendIncludeNode = (
  nodeId: NodeId,
  routeId: RouteId,
  page: string,
) => {
  run(
    appendNodeWf(
      {
        description: "",
        actionInstances: [
          {
            id: toActionInstanceId(genId()),
            type: "include",
            instanceParameter: {
              ref: routeId,
              parameters: [],
            },
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
      page,
    ),
  )
}

export const insertNode = (
  fromNodeId: NodeId,
  toNodeId: NodeId,
  actionIdentifier: ActionSourceIdentifier,
  page: string,
) =>
  run(
    insertNodeWf(
      {
        description: "",
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
      fromNodeId,
      toNodeId,
      page,
    ),
  )

export const insertIncludeNode = (
  fromNodeId: NodeId,
  toNodeId: NodeId,
  routeId: RouteId,
  page: string,
) =>
  run(
    insertNodeWf(
      {
        description: "",
        actionInstances: [
          {
            id: toActionInstanceId(genId()),
            type: "include",
            instanceParameter: {
              ref: routeId,
              parameters: [],
            },
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
      fromNodeId,
      toNodeId,
      page,
    ),
  )

export const unshiftNode = (
  routeId: RouteId,
  actionIdentifier: ActionSourceIdentifier,
) =>
  run(
    unshiftNodeWf(
      {
        description: "",
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
      routeId,
    ),
  )

export const unshiftIncludeNode = (routeId: RouteId) =>
  run(
    unshiftNodeWf(
      {
        description: "",
        actionInstances: [
          {
            id: toActionInstanceId(genId()),
            type: "include",
            instanceParameter: {
              ref: routeId,
              parameters: [],
            },
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
      routeId,
    ),
  )

export const appendUserDefinedRestCallNode = applyRunner(
  appendUserDefinedRestCallNodeWf,
)

export const insertUserDefinedRestCallNode = applyRunner(
  insertUserDefinedRestCallNodeWf,
)

export const unshiftUserDefinedRestCallNode = applyRunner(
  unshiftUserDefinedRestCallNodeWf,
)

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
      type: "openapi",
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
    type: "openapi",
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

export const addRoute = applyRunner(addRouteWf)

export const updteRoute = applyRunner(updateRouteWf)

export const swapRoutePath = applyRunner(swapRoutePathWf)

export const updatePageName = (args: { prevPage: string; newPage: string }) => {
  run(updatePageNameWf(args))
  if (store.get(currentPageAtom) === args.prevPage) {
    store.set(currentPageAtom, args.newPage)
  }
}

export const deleteRoute = applyRunner(deleteRouteWf)

export const updateNode = applyRunner(updateNodeWf)

export const disconnectNodes = applyRunner(disconnectNodesWf)

export const updateNodeConfig = applyRunner(updateNodeConfigWf)

export const deleteNode = applyRunner(deleteNodeWf)

export const connectNodes = applyRunner(connectNodesWf)

export const updateActionInstance = applyRunner(
  updateActionInstancesParameterWf,
)

export const updateUserDefinedAction = applyRunner(updateUserDefinedActionWf)

export const upsertVariables = applyRunner(upsertVariablesWf)

export const addGlobalVariable = (id: string, name: string) => {
  return run(addGlobalVariableWf({ id, name }))
}

export const updateGlobalVariable = applyRunner(updateGlobalVariableWf)

export const updateGlobalVariableValue = applyRunner(
  updateGlobalVariableValueWf,
)

export const replaceAction = applyRunner(replaceActionWf)
