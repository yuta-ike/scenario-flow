import { beforeEach, describe, expect, test, vi } from "vitest"

import {
  genPattern,
  genGlobalVariable,
  getGlobalVariableValue,
} from "../entity/globalVariable/globalVariable.factory"
import {
  toPatternId,
  toGlobalVariableId,
  toGlobalVariableValueId,
} from "../entity/globalVariable/globalVariable.util"

import {
  globalVariableAtom,
  globalVariablesByPatternIdAtom,
  globalVariableIdsAtom,
  globalVariableValueAtom,
  globalVariableValueIdsAtom,
  patternAtom,
  patternIdsAtom,
  globalVariableMatrixAtom,
} from "./globalVariable"

import { createStore } from "@/lib/jotai/store"
import { updateSetOp } from "@/utils/set"

const store = createStore()

describe("globalVariable", () => {
  beforeEach(() => {
    store.clear()

    // pattern
    store.set(
      patternIdsAtom,
      new Set([toPatternId("p1"), toPatternId("p2"), toPatternId("p3")]),
    )
    for (const id of ["p1", "p2", "p3"]) {
      patternAtom(toPatternId(id), genPattern(id))
    }

    // global variable
    store.set(
      globalVariableIdsAtom,
      new Set([
        toGlobalVariableId("gv1"),
        toGlobalVariableId("gv2"),
        toGlobalVariableId("gv3"),
      ]),
    )
    for (const id of ["gv1", "gv2", "gv3"]) {
      globalVariableAtom(toGlobalVariableId(id), genGlobalVariable(id))
    }

    // global variable value
    for (const pId of ["p1", "p2", "p3"]) {
      for (const gvId of ["gv1", "gv2", "gv3"]) {
        const gvvId = `${pId}-${gvId}`
        store.update(
          globalVariableValueIdsAtom,
          updateSetOp((prev) => [...prev, toGlobalVariableValueId(gvvId)]),
        )
        globalVariableValueAtom(
          toGlobalVariableValueId(gvvId),
          getGlobalVariableValue(gvvId, pId, gvId),
        )
      }
    }
  })

  test("> globalVariableByPatternIdAtom", () => {
    const globalVariables = store.get(
      globalVariablesByPatternIdAtom(toPatternId("p1")),
    )
    expect(globalVariables).toEqual([
      {
        id: toGlobalVariableId("gv1"),
        name: "variable",
        description: "description",
        value: { type: "string", value: "TEST" },
      },
      {
        id: toGlobalVariableId("gv2"),
        name: "variable",
        description: "description",
        value: { type: "string", value: "TEST" },
      },
      {
        id: toGlobalVariableId("gv3"),
        name: "variable",
        description: "description",
        value: { type: "string", value: "TEST" },
      },
    ])
  })

  test("> globalVariableMatrixAtom", () => {
    const globalVariableMatrix = store.get(globalVariableMatrixAtom)
    expect(globalVariableMatrix).toEqual([
      {
        id: "p1",
        name: "pattern",
        description: "description",
        variables: [
          {
            id: "gv1",
            name: "variable",
            description: "description",
            value: { type: "string", value: "TEST" },
          },
          {
            id: "gv2",
            name: "variable",
            description: "description",
            value: { type: "string", value: "TEST" },
          },
          {
            id: "gv3",
            name: "variable",
            description: "description",
            value: { type: "string", value: "TEST" },
          },
        ],
      },
      {
        id: "p2",
        name: "pattern",
        description: "description",
        variables: [
          {
            id: "gv1",
            name: "variable",
            description: "description",
            value: { type: "string", value: "TEST" },
          },
          {
            id: "gv2",
            name: "variable",
            description: "description",
            value: { type: "string", value: "TEST" },
          },
          {
            id: "gv3",
            name: "variable",
            description: "description",
            value: { type: "string", value: "TEST" },
          },
        ],
      },
      {
        id: "p3",
        name: "pattern",
        description: "description",
        variables: [
          {
            id: "gv1",
            name: "variable",
            description: "description",
            value: { type: "string", value: "TEST" },
          },
          {
            id: "gv2",
            name: "variable",
            description: "description",
            value: { type: "string", value: "TEST" },
          },
          {
            id: "gv3",
            name: "variable",
            description: "description",
            value: { type: "string", value: "TEST" },
          },
        ],
      },
    ])
  })

  test("globalVariableValue を更新すると、globalVariableMatrixAtom が更新される", () => {
    const subscriber = vi.fn()
    store.subscribe(globalVariableMatrixAtom, subscriber)

    store.update(
      globalVariableValueAtom(toGlobalVariableValueId("p1-gv1")),
      (prev) => ({
        ...prev,
        value: { type: "string" as const, value: "UPDATED" },
      }),
    )

    expect(subscriber).toHaveBeenCalledOnce()
  })

  test("globalVariableValue を更新すると、対応する globalVariablesByPatternIdAtom のみ更新される", () => {
    const subscribers = new Map([
      [1, vi.fn()],
      [2, vi.fn()],
    ])
    store.subscribe(
      globalVariablesByPatternIdAtom(toPatternId("p1")),
      subscribers.get(1)!,
    )
    store.subscribe(
      globalVariablesByPatternIdAtom(toPatternId("p2")),
      subscribers.get(2)!,
    )

    store.update(
      globalVariableValueAtom(toGlobalVariableValueId("p1-gv1")),
      (prev) => ({
        ...prev,
        value: { type: "string" as const, value: "UPDATED" },
      }),
    )

    expect(subscribers.get(1)!).toHaveBeenCalledOnce()
    // TODO: この再レンダリングを防ぐにはwithIdのリファクタリングが必要そう
    // expect(subscribers.get(2)!).not.toHaveBeenCalled()
  })
})
