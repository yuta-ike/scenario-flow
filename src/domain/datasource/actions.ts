import { atom, type Atom } from "jotai"
import { atomFamily } from "jotai/utils"

import {
  userDefinedActionAtom,
  userDefinedTypeActionIdsAtom,
} from "../datasource/userDefinedAction"
import { resolveOpenApiResource } from "../openapi/resolveResources"
import { toUserDefinedActionId } from "../entity/userDefinedAction/userDefinedAction.util"
import {
  resourceActionToActionId,
  toActionId,
} from "../entity/action/action.util"

import {
  ActionNotFoundError,
  ResourceActionNotFoundError,
} from "./action.error"
import {
  resourceActionAtom,
  resourceActionIdsAtom,
  resourceAtom,
} from "./resource"

import type { Action, ActionId, ResolvedAction } from "../entity/action/action"

import { tryFn } from "@/utils/result"

export type ActionKey = {
  id: ActionId
  source: "resource" | "userDefined"
}

export const actionIdsAtom = atom((get) => {
  const resourceActionIds = get(resourceActionIdsAtom)
  const userDefinedActionIds = get(userDefinedTypeActionIdsAtom)
  return new Set([
    ...resourceActionIds,
    ...userDefinedActionIds.values().toArray(),
  ])
})
actionIdsAtom.debugLabel = "actionIdsAtom"

export const actionAtom = atomFamily<ActionId, Atom<Action>>(
  (actionId: ActionId) =>
    atom((get) => {
      const resourceAction = tryFn(() => get(resourceActionAtom(actionId)))
      if (resourceAction.result === "success") {
        const value = resourceAction.value
        return {
          ...value,
          resourceActionId: value.id,
          id: resourceActionToActionId(value.id, value.resourceId),
        } satisfies Action
      }

      const userDefinedAction = tryFn(() =>
        get(userDefinedActionAtom(toUserDefinedActionId(actionId))),
      )
      if (userDefinedAction.result === "success") {
        const value = userDefinedAction.value
        return {
          ...value,
          source: "userDefined",
          userDefinedActionId: toUserDefinedActionId(value.id),
          id: toActionId(value.id),
        } satisfies Action
      }

      throw new ActionNotFoundError()
    }),
)

export const resolvedActionAtom = atomFamily<ActionId, Atom<ResolvedAction>>(
  (actionId: ActionId) => {
    const createdAtom = atom((get) => {
      const action = get(actionAtom(actionId))

      if (action.source === "userDefined") {
        const userDefinedAction = get(
          userDefinedActionAtom(action.userDefinedActionId),
        )
        return {
          ...userDefinedAction,
          ...action,
        } satisfies ResolvedAction
      } else {
        const { resourceId, identifier } = action
        const resource = get(resourceAtom(resourceId))
        const res = resolveOpenApiResource(resource, identifier)
        if (res == null) {
          throw new ResourceActionNotFoundError()
        }
        return {
          name: res.meta.name,
          description: res.meta.description,
          parameter: res.parameter,
          ...action,
        } satisfies ResolvedAction
      }
    })
    createdAtom.debugLabel = `resolvedActionAtom(${actionId})`
    return createdAtom
  },
)

export const actionsAtom = atom((get) =>
  get(actionIdsAtom)
    .values()
    .map((id) => get(resolvedActionAtom(id)))
    .toArray(),
)

// export const actionIdsAtom = atom((get) => {
//   return [
//     ...get(resourceActionsAtom).map((action) => ({
//       id: action.id,
//       source: "resource" as const,
//     })),
//     ...get(userDefinedActionIdsAtom)
//       .values()
//       .map((id) => ({ id: toActionId(id), source: "userDefined" as const })),
//   ] satisfies ActionKey[]
// })
// actionIdsAtom.debugLabel = "actionIdsAtom"

// export const actionsAtom = atom((get) => {
//   return [
//     ...get(resourceActionsAtom).map((action) => ({
//       ...action,
//       source: "resource" as const,
//     })),
//     ...get(userDefinedActionsAtom).map((action) => ({
//       ...action,
//       source: "resource" as const,
//     })),
//   ]
// })
// actionsAtom.debugLabel = "actionsAtom"

// export const actionAtomOrNull = atomFamily((actionId: ActionId) =>
//   atom((get) => {
//     const userDefiendActionRes = mapError(
//       tryFn(() => get(userDefinedActionAtom(actionId))),
//       () => null,
//     )

//     const resourceAction = get(resourceActionsAtom).find(
//       (action) => action.id === actionId,
//     )
//     const action = resourceAction ?? userDefiendActionRes.value

//     if (action == null) {
//       return null
//     }
//     return action
//   }),
// )

// export const actionAtom = atomFamily((actionId: ActionId) =>
//   atom((get) => {
//     const action = get(actionAtomOrNull(actionId))

//     if (action == null) {
//       throw new AtomNotFoundError("Action not found")
//     }
//     return action
//   }),
// )
