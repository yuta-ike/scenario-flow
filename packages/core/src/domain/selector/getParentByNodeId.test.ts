import { beforeEach, describe, expect, test, vi } from "vitest"

import { primitiveRouteAtom, routeIdsAtom } from "../datasource/route"
import { nodeIdsAtom, primitiveNodeAtom } from "../datasource/node"
import { toNodeId } from "../entity/node/node.util"
import { genPrimitiveNode } from "../entity/node/node.factory"
import { genPrimitiveRoute } from "../entity/route/route.factory"
import { toRouteId } from "../entity/route/route.util"

import { getParentByNodeId } from "./getParentByNodeId"

import { createStore } from "@/lib/jotai/store"

const primitiveNodes = new Map([
  ["n1", genPrimitiveNode(toNodeId("n1"))],
  ["n2", genPrimitiveNode(toNodeId("n2"))],
  ["n3", genPrimitiveNode(toNodeId("n3"))],
  ["n4", genPrimitiveNode(toNodeId("n4"))],
])

const store = createStore()

describe("getParentByNodeId", () => {
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
      create: genPrimitiveRoute("r1", ["n1", "n2", "n4"]),
    })
    store.set(primitiveRouteAtom(toRouteId("r2")), {
      create: genPrimitiveRoute("r2", ["n1", "n3", "n4"]),
    })
  })

  test("getParentByNodeIdが正しく取得できる", () => {
    const res1 = store.get(getParentByNodeId(toNodeId("n4")))
    expect(res1).toEqual([toNodeId("n2"), toNodeId("n3")])

    const res2 = store.get(getParentByNodeId(toNodeId("n2")))
    expect(res2).toEqual([toNodeId("n1")])
  })

  test.skip("getRouteIdsByNodeIdの値に変更がなければキャッシュされる", () => {
    const subscriber = vi.fn()
    store.subscribe(getParentByNodeId(toNodeId("n1")), subscriber)

    // action
    store.set(primitiveRouteAtom(toRouteId("r2")), {
      create: genPrimitiveRoute("r2", ["n1", "n3"]),
    })

    expect(subscriber).not.toHaveBeenCalledOnce()
  })
})
