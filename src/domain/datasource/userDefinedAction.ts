import { atom } from "jotai"

import { toUserDefinedActionId } from "../entity/userDefinedAction/userDefinedAction.util"
import { toActionId } from "../entity/action/action.util"
import {
  buildUserDefinedAction,
  type UserDefinedAction,
  type UserDefinedActionId,
} from "../entity/userDefinedAction/userDefinedAction"

import type { StripeSymbol } from "../entity/type"
import type { CreateOrUpdate } from "@/lib/jotai/util"
import type { OmitId } from "@/utils/idType"

import { atomSet } from "@/lib/jotai/atomSet"
import { atomWithId } from "@/lib/jotai/atomWithId"
import { wrapAtomFamily } from "@/lib/jotai/wrapAtomFamily"
import { updateSetOp } from "@/utils/set"

// atoms
export const userDefinedActionIdsAtom = atomSet<UserDefinedActionId>([])
userDefinedActionIdsAtom.debugLabel = "userDefinedActionIdsAtom"

export const _userDefinedActionAtom = atomWithId<UserDefinedAction>(
  "userDefinedActionAtom",
)

export const userDefinedActionAtom = wrapAtomFamily(_userDefinedActionAtom, {
  write: (
    udaId,
    _,
    set,
    param: CreateOrUpdate<
      StripeSymbol<UserDefinedAction>,
      StripeSymbol<OmitId<UserDefinedAction>>
    >,
  ) => {
    if (param.update != null) {
      // 更新
      set(_userDefinedActionAtom(udaId), (prev) => {
        return {
          ...prev,
          ...param.update,
        } as UserDefinedAction
      })
    } else {
      // 作成
      _userDefinedActionAtom(udaId, buildUserDefinedAction(udaId, param.create))
      set(
        userDefinedActionIdsAtom,
        updateSetOp((prev) => [...prev, udaId]),
      )
    }
  },
})

export const userDefinedTypeActionIdsAtom = atom((get) =>
  get(userDefinedActionIdsAtom)
    .values()
    .map((id) => toActionId(id))
    .toArray(),
)

export const userDefinedActionsAtom = atom((get) => {
  const ids = get(userDefinedActionIdsAtom).values()
  return ids.map((id) => get(userDefinedActionAtom(toUserDefinedActionId(id))))
})
userDefinedActionsAtom.debugLabel = "userDefinedActionsAtom"
