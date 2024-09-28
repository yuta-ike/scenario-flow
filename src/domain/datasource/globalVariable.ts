import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { toPatternId } from "../entity/globalVariable/globalVariable.util"

import type { TypedValue } from "../entity/value/dataType"
import type {
  PatternId,
  Pattern,
  GlobalVariableId,
  GlobalVariable,
  GlobalVariableValueId,
  GlobalVariableValue,
} from "../entity/globalVariable/globalVariable"

import { atomWithId } from "@/lib/jotai/atomWithId"
import { atomSet } from "@/lib/jotai/atomSet"

export const DEFAULT_PATTERN_ID = toPatternId("DEFAULT")

// atoms
export const patternIdsAtom = atomSet<PatternId>([DEFAULT_PATTERN_ID])
patternIdsAtom.debugLabel = "patternIdsAtom"
export const patternAtom = atomWithId<Pattern>("patternAtom")
patternAtom(DEFAULT_PATTERN_ID, {
  id: DEFAULT_PATTERN_ID,
  name: "デフォルト",
  description: "",
})

export const globalVariableIdsAtom = atomSet<GlobalVariableId>([])
globalVariableIdsAtom.debugLabel = "globalVariableIdsAtom"
export const globalVariableAtom =
  atomWithId<GlobalVariable>("globalVariableAtom")

export const globalVariableValueIdsAtom = atomSet<GlobalVariableValueId>([])
globalVariableValueIdsAtom.debugLabel = "globalVariableValueIdsAtom"
export const globalVariableValueAtom = atomWithId<GlobalVariableValue>(
  "globalVariableValueAtom",
)

// selector
export const globalVariablesByPatternIdAtom = atomFamily((id: PatternId) => {
  const newAtom = atom<(GlobalVariable & { value: TypedValue })[]>((get) => {
    const globalVariableValues = get(globalVariableValueIdsAtom)
      .values()
      .map((id) => get(globalVariableValueAtom(id)))
    return Array.from(globalVariableValues)
      .filter((item) => item.patternId === id)
      .toSorted((a, b) =>
        a.globalVariableId.localeCompare(b.globalVariableId, "en"),
      )
      .map((item) => {
        const globalVariable = get(globalVariableAtom(item.globalVariableId))
        return {
          ...globalVariable,
          value: item.value,
        }
      })
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
    )
      .toSorted(([key1], [key2]) => key1.localeCompare(key2, "en"))
      .map(([globalVariableId, value]) => {
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
