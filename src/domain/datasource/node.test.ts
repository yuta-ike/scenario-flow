import { beforeEach, describe, expect, test, vi } from "vitest"

import { toActionRefId } from "../entity/node/actionRef.util"
import { genPrimitiveNode } from "../entity/node/node.factory"
import {
  toResourceActionId,
  toResourceId,
} from "../entity/resource/resource.util"
import { toNodeId } from "../entity/node/node.util"
import {
  toActionInstanceId,
  toValidatorId,
} from "../entity/node/actionInstance.util"
import { toLocalVariableId } from "../entity/variable/variable.util"
import { toUserDefinedActionId } from "../entity/userDefinedAction/userDefinedAction.util"
import {
  resourceActionToActionId,
  toActionId,
} from "../entity/action/action.util"

import {
  userDefinedActionAtom,
  userDefinedActionIdsAtom,
} from "./userDefinedAction"
import { resourceAtom, resourceIdsAtom } from "./resource"
import { nodeAtom, nodeIdsAtom, nodesAtom, primitiveNodeAtom } from "./node"
import { variableAtom, variableIdsAtom } from "./variable"

import type { ActionId } from "../entity/action/action"
import type { Expression } from "../entity/value/expression"
import type { Path } from "../entity/value/path"

import { AtomNotFoundError } from "@/lib/jotai/atomWithId"
import { createStore } from "@/lib/jotai/store"
import { addSetOp, updateSetOp } from "@/utils/set"

const store = createStore()

const beforeEachProcess = () => {
  store.clear()

  primitiveNodeAtom.clearAll()
  resourceAtom.clearAll()
  userDefinedActionAtom.clearAll()
  variableAtom.clearAll()

  store.set(nodeIdsAtom, new Set([toNodeId("1"), toNodeId("2"), toNodeId("3")]))
  for (const id of ["1", "2", "3"]) {
    primitiveNodeAtom(toNodeId(id), genPrimitiveNode(toNodeId(id)))
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
    store.update(primitiveNodeAtom(toNodeId("1")), () =>
      genPrimitiveNode(toNodeId("1"), {}),
    )

    expect(subscriber).toHaveBeenCalled()
  })

  test("primitiveNodeAtomの変更では、nodeIdsAtomに変更が通知されない", () => {
    const subscriber = vi.fn()
    store.subscribe(nodeIdsAtom, subscriber)

    // action
    store.update(primitiveNodeAtom(toNodeId("1")), () =>
      genPrimitiveNode(toNodeId("1"), {}),
    )

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
    primitiveNodeAtom(toNodeId("4"), genPrimitiveNode(toNodeId("4")))

    store.set(
      primitiveNodeAtom(toNodeId("4")),
      genPrimitiveNode(toNodeId("4"), {}),
    )

    expect(subscriber).not.toHaveBeenCalled()
  })

  test("primitiveNodeAtomを正しく削除できる / 削除されたノードにアクセスするとエラーになる", () => {
    // action
    store.update(
      nodeIdsAtom,
      updateSetOp((ids) => ids.filter((id) => id !== toNodeId("1"))),
    )
    primitiveNodeAtom.remove(toNodeId("1"))

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
    resourceAtom(toResourceId("r1"), {
      id: toResourceId("r1"),
      type: "OpenApi" as const,
      name: `Resource 1`,
      description: "",
      content: {
        paths: {
          "/post-test": {
            post: {
              operationId: `operationId`,
            },
          },
        },
      },
      locationType: "LocalFile" as const,
      path: "/path/to/resource",
    })
    store.update(resourceIdsAtom, addSetOp(toResourceId("r1")))

    primitiveNodeAtom(toNodeId("1"), {
      id: toNodeId("1"),
      name: "node",
      actionInstances: [
        {
          actionInstanceId: toActionInstanceId("ai1"),
          type: "rest_call" as const,
          instanceParameter: {
            description: "",
            headers: [],
            cookies: [],
            queryParams: [],
            pathParams: [],
            config: {
              followRedirect: false,
              useCookie: false,
            },
          },
          actionRef: {
            id: toActionRefId("ar1"),
            actionId: resourceActionToActionId(
              toResourceActionId("operationId"),
              toResourceId("r1"),
            ),
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

    const node = store.get(nodeAtom(toNodeId("1")))

    expect(node).toEqual({
      id: toNodeId("1"),
      name: "node",
      actionInstances: [
        {
          actionInstanceId: toActionInstanceId("ai1"),
          type: "rest_call",
          instanceParameter: {
            description: "",
            headers: [],
            cookies: [],
            queryParams: [],
            pathParams: [],
            config: {
              followRedirect: false,
              useCookie: false,
            },
          },
          action: {
            id: expect.any(String) as ActionId,
            name: "post /post-test",
            description: "",
            parameter: {
              method: "POST",
              path: "/post-test" as Expression,
              baseUrl: "https://example.com",
            },
            type: "rest_call",
            source: "resoure",
            resourceId: toResourceId("r1"),
            resourceActionId: "operationId",
            identifier: {
              operationId: "operationId",
            },
          },
          actionRef: {
            id: toActionRefId("ar1"),
            actionId: resourceActionToActionId(
              toResourceActionId("operationId"),
              toResourceId("r1"),
            ),
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
    userDefinedActionAtom(toUserDefinedActionId("uda1"), {
      id: toUserDefinedActionId("uda1"),
      type: "rest_call" as const,
      name: "post /post-test",
      description: "",
      parameter: {
        method: "POST",
        path: "/uda" as Expression,
        baseUrl: "https://example.com",
      },
    })

    primitiveNodeAtom(toNodeId("1"), {
      id: toNodeId("1"),
      name: "node",
      actionInstances: [
        {
          actionInstanceId: toActionInstanceId("ai1"),
          type: "rest_call" as const,
          instanceParameter: {
            description: "",
            headers: [],
            cookies: [],
            queryParams: [],
            pathParams: [],
            config: {
              followRedirect: false,
              useCookie: false,
            },
          },
          actionRef: {
            id: toActionRefId("ar1"),
            actionId: toActionId(toUserDefinedActionId("uda1")),
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

    const node = store.get(nodeAtom(toNodeId("1")))

    expect(node).toEqual({
      id: toNodeId("1"),
      name: "node",
      actionInstances: [
        {
          actionInstanceId: toActionInstanceId("ai1"),
          type: "rest_call",
          instanceParameter: {
            description: "",
            headers: [],
            cookies: [],
            queryParams: [],
            pathParams: [],
            config: {
              followRedirect: false,
              useCookie: false,
            },
          },
          action: {
            id: expect.any(String) as string,
            name: "post /post-test",
            description: "",
            parameter: {
              method: "POST",
              path: "/uda",
              baseUrl: "https://example.com",
            },
            type: "rest_call",
            source: "userDefined",
            userDefinedActionId: "uda1",
          },
          actionRef: {
            id: toActionRefId("ar1"),
            actionId: toActionId(toUserDefinedActionId("uda1")),
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
    primitiveNodeAtom(toNodeId("1"), {
      id: toNodeId("1"),
      name: "node",
      actionInstances: [
        {
          actionInstanceId: toActionInstanceId("ai1"),
          type: "validator" as const,
          instanceParameter: {
            id: toValidatorId("vl1"),
            description: "",
            contents: "true" as Expression,
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

    expect(store.get(nodeAtom(toNodeId("1")))).toEqual({
      id: toNodeId("1"),
      actionInstances: [
        {
          actionInstanceId: toActionInstanceId("ai1"),
          type: "validator",
          instanceParameter: {
            id: toValidatorId("vl1"),
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
    store.set(variableIdsAtom, new Set([toLocalVariableId("vr1")]))
    variableAtom(toLocalVariableId("vr1"), {
      id: toLocalVariableId("vr1"),
      name: "variable",
      description: "",
      schema: "any",
    })

    primitiveNodeAtom(toNodeId("1"), {
      id: toNodeId("1"),
      name: "node",
      actionInstances: [
        {
          actionInstanceId: toActionInstanceId("ai1"),
          type: "binder" as const,
          instanceParameter: {
            description: "",
            assignments: [
              {
                variableId: toLocalVariableId("vr1"),
                value: "true" as Expression,
              },
            ],
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

    expect(store.get(nodeAtom(toNodeId("1")))).toEqual({
      id: toNodeId("1"),
      name: "node",
      actionInstances: [
        {
          actionInstanceId: toActionInstanceId("ai1"),
          type: "binder" as const,
          instanceParameter: {
            variableId: toLocalVariableId("vr1"),
            value: "true" as Path,
            variable: {
              id: toLocalVariableId("vr1"),
              name: "variable",
              description: "",
            },
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
