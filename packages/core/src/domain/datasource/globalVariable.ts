import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { toPatternId } from "../entity/globalVariable/globalVariable.util"
import {
  type PatternId,
  type Pattern,
  type GlobalVariableId,
  type GlobalVariable,
  type GlobalVariableBindId,
  type GlobalVariableBind,
  buildPattern,
} from "../entity/globalVariable/globalVariable"

import type { TypedValue } from "../entity/value/dataType"

import { atomWithId } from "@/lib/jotai/atomWithId"
import { atomSet } from "@/lib/jotai/atomSet"

export const DEFAULT_PATTERN_ID = toPatternId("DEFAULT")

// atoms
export const patternIdsAtom = atomSet<PatternId>([DEFAULT_PATTERN_ID])
patternIdsAtom.debugLabel = "patternIdsAtom"
export const patternAtom = atomWithId<Pattern>("patternAtom")
patternAtom(
  DEFAULT_PATTERN_ID,
  buildPattern(DEFAULT_PATTERN_ID, {
    name: "デフォルト",
    description: "",
  }),
)

export const patternsAtom = atom((get) =>
  get(patternIdsAtom)
    .values()
    .map((id) => get(patternAtom(id)))
    .toArray(),
)
patternsAtom.debugLabel = "patternsAtom"

export const globalVariableIdsAtom = atomSet<GlobalVariableId>([
  // toGlobalVariableId("001"),
])
globalVariableIdsAtom.debugLabel = "globalVariableIdsAtom"
export const globalVariableAtom =
  atomWithId<GlobalVariable>("globalVariableAtom")

// globalVariableAtom(toGlobalVariableId("001"), {
//   id: toGlobalVariableId("001"),
//   description: "test",
//   name: "test",
//   schema: "any",
// })

export const globalVariableValueIdsAtom = atomSet<GlobalVariableBindId>([
  // toGlobalVariableValueId(`001-${DEFAULT_PATTERN_ID}`),
])
globalVariableValueIdsAtom.debugLabel = "globalVariableValueIdsAtom"
export const globalVariableValueAtom = atomWithId<GlobalVariableBind>(
  "globalVariableValueAtom",
)
// globalVariableValueAtom(toGlobalVariableValueId(`001-${DEFAULT_PATTERN_ID}`), {
//   id: toGlobalVariableValueId(`001-${DEFAULT_PATTERN_ID}`),
//   patternId: DEFAULT_PATTERN_ID,
//   globalVariableId: toGlobalVariableId("001"),
//   value: {
//     type: "string",
//     value: "TEST",
//   },
// })

// selector
export const globalVariablesAtom = atom((get) =>
  get(globalVariableIdsAtom)
    .values()
    .map((id) => get(globalVariableAtom(id)))
    .toArray(),
)
globalVariablesAtom.debugLabel = "globalVariablesAtom"

export const globalVariablesByPatternIdAtom = atomFamily((id: PatternId) => {
  const newAtom = atom<(GlobalVariable & { value: TypedValue })[]>((get) => {
    const globalVariableValues = get(globalVariableValueIdsAtom)
      .values()
      .map((id) => get(globalVariableValueAtom(id)))
    return globalVariableValues
      .filter((item) => item.patternId === id)
      .map((item) => {
        const globalVariable = get(globalVariableAtom(item.globalVariableId))
        return {
          ...globalVariable,
          value: item.value,
        }
      })
      .toArray()
  })
  newAtom.debugLabel = `globalVariablesByPatternIdAtom(${id})`
  return newAtom
})

export const globalVariableMatrixAtom = atom((get) => {
  const globalVariableValues = get(globalVariableValueIdsAtom)
    .values()
    .map((id) => get(globalVariableValueAtom(id)))

  const res = Object.entries(
    Object.groupBy(globalVariableValues, (item) => item.patternId),
  ).map(([patternId, values]) => {
    const pattern = get(patternAtom(patternId as PatternId))

    const variables = Object.entries(
      Object.groupBy(values ?? [], (item) => item.globalVariableId),
    ).map(([globalVariableId, value]) => {
      if (value == null) {
        throw new Error("value is null")
      }
      const globalVariableValue = value[0]
      if (globalVariableValue == null) {
        throw new Error("globalVariableValue is null")
      }

      const globalVariable = get(
        globalVariableAtom(globalVariableId as GlobalVariableId),
      )

      return {
        ...globalVariable,
        value: globalVariableValue.value,
      }
    })

    return {
      ...pattern,
      variables,
    }
  })

  return res
})
globalVariableMatrixAtom.debugLabel = "globalVariableMatrixAtom"
