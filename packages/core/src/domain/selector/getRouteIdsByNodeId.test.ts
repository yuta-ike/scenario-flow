import { beforeEach, describe, expect, test, vi } from "vitest"

import { primitiveRouteAtom, routeIdsAtom } from "../datasource/route"
import { nodeIdsAtom, primitiveNodeAtom } from "../datasource/node"
import { genPrimitiveNode } from "../entity/node/node.factory"
import { toNodeId } from "../entity/node/node.util"
import { genPrimitiveRoute } from "../entity/route/route.factory"
import { toRouteId } from "../entity/route/route.util"

import { getRouteIdsByNodeId } from "./getRouteIdsByNodeId"
import { createStore } from "@scenario-flow/util/lib"

const primitiveNodes = new Map([
  ["n1", genPrimitiveNode(toNodeId("n1"))],
  ["n2", genPrimitiveNode(toNodeId("n2"))],
  ["n3", genPrimitiveNode(toNodeId("n3"))],
  ["n4", genPrimitiveNode(toNodeId("n4"))],
])

const store = createStore()

describe("getRouteIdsByNodeId", () => {
  beforeEach(() => {
    store.clear()

    store.set(
      nodeIdsAtom,
      new Set([toNodeId("n1"), toNodeId("n2"), toNodeId("n3"), toNodeId("n4")]),
    )
    for (const id of ["n1", "n2", "n3", "n4"]) {
      store.set(primitiveNodeAtom(toNodeId(id)), {
        create: primitiveNodes.get(id)!,
      })
    }

    store.set(routeIdsAtom, new Set([toRouteId("r1"), toRouteId("r2")]))
    store.set(primitiveRouteAtom(toRouteId("r1")), {
      create: genPrimitiveRoute("r1", ["n1", "n2"]),
    })
    store.set(primitiveRouteAtom(toRouteId("r2")), {
      create: genPrimitiveRoute("r2", ["n1", "n3", "n4"]),
    })
  })

  test("getRouteIdsByNodeIdが正しく取得できる", () => {
    const res1 = store.get(getRouteIdsByNodeId(toNodeId("n1")))
    expect(res1).toEqual([toRouteId("r1"), toRouteId("r2")])

    const res2 = store.get(getRouteIdsByNodeId(toNodeId("n2")))
    expect(res2).toEqual([toRouteId("r1")])
  })

  test.skip("getRouteIdsByNodeId値に変更がなければキャッシュされる", () => {
    const subscriber = vi.fn()
    store.subscribe(getRouteIdsByNodeId(toNodeId("n1")), subscriber)

    // action
    store.set(primitiveRouteAtom(toRouteId("r2")), {
      create: genPrimitiveRoute("r2", ["n1", "n3"]),
    })

    expect(subscriber).not.toHaveBeenCalledOnce()
  })
})
