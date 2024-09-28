import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { retrieveAllActionFromOpenApiResource } from "../openapi/resolveResources"
import { resourceActionToActionId } from "../entity/action/action.util"

import { ResourceActionNotFoundError } from "./action.error"

import type { ActionId } from "../entity/action/action"
import type { Getter, SetStateAction, Setter } from "jotai"
import type { Resource, ResourceId } from "../entity/resource/resource"

import { atomWithId } from "@/lib/jotai/atomWithId"
import { atomSet } from "@/lib/jotai/atomSet"

// cache
// どのactionIdがどのresourceを参照しているかを保持する
const resourceIdActionIdCache = atom(new Map<ActionId, ResourceId>())
resourceIdActionIdCache.debugLabel = "resourceIdActionIdCache"
const updateCache = (
  get: Getter,
  set: Setter,
  newResourceIds: Set<ResourceId>,
  prevResourceIds: Set<ResourceId>,
) => {
  // 追加されたものと削除されたものを取得
  const addedValues = newResourceIds.difference(prevResourceIds)
  const deletedValues = prevResourceIds.difference(newResourceIds)
  addedValues.forEach((resourceId) => {
    const resource = get(resourceAtom(resourceId))
    const actions = retrieveAllActionFromOpenApiResource(resource)
    actions.forEach((action) => {
      get(resourceIdActionIdCache).set(
        resourceActionToActionId(action.id, action.resourceId),
        resourceId,
      )
    })
  })
  deletedValues.forEach((resourceId) => {
    set(
      resourceIdActionIdCache,
      (prev) => new Map(prev.entries().filter(([_, v]) => v !== resourceId)),
    )
  })
}

// TODO: 今はJSONをcontentにぶち込んでいるが、LocationTypeごとにFetcherを作成し、読み込み → パース → キャッシュ保持 を行うようにする

// atom
const _resourceIdsAtom = atomSet<ResourceId>([])
_resourceIdsAtom.debugLabel = "resourceIdsAtom/core"

export const resourceIdsAtom = atom(
  (get) => get(_resourceIdsAtom),
  (get, set, update: SetStateAction<Set<ResourceId>>) => {
    set(_resourceIdsAtom, (prevValue) => {
      const newValues =
        typeof update === "function" ? update(prevValue) : update

      // キャッシュの更新
      updateCache(get, set, newValues, prevValue)

      return newValues
    })
  },
)
_resourceIdsAtom.debugLabel = "resourceIdsAtom/wrapper"

export const resourceAtom = atomWithId<Resource>("resource")

export const resourcesAtom = atom((get) => {
  const ids = get(resourceIdsAtom).values()
  const res = ids.map((id) => get(resourceAtom(id))).toArray()
  return res
})
resourcesAtom.debugLabel = "resourcesAtom"

export const resourceActionAtom = atomFamily((actionId: ActionId) => {
  const newAtom = atom((get) => {
    const resourceId = get(resourceIdActionIdCache).get(actionId)
    if (resourceId == null) {
      throw new ResourceActionNotFoundError()
    }
    const resource = get(resourceAtom(resourceId))
    // TODO: この結果もキャッシュしておいた方が無難
    const actions = retrieveAllActionFromOpenApiResource(resource)
    const action = actions.find(
      (action) =>
        resourceActionToActionId(action.id, action.resourceId) === actionId,
    )
    if (action == null) {
      throw new Error("action not found")
    }
    return action
  })
  newAtom.debugLabel = `resourceActionAtom(${actionId})`
  return newAtom
})

// selector get all resource action
export const resourceActionIdsAtom = atom((get) => {
  const resources = get(resourcesAtom)
  const actionIds = resources.flatMap((resource) =>
    retrieveAllActionFromOpenApiResource(resource).map((resourceAction) =>
      resourceActionToActionId(resourceAction.id, resourceAction.resourceId),
    ),
  )
  return actionIds
})

export const resourceActionsAtom = atom((get) => {
  const resources = get(resourcesAtom)
  const actions = resources.flatMap((resource) =>
    retrieveAllActionFromOpenApiResource(resource),
  )
  return actions
})
resourceActionsAtom.debugLabel = "resourceActionsAtom"

// selector get resource action by resourceId
export const resourceActionIdsByResourceIdAtom = atomFamily(
  (resourceId: ResourceId) => {
    const newAtom = atom((get) => {
      const resource = get(resourceAtom(resourceId))
      return retrieveAllActionFromOpenApiResource(resource).map(({ id }) => id)
    })
    newAtom.debugLabel = `resourceActionIdsByResourceIdAtom(${resourceId})`
    return newAtom
  },
)

export const resourceActionsByResourceIdAtom = atomFamily(
  (resourceId: ResourceId) => {
    const newAtom = atom((get) => {
      const resource = get(resourceAtom(resourceId))
      return retrieveAllActionFromOpenApiResource(resource)
    })
    newAtom.debugLabel = `resourceActionsByResourceIdAtom(${resourceId})`
    return newAtom
  },
)
