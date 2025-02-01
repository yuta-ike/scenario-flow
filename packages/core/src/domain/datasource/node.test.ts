import { beforeEach, describe, expect, test, vi } from "vitest"

import { genPrimitiveNode } from "../entity/node/node.factory"
import { toResourceId } from "../entity/resource/resource.util"
import { toNodeId } from "../entity/node/node.util"
import { toActionInstanceId } from "../entity/node/actionInstance.util"
import { toLocalVariableId } from "../entity/variable/variable.util"
import { toUserDefinedActionId } from "../entity/userDefinedAction/userDefinedAction.util"
import { buildResource } from "../entity/resource/resource"

import {
  userDefinedActionAtom,
  userDefinedActionIdsAtom,
} from "./userDefinedAction"
import { resourceAtom, resourceIdsAtom } from "./resource"
import { nodeAtom, nodeIdsAtom, nodesAtom, primitiveNodeAtom } from "./node"
import { variableAtom } from "./variable"

import type { ActionId } from "../entity/action/action"
import type { Expression } from "../entity/value/expression"
import type { Path } from "../entity/value/path"

import { addSetOp, updateSetOp } from "@scenario-flow/util"
import { AtomNotFoundError, createStore } from "@scenario-flow/util/lib"

const store = createStore()

const beforeEachProcess = () => {
  store.clear()

  primitiveNodeAtom.clearAll()
  resourceAtom.clearAll()
  userDefinedActionAtom.clearAll()
  variableAtom.clearAll()

  for (const id of ["1", "2", "3"]) {
    store.set(primitiveNodeAtom(toNodeId(id)), {
      create: genPrimitiveNode(toNodeId(id)),
    })
  }
}

describe("node > primitiveNode", () => {
  beforeEach(beforeEachProcess)

  test("primitiveNodeAtom / nodeAtomsが正しく取得できる", () => {
    expect(store.get(primitiveNodeAtom(toNodeId("1")))).toEqual(
      genPrimitiveNode(toNodeId("1")),
    )

    expect(store.get(nodesAtom)).toEqual(
      new Set([
        genPrimitiveNode(toNodeId("1")),
        genPrimitiveNode(toNodeId("2")),
        genPrimitiveNode(toNodeId("3")),
      ]),
    )
  })

  test("primitiveNodeAtomの変更で、変更が通知される", () => {
    const subscriber = vi.fn()
    store.subscribe(primitiveNodeAtom(toNodeId("1")), subscriber)

    // action
    store.update(primitiveNodeAtom(toNodeId("1")), () => ({
      update: genPrimitiveNode(toNodeId("1"), {}),
    }))

    expect(subscriber).toHaveBeenCalled()
  })

  test("primitiveNodeAtomの変更では、nodeIdsAtomに変更が通知されない", () => {
    const subscriber = vi.fn()
    store.subscribe(nodeIdsAtom, subscriber)

    // action
    store.update(primitiveNodeAtom(toNodeId("1")), () => ({
      update: genPrimitiveNode(toNodeId("1"), {}),
    }))

    expect(subscriber).not.toHaveBeenCalled()
  })

  test("nodeIdsAtomの変更では、primitiveNodeAtomに変更が通知されない", () => {
    const subscriber = vi.fn()
    store.subscribe(primitiveNodeAtom(toNodeId("1")), subscriber)

    // action
    store.update(
      nodeIdsAtom,
      updateSetOp((ids) => [...ids, toNodeId("4")]),
    )
    store.set(primitiveNodeAtom(toNodeId("4")), {
      create: genPrimitiveNode(toNodeId("4")),
    })

    store.set(primitiveNodeAtom(toNodeId("4")), {
      update: genPrimitiveNode(toNodeId("4"), {}),
    })

    expect(subscriber).not.toHaveBeenCalled()
  })

  test("primitiveNodeAtomを正しく削除できる / 削除されたノードにアクセスするとエラーになる", () => {
    // action
    store.update(
      nodeIdsAtom,
      updateSetOp((ids) => ids.filter((id) => id !== toNodeId("1"))),
    )
    store.remove(primitiveNodeAtom, toNodeId("1"))

    // expect
    expect(store.get(nodeIdsAtom)).toEqual(
      new Set([toNodeId("2"), toNodeId("3")]),
    )

    expect(() => store.get(primitiveNodeAtom(toNodeId("1")))).toThrow(
      AtomNotFoundError,
    )
  })
})

describe("node > node", () => {
  beforeEach(() => {
    store.clear()
    primitiveNodeAtom.clearAll()
    resourceAtom.clearAll()
    userDefinedActionAtom.clearAll()
    variableAtom.clearAll()
  })

  test("resource で定義されたOpenAPIを参照できる", () => {
    resourceAtom(
      toResourceId("r1"),
      buildResource("r1", {
        type: "openapi" as const,
        name: `Resource 1`,
        description: "",
        content: {
          openapi: "3.0.0",
          info: {
            title: "title",
            version: "1.0.0",
          },
          paths: {
            "/post-test": {
              post: {
                operationId: `operationId`,
              },
            },
          },
        },
        location: {
          locationType: "local_file" as const,
          path: "",
        },
      }),
    )
    store.update(resourceIdsAtom, addSetOp(toResourceId("r1")))

    store.set(primitiveNodeAtom(toNodeId("1")), {
      create: {
        id: toNodeId("1"),
        name: "node",
        description: "",
        actionInstances: [
          {
            id: toActionInstanceId("ai1"),
            description: "",
            config: {
              followRedirect: true,
              useCookie: true,
            },
            type: "rest_call" as const,
            instanceParameter: {
              headers: [],
              cookies: [],
              queryParams: [],
              pathParams: [],
              body: {
                selected: "application/json" as const,
                params: {
                  "application/form-data": [],
                  "application/json": {},
                },
              },
            },
            actionIdentifier: {
              resourceType: "resource",
              resourceIdentifier: {
                resourceId: "r1",
                identifier: { operationId: "operationId" },
              },
            },
          },
        ],
        config: {},
      },
    })

    const node = store.get(nodeAtom(toNodeId("1")))

    expect(node).toEqual({
      id: toNodeId("1"),
      name: "node",
      actionInstances: [
        {
          id: toActionInstanceId("ai1"),
          type: "rest_call",
          description: "",
          instanceParameter: {
            method: "POST",
            path: "/post-test",
            headers: [],
            cookies: [],
            queryParams: [],
            pathParams: [],
            body: {
              selected: "application/json",
              params: {
                "application/form-data": [],
                "application/json": {},
              },
            },
            baseUrl: "https://example.com",
          },
          action: {
            id: expect.any(String) as ActionId,
            name: "operationId",
            description: "",
            type: "rest_call",
            resourceIdentifier: {
              resourceId: "r1",
              identifier: { operationId: "operationId" },
            },
            resourceType: "resource",
            schema: {
              base: {
                baseUrl: "https://example.com",
                method: "POST",
                path: "/post-test",
              },
              examples: [
                {
                  baseUrl: "https://example.com",
                  body: {
                    selected: "application/json",
                    params: {
                      "application/json": {},
                      "application/form-data": [],
                    },
                  },
                  method: "POST",
                  path: "/post-test",
                  headers: [],
                  cookies: [],
                  queryParams: [],
                  pathParams: [],
                },
              ],
              jsonSchema: {
                operationId: "operationId",
              },
            },
          },
          actionIdentifier: {
            resourceType: "resource",
            resourceIdentifier: {
              resourceId: "r1",
              identifier: { operationId: "operationId" },
            },
          },
          config: {
            followRedirect: true,
            useCookie: true,
          },
        },
      ],
      config: {
        condition: "true" as Expression,
        loop: {
          times: 1,
        },
      },
    })
  })

  test("user_defined で定義されたOpenAPIを参照できる", () => {
    store.set(
      userDefinedActionIdsAtom,
      new Set([toUserDefinedActionId("uda1")]),
    )
    store.set(userDefinedActionAtom(toUserDefinedActionId("uda1")), {
      create: {
        id: toUserDefinedActionId("uda1"),
        type: "rest_call" as const,
        name: "operationId",
        description: "",
        schema: {
          base: {
            method: "POST" as const,
            path: "/uda" as Expression,
            headers: [],
            cookies: [],
            queryParams: [],
            pathParams: [],
            baseUrl: "https://example.com",
          },
          examples: [],
          jsonSchema: undefined,
        },
      },
    })

    store.set(primitiveNodeAtom(toNodeId("1")), {
      create: {
        id: toNodeId("1"),
        name: "node",
        description: "",
        actionInstances: [
          {
            id: toActionInstanceId("ai1"),
            type: "rest_call" as const,
            description: "",
            instanceParameter: {
              headers: [],
              cookies: [],
              queryParams: [],
              pathParams: [],
              body: {
                selected: "application/json" as const,
                params: {
                  "application/form-data": [],
                  "application/json": {},
                },
              },
            },
            actionIdentifier: {
              resourceType: "user_defined",
              resourceIdentifier: {
                userDefinedActionId: toUserDefinedActionId("uda1"),
              },
            },
            config: {
              followRedirect: true,
              useCookie: true,
            },
          },
        ],
        config: {},
      },
    })

    const node = store.get(nodeAtom(toNodeId("1")))

    expect(node).toEqual({
      id: toNodeId("1"),
      name: "node",
      actionInstances: [
        {
          id: toActionInstanceId("ai1"),
          type: "rest_call",
          description: "",
          instanceParameter: {
            baseUrl: "https://example.com",
            method: "POST",
            path: "/uda",
            headers: [],
            cookies: [],
            queryParams: [],
            pathParams: [],
            body: {
              selected: "application/json",
              params: {
                "application/form-data": [],
                "application/json": {},
              },
            },
          },
          action: {
            id: expect.any(String) as string,
            name: "operationId",
            description: "",
            resourceIdentifier: {
              userDefinedActionId: "uda1",
            },
            type: "rest_call",
            resourceType: "user_defined",
            schema: {
              base: {
                baseUrl: "https://example.com",
                method: "POST",
                path: "/uda",
                headers: [],
                cookies: [],
                queryParams: [],
                pathParams: [],
              },
              examples: [],
              jsonSchema: undefined,
            },
          },
          actionIdentifier: {
            resourceType: "user_defined",
            resourceIdentifier: {
              userDefinedActionId: toUserDefinedActionId("uda1"),
            },
          },
          config: {
            followRedirect: true,
            useCookie: true,
          },
        },
      ],
      config: {
        condition: "true",
        loop: {
          times: 1,
        },
      },
    })
  })

  test("validator のアクションを定義できる", () => {
    store.set(primitiveNodeAtom(toNodeId("1")), {
      create: {
        id: toNodeId("1"),
        description: "",
        name: "node",
        actionInstances: [
          {
            id: toActionInstanceId("ai1"),
            type: "validator" as const,
            instanceParameter: {
              contents: "true" as Expression,
            },
          },
        ],
        config: {},
      },
    })

    expect(store.get(nodeAtom(toNodeId("1")))).toEqual({
      id: toNodeId("1"),
      name: "node",
      actionInstances: [
        {
          id: toActionInstanceId("ai1"),
          type: "validator",
          instanceParameter: {
            contents: "true",
          },
        },
      ],
      config: {
        condition: "true",
        loop: {
          times: 1,
        },
      },
    })
  })

  test("binder のアクションを定義できる", () => {
    store.set(variableAtom(toLocalVariableId("vr1")), {
      create: {
        id: toLocalVariableId("vr1"),
        name: "variable",
        description: "",
        schema: "any",
        boundIn: "1",
      },
    })

    store.set(primitiveNodeAtom(toNodeId("1")), {
      create: {
        id: toNodeId("1"),
        name: "node",
        description: "",
        actionInstances: [
          {
            id: toActionInstanceId("ai1"),
            type: "binder" as const,
            instanceParameter: {
              assignments: [
                {
                  variableId: toLocalVariableId("vr1"),
                  value: "true" as Expression,
                },
              ],
            },
          },
        ],
        config: {},
      },
    })

    expect(store.get(nodeAtom(toNodeId("1")))).toEqual({
      id: toNodeId("1"),
      name: "node",
      actionInstances: [
        {
          id: toActionInstanceId("ai1"),
          type: "binder" as const,
          instanceParameter: {
            assignments: [
              {
                variableId: toLocalVariableId("vr1"),
                value: "true" as Path,
                variable: {
                  id: toLocalVariableId("vr1"),
                  name: "variable",
                  description: "",
                  schema: "any",
                  boundIn: "1",
                },
              },
            ],
          },
        },
      ],
      config: {
        condition: "true",
        loop: {
          times: 1,
        },
      },
    })
  })
})
