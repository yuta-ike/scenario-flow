import { beforeEach, describe, expect, test } from "vitest"

import { nodeIdsAtom, primitiveNodeAtom } from "../datasource/node"
import { toNodeId } from "../entity/node/node.util"
import { toActionInstanceId } from "../entity/node/actionInstance.util"
import { toLocalVariableId } from "../entity/variable/variable.util"
import { primitiveRouteAtom, routeIdsAtom } from "../datasource/route"
import { toRouteId } from "../entity/route/route.util"
import { genPrimitiveNode } from "../entity/node/node.factory"
import { variableAtom, variableIdsAtom } from "../datasource/variable"
import { genPrimitiveRoute } from "../entity/route/route.factory"
import {
  DEFAULT_PATTERN_ID,
  globalVariableAtom,
  globalVariableIdsAtom,
  globalVariableValueAtom,
} from "../datasource/globalVariable"
import { genGlobalVariable } from "../entity/globalVariable/globalVariable.factory"
import {
  toGlobalVariableId,
  toGlobalVariableValueId,
} from "../entity/globalVariable/globalVariable.util"

import { getResolvedNodeEnvironment } from "./getRouteEnvironment"

import type { Expression } from "../entity/value/expression"

import { createStore } from "@/lib/jotai/store"

const store = createStore()

describe("getRouteEnvironment", () => {
  beforeEach(() => {
    // variable
    store.clear()
    variableAtom.clearAll()
    primitiveNodeAtom.clearAll()
    primitiveRouteAtom.clearAll()
    variableAtom(toLocalVariableId("v1"), {
      id: toLocalVariableId("v1"),
      name: "v1",
      description: "",
      schema: "any",
    })
    variableAtom(toLocalVariableId("v2"), {
      id: toLocalVariableId("v2"),
      name: "v2",
      description: "",
      schema: "any",
    })
    variableAtom(toLocalVariableId("v3"), {
      id: toLocalVariableId("v3"),
      name: "v3",
      description: "",
      schema: "any",
    })
    store.set(
      variableIdsAtom,
      new Set([
        toLocalVariableId("v1"),
        toLocalVariableId("v2"),
        toLocalVariableId("v3"),
      ]),
    )
  })

  test("祖先ノードで定義されたローカル変数を参照できる", () => {
    // node
    const node1 = genPrimitiveNode(toNodeId("n1"), {
      actionInstances: [
        {
          actionInstanceId: toActionInstanceId("ai1"),
          type: "binder",
          instanceParameter: {
            description: "",
            assignments: [
              {
                variableId: toLocalVariableId("v1"),
                value: "value1" as Expression,
              },
            ],
          },
        },
      ],
    })
    store.set(primitiveNodeAtom(toNodeId("n1")), {
      create: node1,
    })
    const node2 = genPrimitiveNode(toNodeId("n2"), {
      actionInstances: [
        {
          actionInstanceId: toActionInstanceId("ai1"),
          type: "binder" as const,
          instanceParameter: {
            description: "",
            assignments: [
              {
                variableId: toLocalVariableId("v2"),
                value: "value2" as Expression,
              },
            ],
          },
        },
      ],
    })
    store.set(primitiveNodeAtom(toNodeId("n2")), {
      create: genPrimitiveNode(toNodeId("n2"), node2),
    })
    store.set(primitiveNodeAtom(toNodeId("n3")), {
      create: genPrimitiveNode(toNodeId("n3")),
    })
    store.set(
      nodeIdsAtom,
      new Set([toNodeId("n1"), toNodeId("n2"), toNodeId("n3")]),
    )

    // route
    store.set(
      primitiveRouteAtom(toRouteId("r1")),
      genPrimitiveRoute(toRouteId("r1"), [
        toNodeId("n1"),
        toNodeId("n2"),
        toNodeId("n3"),
      ]),
    )
    store.set(routeIdsAtom, new Set([toRouteId("r1")]))

    expect(store.get(getResolvedNodeEnvironment(toNodeId("n3")))).toEqual([
      {
        variable: {
          id: toLocalVariableId("v1"),
          name: "v1",
          description: "",
          schema: "any",
          boundIn: node1,
        },
      },
      {
        variable: {
          id: toLocalVariableId("v2"),
          name: "v2",
          description: "",
          schema: "any",
          boundIn: node2,
        },
      },
    ])
    expect(store.get(getResolvedNodeEnvironment(toNodeId("n2")))).toEqual([
      {
        variable: {
          id: toLocalVariableId("v1"),
          name: "v1",
          description: "",
          schema: "any",
          boundIn: node1,
        },
      },
      {
        variable: {
          id: toLocalVariableId("v2"),
          name: "v2",
          description: "",
          schema: "any",
          boundIn: node2,
        },
      },
    ])
    expect(store.get(getResolvedNodeEnvironment(toNodeId("n1")))).toEqual([
      {
        variable: {
          id: toLocalVariableId("v1"),
          name: "v1",
          description: "",
          schema: "any",
          boundIn: node1,
        },
      },
    ])
  })

  test("同じ変数に束縛する場合はシャドーイングされる", () => {
    // node
    const node1 = genPrimitiveNode(toNodeId("n1"), {
      actionInstances: [
        {
          actionInstanceId: toActionInstanceId("ai1"),
          type: "binder",
          instanceParameter: {
            description: "",
            assignments: [
              {
                variableId: toLocalVariableId("v1"),
                value: "value1" as Expression,
              },
            ],
          },
        },
      ],
    })
    store.set(primitiveNodeAtom(toNodeId("n1")), {
      create: node1,
    })
    const node2 = genPrimitiveNode(toNodeId("n2"), {
      actionInstances: [
        {
          actionInstanceId: toActionInstanceId("ai1"),
          type: "binder" as const,
          instanceParameter: {
            description: "",
            assignments: [
              {
                variableId: toLocalVariableId("v1"),
                value: "value2" as Expression,
              },
            ],
          },
        },
      ],
    })
    store.set(primitiveNodeAtom(toNodeId("n2")), {
      create: genPrimitiveNode(toNodeId("n2"), node2),
    })
    store.set(primitiveNodeAtom(toNodeId("n3")), {
      create: genPrimitiveNode(toNodeId("n3")),
    })
    store.set(
      nodeIdsAtom,
      new Set([toNodeId("n1"), toNodeId("n2"), toNodeId("n3")]),
    )

    // route
    store.set(
      primitiveRouteAtom(toRouteId("r1")),
      genPrimitiveRoute(toRouteId("r1"), [
        toNodeId("n1"),
        toNodeId("n2"),
        toNodeId("n3"),
      ]),
    )
    store.set(routeIdsAtom, new Set([toRouteId("r1")]))

    expect(store.get(getResolvedNodeEnvironment(toNodeId("n3")))).toEqual([
      {
        variable: {
          id: toLocalVariableId("v1"),
          name: "v1",
          description: "",
          schema: "any",
          boundIn: node2,
        },
      },
    ])
  })

  test("グローバル変数が含まれる", () => {
    // global variables
    globalVariableAtom(
      toGlobalVariableId("gv1"),
      genGlobalVariable("gv1", { name: "gv1" }),
    )
    store.set(globalVariableIdsAtom, new Set([toGlobalVariableId("gv1")]))
    globalVariableValueAtom(toGlobalVariableValueId("gvv1"), {
      id: toGlobalVariableValueId("gvv1"),
      patternId: DEFAULT_PATTERN_ID,
      globalVariableId: toGlobalVariableId("gv1"),
      value: {
        type: "string" as const,
        value: "global value",
      },
    })

    // node
    const node1 = genPrimitiveNode(toNodeId("n1"), {
      actionInstances: [
        {
          actionInstanceId: toActionInstanceId("ai1"),
          type: "binder",
          instanceParameter: {
            description: "",
            assignments: [
              {
                variableId: toLocalVariableId("v1"),
                value: "value1" as Expression,
              },
            ],
          },
        },
      ],
    })
    store.set(primitiveNodeAtom(toNodeId("n1")), {
      create: node1,
    })
    store.set(nodeIdsAtom, new Set([toNodeId("n1")]))

    // route
    store.set(
      primitiveRouteAtom(toRouteId("r1")),
      genPrimitiveRoute(toRouteId("r1"), [toNodeId("n1")]),
    )
    store.set(routeIdsAtom, new Set([toRouteId("r1")]))

    expect(store.get(getResolvedNodeEnvironment(toNodeId("n1")))).toEqual([
      {
        variable: {
          id: "gv1",
          name: "gv1",
          description: "description",
          schema: "any",
          boundIn: "global",
        },
      },
      {
        variable: {
          id: toLocalVariableId("v1"),
          name: "v1",
          description: "",
          schema: "any",
          boundIn: node1,
        },
      },
    ])
  })
})
