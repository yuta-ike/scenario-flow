import { atom } from "jotai"

import type {
  LocalVariable,
  LocalVariableId,
} from "../entity/variable/variable"

import { atomSet } from "@/lib/jotai/atomSet"
import { atomWithId } from "@/lib/jotai/atomWithId"

export const variableIdsAtom = atomSet<LocalVariableId>([])
variableIdsAtom.debugLabel = "variableIdsAtom"

export const variableAtom = atomWithId<LocalVariable>("variableAtom")

export const variablesAtom = atom((get) => {
  const ids = get(variableIdsAtom).values()
  return new Set(ids.map((id) => get(variableAtom(id))))
})
variablesAtom.debugLabel = "variablesAtom"
