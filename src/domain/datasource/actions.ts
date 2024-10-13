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

import { ResourceActionNotFoundError } from "./action.error"
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

// TODO: actionIdをなくして、UdaID or ResourceId+Indentifierを使うようにする。
// ActionNotFoundとなった時のエラー量が増える & resourceIdActionIdCacheが不要になる
const actionAtom = atomFamily<ActionId, Atom<Action>>((actionId: ActionId) =>
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

    return {
      id: actionId,
      source: "missing",
      type: "unknown",
    } satisfies Action
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
      } else if (action.source === "resoure") {
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
      } else {
        return {
          name: "Unknown",
          description: "Unknown",
          parameter: null,
          ...action,
        }
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
