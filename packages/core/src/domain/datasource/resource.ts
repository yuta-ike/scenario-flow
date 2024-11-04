import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import {
  retrieveAllActionFromOpenApiResource,
  retrieveAllResourceActionLocalIdentifier,
} from "../openapi/resolveResources"
import {
  buildActionSourceIdentifier,
  type ResourceActionIdentifier,
} from "../entity/action/identifier"
import { display, eq } from "../entity/resource/identifier"
import { identifierToActionId } from "../entity/action/action.util"
import {
  buildResolvedAction,
  type ResolvedAction,
} from "../entity/action/action"

import type { Atom, SetStateAction } from "jotai"
import type { Resource, ResourceId } from "../entity/resource/resource"

import { atomWithId } from "@/lib/jotai/atomWithId"
import { atomSet } from "@/lib/jotai/atomSet"

// cache
// どのactionIdがどのresourceを参照しているかを保持する
// const resourceIdActionIdCache = atom(new Map<ActionId, ResourceId>())
// resourceIdActionIdCache.debugLabel = "resourceIdActionIdCache"
// const updateCache = (
//   get: Getter,
//   set: Setter,
//   newResourceIds: Set<ResourceId>,
//   prevResourceIds: Set<ResourceId>,
// ) => {
//   // 追加されたものと削除されたものを取得
//   const addedValues = newResourceIds.difference(prevResourceIds)
//   const deletedValues = prevResourceIds.difference(newResourceIds)
//   addedValues.forEach((resourceId) => {
//     const resource = get(resourceAtom(resourceId))
//     const actions = retrieveAllActionFromopen_apiResource(resource)
//     actions.forEach((action) => {
//       get(resourceIdActionIdCache).set(
//         resourceActionToActionId(action.id, action.resourceId),
//         resourceId,
//       )
//     })
//   })
//   deletedValues.forEach((resourceId) => {
//     set(
//       resourceIdActionIdCache,
//       (prev) => new Map(prev.entries().filter(([_, v]) => v !== resourceId)),
//     )
//   })
// }

// atom
const _resourceIdsAtom = atomSet<ResourceId>([])
_resourceIdsAtom.debugLabel = "resourceIdsAtom/core"

export const resourceIdsAtom = atom(
  (get) => get(_resourceIdsAtom),
  (_, set, update: SetStateAction<Set<ResourceId>>) => {
    set(_resourceIdsAtom, (prevValue) => {
      return typeof update === "function" ? update(prevValue) : update
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

export const resourceActionAtom = atomFamily<
  ResourceActionIdentifier,
  Atom<ResolvedAction>
>((actionIdentifier: ResourceActionIdentifier) => {
  const newAtom = atom((get) => {
    const resource = get(resourceAtom(actionIdentifier.resourceId))
    const actions = retrieveAllActionFromOpenApiResource(resource)
    const res = actions.find(({ identifier: _identifier }) =>
      eq(actionIdentifier.identifier, _identifier),
    )
    const id = identifierToActionId(
      buildActionSourceIdentifier({
        resourceType: "resource",
        resourceIdentifier: actionIdentifier,
      }),
    )
    if (res == null) {
      return buildResolvedAction(id, {
        type: "unknown",
        name: "Unknown",
        description: "",
        resourceType: "resource",
        resourceIdentifier: actionIdentifier,
        schema: {
          base: {},
          examples: [],
        },
      })
    }

    const { identifier: _, ...parameterSchema } = res
    return buildResolvedAction(id, {
      type: "rest_call",
      name:
        parameterSchema.jsonSchema?.operationId ??
        `${parameterSchema.base.method!} ${parameterSchema.base.path!}`,
      description: parameterSchema.jsonSchema?.description ?? "",
      schema: parameterSchema,
      resourceType: "resource",
      resourceIdentifier: actionIdentifier,
    })
  })
  newAtom.debugLabel = `resourceActionAtom(${display(actionIdentifier.identifier)})`
  return newAtom
})

// selector get all resource action
export const resourceActionIdentifiersAtom = atom((get) => {
  const resources = get(resourcesAtom)
  const actionIdentifiers = resources.flatMap((resource) =>
    retrieveAllResourceActionLocalIdentifier(resource).map((localIdentifier) =>
      buildActionSourceIdentifier({
        resourceType: "resource",
        resourceIdentifier: {
          resourceId: resource.id,
          identifier: localIdentifier,
        },
      }),
    ),
  )
  return actionIdentifiers
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
      return retrieveAllResourceActionLocalIdentifier(resource)
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
