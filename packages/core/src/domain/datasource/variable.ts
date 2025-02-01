import { atom } from "jotai"

import {
  buildLocalVariable,
  type LocalVariable,
  type LocalVariableId,
} from "../entity/variable/variable"

import type { StripeSymbol } from "../entity/type"
import { OmitId, updateSetOp } from "@scenario-flow/util"
import {
  atomSet,
  atomWithId,
  wrapAtomFamily,
  CreateOrUpdate,
} from "@scenario-flow/util/lib"

export const variableIdsAtom = atomSet<LocalVariableId>([])
variableIdsAtom.debugLabel = "variableIdsAtom"

export const _variableAtom = atomWithId<LocalVariable>("variableAtom")

export const variableAtom = wrapAtomFamily(_variableAtom, {
  write: (
    id,
    get,
    set,
    param: CreateOrUpdate<
      StripeSymbol<LocalVariable>,
      StripeSymbol<OmitId<LocalVariable>>
    >,
  ) => {
    if (param.upsert === true) {
      const hasData = get(variableIdsAtom).has(
        param.create.id as LocalVariableId,
      )
      if (hasData) {
        // @ts-expect-error 型推論が効かないので
        param.create = undefined
      } else {
        // @ts-expect-error 型推論が効かないので
        param.update = undefined
      }
    }
    if (param.update != null) {
      // 更新
      set(_variableAtom(id), (prev) => {
        return {
          ...prev,
          ...param.update,
          id,
        } as LocalVariable
      })
    } else {
      // 作成
      _variableAtom(id, buildLocalVariable(id, param.create))
      set(
        variableIdsAtom,
        updateSetOp((prev) => [...prev, id]),
      )
    }
  },
})

export const variablesAtom = atom((get) => {
  const ids = get(variableIdsAtom).values()
  return new Set(ids.map((id) => get(variableAtom(id)))).values().toArray()
})
variablesAtom.debugLabel = "variablesAtom"
