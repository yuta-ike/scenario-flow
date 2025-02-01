import { run } from "../lib/effect/run"
import { currentPageAtom } from "../state/page"

import type { Context } from "./context"
import type { Effect } from "effect/Effect"
import type { OpenAPIObject } from "openapi3-ts/oas31"
import { genId, Json, Result, addSetOp, success } from "@scenario-flow/util"
import { Store, JsonParseError, resolveRefs } from "@scenario-flow/util/lib"
import { resourceAtom, resourceIdsAtom } from "../../domain/datasource/resource"

import { addResource, putResource } from "../../domain/workflow/resource"

import {
  addRoute as addRouteWf,
  deleteRoute as deleteRouteWf,
  updatePageName as updatePageNameWf,
  updateRoute as updateRouteWf,
  swapRoutePath as swapRoutePathWf,
  updateRouteVariables as updateRouteVariablesWf,
} from "../../domain/workflow/route"
import {
  appendNode as appendNodeWf,
  createRootNode as createRootNodeWf,
  updateActionInstancesParameter as updateActionInstancesParameterWf,
  updateActionAndActionInstance as updateActionAndActionInstanceWf,
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
  changeToNewAction as changeToNewActionWf,
  changeAction as changeActionWf,
} from "../../domain/workflow/node"
import {
  addGlobalVariable as addGlobalVariableWf,
  updateGlobalVariable as updateGlobalVariableWf,
  updateGlobalVariableValue as updateGlobalVariableValueWf,
} from "../../domain/workflow/globalVariable"
import {
  ActionSourceIdentifier,
  toActionInstanceId,
  toExpression,
  RouteId,
  NodeId,
  ActionType,
  StripeSymbol,
  ResourceId,
  buildResource,
  Resource,
} from "../../domain/entity"

export const applyRunner =
  <Args extends unknown[], A, E>(
    effect: (...args: Args) => Effect<A, E, Context>,
  ) =>
  (store: Store, ...args: Args): A =>
    run(store, effect(...args))

export const createRestCallRootNode = (
  store: Store,
  actionIdentifier: ActionSourceIdentifier,
  page: string,
) =>
  run(
    store,
    createRootNodeWf(
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

export const createIncludeRootNode = (
  store: Store,
  routeId: RouteId,
  page: string,
) =>
  run(
    store,
    createRootNodeWf(
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

export const createDbNode = (store: Store, page: string) =>
  run(
    store,
    createRootNodeWf(
      {
        description: "",
        actionInstances: [
          {
            id: toActionInstanceId(genId()),
            type: "db",
            instanceParameter: {
              query: "",
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

export const createUserDefinedRestCallRootNode = applyRunner(
  createUserDefinedRestCallRootNodeWf,
)

export const appendNode = (
  store: Store,
  nodeId: NodeId,
  actionIdentifier: ActionSourceIdentifier,
  page: string,
) =>
  run(
    store,
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

export const appendIncludeNode = (
  store: Store,
  nodeId: NodeId,
  routeId: RouteId,
  page: string,
) =>
  run(
    store,
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

export const insertNode = (
  store: Store,
  fromNodeId: NodeId,
  toNodeId: NodeId,
  actionIdentifier: ActionSourceIdentifier,
  page: string,
) =>
  run(
    store,
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
  store: Store,
  fromNodeId: NodeId,
  toNodeId: NodeId,
  routeId: RouteId,
  page: string,
) =>
  run(
    store,
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
  store: Store,
  routeId: RouteId,
  actionIdentifier: ActionSourceIdentifier,
) =>
  run(
    store,
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

export const unshiftIncludeNode = (store: Store, routeId: RouteId) =>
  run(
    store,
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

export const unshiftDbNode = (store: Store, routeId: RouteId) =>
  run(
    store,
    unshiftNodeWf(
      {
        description: "",
        actionInstances: [
          {
            id: toActionInstanceId(genId()),
            type: "db",
            instanceParameter: {
              query: "",
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

export const insertDbNode = (
  store: Store,
  fromNodeId: NodeId,
  toNodeId: NodeId,
  page: string,
) =>
  run(
    store,
    insertNodeWf(
      {
        description: "",
        actionInstances: [
          {
            id: toActionInstanceId(genId()),
            type: "db",
            instanceParameter: {
              query: "",
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

export const appendDbNode = (store: Store, fromNodeId: NodeId, page: string) =>
  run(
    store,
    appendNodeWf(
      {
        description: "",
        actionInstances: [
          {
            id: toActionInstanceId(genId()),
            type: "db",
            instanceParameter: {
              query: "",
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
      page,
    ),
  )

// action instanceを追加する
export const appendActionInstance = (
  store: Store,
  nodeId: NodeId,
  type: Exclude<ActionType, "unknown">,
) => run(store, appendActionInstanceWf(nodeId, type))

export const uploadOpenApiFile = async (
  store: Store,
  name: string,
  description: string,
  path: string,
  openApi: Json,
  readExternalFile: (path: string) => Promise<string>,
): Promise<Result<null, JsonParseError>> => {
  console.log("PATH", path)
  const content = await resolveRefs(
    openApi as unknown as OpenAPIObject,
    readExternalFile,
  )
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
  store: Store,
  id: ResourceId,
  name: string,
  description: string,
  path: string,
  openApi: Json,
  readExternalFile: (path: string) => Promise<string>,
): Promise<Result<null, JsonParseError>> => {
  const content = await resolveRefs(
    openApi as unknown as OpenAPIObject,
    readExternalFile,
  )
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

export const updatePageName = (
  store: Store,
  args: { prevPage: string; newPage: string },
) => {
  run(store, updatePageNameWf(args))
  if (store.get(currentPageAtom) === args.prevPage) {
    store.set(currentPageAtom, args.newPage)
  }
}

export const deleteRoute = applyRunner(deleteRouteWf)

export const updateRouteVariables = applyRunner(updateRouteVariablesWf)

export const updateNode = applyRunner(updateNodeWf)

export const disconnectNodes = applyRunner(disconnectNodesWf)

export const updateNodeConfig = applyRunner(updateNodeConfigWf)

export const deleteNode = applyRunner(deleteNodeWf)

export const connectNodes = applyRunner(connectNodesWf)

export const updateActionInstance = applyRunner(
  updateActionInstancesParameterWf,
)

export const updateActionAndActionInstance = applyRunner(
  updateActionAndActionInstanceWf,
)

export const updateUserDefinedAction = applyRunner(updateUserDefinedActionWf)

export const changeToNewAction = applyRunner(changeToNewActionWf)

export const upsertVariables = applyRunner(upsertVariablesWf)

export const addGlobalVariable = (store: Store, id: string, name: string) => {
  return run(store, addGlobalVariableWf({ id, name }))
}

export const updateGlobalVariable = applyRunner(updateGlobalVariableWf)

export const updateGlobalVariableValue = applyRunner(
  updateGlobalVariableValueWf,
)

export const replaceAction = applyRunner(replaceActionWf)

export const changeAction = applyRunner(changeActionWf)
