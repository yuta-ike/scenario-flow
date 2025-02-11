import { beforeEach, describe, expect, test } from "vitest"

import { nodeIdsAtom, primitiveNodeAtom } from "../datasource/node"
import { toNodeId } from "../entity/node/node.util"
import { toActionInstanceId } from "../entity/node/actionInstance.util"
import { toLocalVariableId } from "../entity/variable/variable.util"
import { primitiveRouteAtom, routeIdsAtom } from "../datasource/route"
import { toRouteId } from "../entity/route/route.util"
import { genPrimitiveNode } from "../entity/node/node.factory"
import { variableAtom } from "../datasource/variable"
import { genPrimitiveRoute } from "../entity/route/route.factory"
import {
  DEFAULT_PATTERN_ID,
  globalVariableAtom,
  globalVariableValueAtom,
} from "../datasource/globalVariable"
import { genGlobalVariable } from "../entity/globalVariable/globalVariable.factory"
import {
  toGlobalVariableId,
  toGlobalVariableValueId,
} from "../entity/globalVariable/globalVariable.util"
import { buildLocalVariable } from "../entity/variable/variable"
import { buildGlobalVariableBind } from "../entity/globalVariable/globalVariable"

import { getResolvedNodeEnvironment } from "./getRouteEnvironment"

import type { Expression } from "../entity/value/expression"
import { createStore } from "@scenario-flow/util/lib"

const store = createStore()

describe("getRouteEnvironment", () => {
  beforeEach(() => {
    // variable
    store.clear()
    variableAtom.clearAll()
    primitiveNodeAtom.clearAll()
    primitiveRouteAtom.clearAll()
    store.set(variableAtom(toLocalVariableId("v1")), {
      create: buildLocalVariable("v1", {
        name: "v1",
        description: "",
        schema: "any",
        boundIn: "n1",
      }),
    })
    store.set(variableAtom(toLocalVariableId("v2")), {
      create: buildLocalVariable("v2", {
        name: "v2",
        description: "",
        schema: "any",
        boundIn: "n2",
      }),
    })
    store.set(variableAtom(toLocalVariableId("v3")), {
      create: buildLocalVariable("v3", {
        name: "v3",
        description: "",
        schema: "any",
        boundIn: "n3",
      }),
    })
  })

  test("祖先ノードで定義されたローカル変数を参照できる", () => {
    // node
    const node1 = genPrimitiveNode(toNodeId("n1"), {
      actionInstances: [
        {
          id: toActionInstanceId("ai1"),
          type: "binder",
          instanceParameter: {
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
          id: toActionInstanceId("ai1"),
          type: "binder" as const,
          instanceParameter: {
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

    // route
    store.set(primitiveRouteAtom(toRouteId("r1")), {
      create: genPrimitiveRoute(toRouteId("r1"), [
        toNodeId("n1"),
        toNodeId("n2"),
        toNodeId("n3"),
      ]),
    })
    store.set(routeIdsAtom, new Set([toRouteId("r1")]))

    expect(store.get(getResolvedNodeEnvironment(toNodeId("n3")))).toEqual([
      {
        inherit: true,
        variable: {
          id: toLocalVariableId("v1"),
          name: "v1",
          description: "",
          schema: "any",
          boundIn: node1,
        },
      },
      {
        inherit: true,
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
        inherit: true,
        variable: {
          id: toLocalVariableId("v1"),
          name: "v1",
          description: "",
          schema: "any",
          boundIn: node1,
        },
      },
      {
        inherit: true,
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
        inherit: true,
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
          id: toActionInstanceId("ai1"),
          type: "binder",
          instanceParameter: {
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
          id: toActionInstanceId("ai1"),
          type: "binder" as const,
          instanceParameter: {
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

    // route
    store.set(primitiveRouteAtom(toRouteId("r1")), {
      create: genPrimitiveRoute(toRouteId("r1"), [
        toNodeId("n1"),
        toNodeId("n2"),
        toNodeId("n3"),
      ]),
    })
    store.set(routeIdsAtom, new Set([toRouteId("r1")]))

    expect(store.get(getResolvedNodeEnvironment(toNodeId("n3")))).toEqual([
      {
        inherit: true,
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
    globalVariableValueAtom(
      toGlobalVariableValueId("gvv1"),
      buildGlobalVariableBind("gvv1", {
        patternId: DEFAULT_PATTERN_ID,
        globalVariableId: toGlobalVariableId("gv1"),
        value: {
          type: "string" as const,
          value: "global value",
        },
      }),
    )

    // node
    const node1 = genPrimitiveNode(toNodeId("n1"), {
      actionInstances: [
        {
          id: toActionInstanceId("ai1"),
          type: "binder",
          instanceParameter: {
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
    store.set(primitiveRouteAtom(toRouteId("r1")), {
      create: genPrimitiveRoute(toRouteId("r1"), [toNodeId("n1")]),
    })
    store.set(routeIdsAtom, new Set([toRouteId("r1")]))

    expect(store.get(getResolvedNodeEnvironment(toNodeId("n1")))).toEqual([
      {
        inherit: true,
        variable: {
          id: "gv1",
          name: "gv1",
          description: "description",
          schema: "any",
          boundIn: "global",
        },
      },
      {
        inherit: true,
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
