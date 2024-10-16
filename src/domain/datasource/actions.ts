import { atom, type Atom } from "jotai"
import { atomFamily } from "jotai/utils"

import {
  userDefinedActionAtom,
  userDefinedTypeActionIdsAtom,
} from "../datasource/userDefinedAction"
import {
  buildResolvedActionFromUserDefinedAction,
  type ResolvedAction,
} from "../entity/action/action"
import {
  buildActionSourceIdentifier,
  display,
} from "../entity/action/identifier"

import { resourceActionAtom, resourceActionIdentifiersAtom } from "./resource"

import type { ActionSourceIdentifier } from "../entity/action/identifier"

export const actionIdsAtom = atom((get) => {
  const resourceActionIds = get(resourceActionIdentifiersAtom)
  const userDefinedActionIds = get(userDefinedTypeActionIdsAtom).map((udaId) =>
    buildActionSourceIdentifier({
      resourceType: "user_defined",
      resourceIdentifier: { userDefinedActionId: udaId },
    }),
  )
  return new Set([...resourceActionIds, ...userDefinedActionIds])
})
actionIdsAtom.debugLabel = "actionIdsAtom"

export const resolvedActionAtom = atomFamily<
  ActionSourceIdentifier,
  Atom<ResolvedAction>
>((actionIdentifier: ActionSourceIdentifier) => {
  const createdAtom = atom((get) => {
    if (actionIdentifier.resourceType === "resource") {
      return get(resourceActionAtom(actionIdentifier.resourceIdentifier))
    } else {
      const userDefinedAction = get(
        userDefinedActionAtom(
          actionIdentifier.resourceIdentifier.userDefinedActionId,
        ),
      )
      return buildResolvedActionFromUserDefinedAction(userDefinedAction)
    }
  })
  createdAtom.debugLabel = `resolvedActionAtom(${display(actionIdentifier)})`
  return createdAtom
})

export const actionsAtom = atom((get) =>
  get(actionIdsAtom)
    .values()
    .map((identifier) => get(resolvedActionAtom(identifier)))
    .toArray(),
)
