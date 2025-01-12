import { beforeEach, describe, expect, test, vi } from "vitest"

import { genResource } from "../entity/resource/resource.factory"
import { toResourceId } from "../entity/resource/resource.util"

import { resourceAtom, resourceIdsAtom } from "./resource"

import { createStore } from "@/lib/jotai/store"
import { updateSetOp } from "@/utils/set"
import { AtomNotFoundError } from "@/lib/jotai/atomWithId"

const store = createStore()

const beforeEachProcess = () => {
  store.clear()

  for (const id of ["r1", "r2"]) {
    store.set(resourceAtom(toResourceId(id), genResource(id)), genResource(id))
  }
  store.set(resourceIdsAtom, new Set([toResourceId("r1"), toResourceId("r2")]))
}

describe("resource > resource", () => {
  beforeEach(beforeEachProcess)

  test("resourceAtom / resourceIdsAtom が正しく取得できる", () => {
    expect(store.get(resourceAtom(toResourceId("r1")))).toEqual(
      genResource("r1"),
    )
  })

  test("resourceAtomの変更で、変更が通知される", () => {
    const subscriber = vi.fn()
    store.subscribe(resourceAtom(toResourceId("r1")), subscriber)

    // action
    store.update(resourceAtom(toResourceId("r1")), () =>
      genResource("r1", {
        location: {
          locationType: "local_file",
          path: "/path/to/new/resource",
        },
      }),
    )

    expect(subscriber).toHaveBeenCalled()
  })

  test("resourceAtomの変更では、resourceIdsAtomに変更が通知されない", () => {
    const subscriber = vi.fn()
    store.subscribe(resourceIdsAtom, subscriber)

    // action
    store.update(resourceAtom(toResourceId("r1")), () =>
      genResource("r1", {
        location: {
          locationType: "local_file",
          path: "/path/to/new/resource",
        },
      }),
    )

    expect(subscriber).not.toHaveBeenCalled()
  })

  test("resourceIdsAtomの変更では、resourceAtomに変更が通知されない", () => {
    const subscriber = vi.fn()
    store.subscribe(resourceAtom(toResourceId("r1")), subscriber)

    // action
    resourceAtom(toResourceId("r5"), genResource("r5"))
    store.update(
      resourceIdsAtom,
      updateSetOp((ids) => [...ids, toResourceId("r5")]),
    )

    expect(subscriber).not.toHaveBeenCalled()
  })

  test("resourceAtomを正しく削除できる / 削除されたノードにアクセスするとエラーになる", () => {
    // action
    store.update(
      resourceIdsAtom,
      updateSetOp((ids) => ids.filter((id) => id !== "r1")),
    )
    store.set(resourceAtom.removeAtom, toResourceId("r1"))

    // expect
    expect(store.get(resourceIdsAtom)).toEqual(new Set([toResourceId("r2")]))

    expect(() => store.get(resourceAtom(toResourceId("r1")))).toThrow(
      AtomNotFoundError,
    )
  })
})
