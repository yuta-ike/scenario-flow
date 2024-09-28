import { atom } from "jotai"

import { toUserDefinedActionId } from "../entity/userDefinedAction/userDefinedAction.util"
import { toActionId } from "../entity/action/action.util"

import type {
  UserDefinedAction,
  UserDefinedActionId,
} from "../entity/userDefinedAction/userDefinedAction"

import { atomSet } from "@/lib/jotai/atomSet"
import { atomWithId } from "@/lib/jotai/atomWithId"

// atoms
export const userDefinedActionAtom = atomWithId<UserDefinedAction>(
  "userDefinedActionAtom",
)

export const userDefinedActionIdsAtom = atomSet<UserDefinedActionId>([])
userDefinedActionIdsAtom.debugLabel = "userDefinedActionIdsAtom"

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
