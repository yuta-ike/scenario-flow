import { beforeEach, describe, expect, test, vi } from "vitest"

import {
  genPattern,
  genGlobalVariable,
  getGlobalVariableBind,
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

import { updateSetOp } from "@scenario-flow/util"
import { createStore } from "@scenario-flow/util/lib"

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
          getGlobalVariableBind(gvvId, pId, gvId),
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
        namespace: "vars",
        name: "variable",
        schema: "any",
        description: "description",
        value: { type: "string", value: "TEST" },
        boundIn: "global",
      },
      {
        id: toGlobalVariableId("gv2"),
        namespace: "vars",
        name: "variable",
        schema: "any",
        description: "description",
        value: { type: "string", value: "TEST" },
        boundIn: "global",
      },
      {
        id: toGlobalVariableId("gv3"),
        namespace: "vars",
        name: "variable",
        schema: "any",
        description: "description",
        value: { type: "string", value: "TEST" },
        boundIn: "global",
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
            namespace: "vars",
            name: "variable",
            schema: "any",
            description: "description",
            value: { type: "string", value: "TEST" },
            boundIn: "global",
          },
          {
            id: "gv2",
            namespace: "vars",
            name: "variable",
            schema: "any",
            description: "description",
            value: { type: "string", value: "TEST" },
            boundIn: "global",
          },
          {
            id: "gv3",
            namespace: "vars",
            name: "variable",
            schema: "any",
            description: "description",
            value: { type: "string", value: "TEST" },
            boundIn: "global",
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
            namespace: "vars",
            name: "variable",
            schema: "any",
            description: "description",
            value: { type: "string", value: "TEST" },
            boundIn: "global",
          },
          {
            id: "gv2",
            namespace: "vars",
            name: "variable",
            schema: "any",
            description: "description",
            value: { type: "string", value: "TEST" },
            boundIn: "global",
          },
          {
            id: "gv3",
            namespace: "vars",
            name: "variable",
            schema: "any",
            description: "description",
            value: { type: "string", value: "TEST" },
            boundIn: "global",
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
            namespace: "vars",
            name: "variable",
            schema: "any",
            description: "description",
            value: { type: "string", value: "TEST" },
            boundIn: "global",
          },
          {
            id: "gv2",
            namespace: "vars",
            name: "variable",
            schema: "any",
            description: "description",
            value: { type: "string", value: "TEST" },
            boundIn: "global",
          },
          {
            id: "gv3",
            namespace: "vars",
            name: "variable",
            schema: "any",
            description: "description",
            value: { type: "string", value: "TEST" },
            boundIn: "global",
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
  })
})
