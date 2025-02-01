import { beforeEach, describe, expect, test, vi } from "vitest"

import { genLocalVariable } from "../entity/variable/variable.factory"
import { toLocalVariableId } from "../entity/variable/variable.util"

import { variableAtom, variableIdsAtom, variablesAtom } from "./variable"

import { updateSetOp } from "@scenario-flow/util"
import { AtomNotFoundError, createStore } from "@scenario-flow/util/lib"

const store = createStore()

describe("variable > primitiveVariable", () => {
  beforeEach(() => {
    store.clear()

    for (const id of ["v1", "v2", "v3"]) {
      store.set(variableAtom(toLocalVariableId(id)), {
        create: genLocalVariable(toLocalVariableId(id)),
      })
    }
  })

  test("variableAtom / variableAtomsが正しく取得できる", () => {
    expect(store.get(variableAtom(toLocalVariableId("v1")))).toEqual(
      genLocalVariable(toLocalVariableId("v1")),
    )

    expect(store.get(variablesAtom)).toEqual(
      new Set([
        genLocalVariable(toLocalVariableId("v1")),
        genLocalVariable(toLocalVariableId("v2")),
        genLocalVariable(toLocalVariableId("v3")),
      ]),
    )
  })

  test("variableAtomの変更で、変更が通知される", () => {
    const subscriber = vi.fn()
    store.subscribe(variableAtom(toLocalVariableId("v1")), subscriber)

    // action
    store.set(variableAtom(toLocalVariableId("v1")), {
      update: genLocalVariable(toLocalVariableId("v1"), {
        description: "new",
      }),
    })

    expect(subscriber).toHaveBeenCalled()
  })

  test("variableAtomの変更では、variableIdsAtomに変更が通知されない", () => {
    const subscriber = vi.fn()
    store.subscribe(variableIdsAtom, subscriber)

    // action
    store.set(variableAtom(toLocalVariableId("v1")), {
      update: genLocalVariable(toLocalVariableId("v1"), {
        description: "new",
      }),
    })

    expect(subscriber).not.toHaveBeenCalled()
  })

  test("variableIdsAtomの変更では、variableAtomに変更が通知されない", () => {
    const subscriber = vi.fn()
    store.subscribe(variableAtom(toLocalVariableId("v1")), subscriber)

    // action
    store.set(variableAtom(toLocalVariableId("4")), {
      create: genLocalVariable(toLocalVariableId("4")),
    })

    store.set(variableAtom(toLocalVariableId("4")), {
      update: genLocalVariable(toLocalVariableId("4"), {
        description: "new",
      }),
    })

    expect(subscriber).not.toHaveBeenCalled()
  })

  test("variableAtomを正しく削除できる / 削除されたノードにアクセスするとエラーになる", () => {
    // action
    store.update(
      variableIdsAtom,
      updateSetOp((ids) => ids.filter((id) => id !== toLocalVariableId("v1"))),
    )
    store.remove(variableAtom, toLocalVariableId("v1"))

    // expect
    expect(store.get(variableIdsAtom)).toEqual(
      new Set([toLocalVariableId("v2"), toLocalVariableId("v3")]),
    )

    expect(() => store.get(variableAtom(toLocalVariableId("v1")))).toThrow(
      AtomNotFoundError,
    )
  })
})
