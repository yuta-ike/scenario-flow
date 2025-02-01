import { beforeEach, describe, expect, test, vi } from "vitest"

import { toNodeId } from "../entity/node/node.util"
import { toRouteId } from "../entity/route/route.util"
import { genNode, genPrimitiveNode } from "../entity/node/node.factory"
import { genPrimitiveRoute, genRoute } from "../entity/route/route.factory"

import { primitiveRouteAtom, routeAtom, routeIdsAtom } from "./route"
import { nodeIdsAtom, primitiveNodeAtom } from "./node"

import { updateSetOp } from "@scenario-flow/util"
import { AtomNotFoundError, createStore } from "@scenario-flow/util/lib"

const primitiveNodes = new Map([
  ["n1", genPrimitiveNode(toNodeId("n1"))],
  ["n2", genPrimitiveNode(toNodeId("n2"))],
  ["n3", genPrimitiveNode(toNodeId("n3"))],
  ["n4", genPrimitiveNode(toNodeId("n4"))],
])

const store = createStore()

const beforeEachProcess = () => {
  store.clear()
  primitiveRouteAtom.clearAll()
  primitiveNodeAtom.clearAll()

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
}

describe("route > primitiveRoute", () => {
  beforeEach(beforeEachProcess)

  test("primitiveRouteAtom / routeIdsが正しく取得できる", () => {
    expect(store.get(primitiveRouteAtom(toRouteId("r1")))).toEqual(
      genPrimitiveRoute("r1", ["n1", "n2"]),
    )
  })

  test("primitiveRouteAtomの変更で、変更が通知される", () => {
    const subscriber = vi.fn()
    store.subscribe(primitiveRouteAtom(toRouteId("r1")), subscriber)

    // action
    store.update(primitiveRouteAtom(toRouteId("r1")), () => ({
      update: genPrimitiveRoute("r1", ["n1", "n2"], {
        name: "new",
      }),
    }))

    expect(subscriber).toHaveBeenCalled()
  })

  test("primitiveRouteAtomの変更では、routeIdsAtomに変更が通知されない", () => {
    const subscriber = vi.fn()
    store.subscribe(routeIdsAtom, subscriber)

    // action
    store.update(primitiveRouteAtom(toRouteId("r1")), () => ({
      update: genPrimitiveRoute("r1", ["n1", "n2"], {
        name: "new",
      }),
    }))

    expect(subscriber).not.toHaveBeenCalled()
  })

  test("routeIdsAtomの変更では、primitiveRouteAtomに変更が通知されない", () => {
    const subscriber = vi.fn()
    store.subscribe(primitiveRouteAtom(toRouteId("r1")), subscriber)

    // action
    store.update(
      routeIdsAtom,
      updateSetOp((ids) => [...ids, toRouteId("r3")]),
    )
    store.set(primitiveRouteAtom(toRouteId("r3")), {
      create: genPrimitiveRoute("r2", ["n1", "n2"]),
    })

    store.set(primitiveRouteAtom(toRouteId("r3")), {
      create: genPrimitiveRoute("r3", ["n1", "n2"], { name: "new" }),
    })

    expect(subscriber).not.toHaveBeenCalled()
  })

  test("primitiveRouteAtomを正しく削除できる / 削除されたノードにアクセスするとエラーになる", () => {
    // action
    store.update(
      routeIdsAtom,
      updateSetOp((ids) => ids.filter((id) => id !== "r1")),
    )
    store.remove(primitiveRouteAtom, toRouteId("r1"))

    // expect
    expect(store.get(routeIdsAtom)).toEqual(new Set([toRouteId("r2")]))

    expect(() => store.get(primitiveRouteAtom(toRouteId("r1")))).toThrow(
      AtomNotFoundError,
    )
  })
})

const nodes = new Map([
  ["n1", genNode(toNodeId("n1"))],
  ["n2", genNode(toNodeId("n2"))],
  ["n3", genNode(toNodeId("n3"))],
  ["n4", genNode(toNodeId("n4"))],
])

describe("route > route", () => {
  beforeEach(beforeEachProcess)

  test("routeを、nodeのデータ込みで正しく取得できる", () => {
    expect(store.get(routeAtom(toRouteId("r1")))).toEqual(
      genRoute("r1", [nodes.get("n1")!, nodes.get("n2")!]),
    )
  })

  test("nodeが変化したら、そのnodeを含むrouteのみに通知される", () => {
    const subscribers = new Map([
      ["r1", vi.fn()],
      ["r2", vi.fn()],
    ])
    store.subscribe(routeAtom(toRouteId("r1")), subscribers.get("r1")!)
    store.subscribe(routeAtom(toRouteId("r2")), subscribers.get("r2")!)

    // n2を変化させる
    store.update(primitiveNodeAtom(toNodeId("n2")), () => ({
      update: genPrimitiveNode("n1", {}),
    }))

    // expect
    expect(subscribers.get("r1")!).toHaveBeenCalledOnce()
    expect(subscribers.get("r2")!).not.toHaveBeenCalled()
  })
})
