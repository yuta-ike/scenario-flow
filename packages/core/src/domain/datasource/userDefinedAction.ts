import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

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
import type { HttpMethod } from "@/utils/http"

import { atomSet } from "@/lib/jotai/atomSet"
import { atomWithId } from "@/lib/jotai/atomWithId"
import { wrapAtomFamily } from "@/lib/jotai/wrapAtomFamily"
import { updateSetOp } from "@/utils/set"

// userDefinedActionCache
const userDefinedActionCountCache = atom(new Map<UserDefinedActionId, number>())

const _userDefinedActionCacheAtom = atom(new Map<string, number>())
_userDefinedActionCacheAtom.debugLabel = "userDefinedActionCacheAtom"

export const userDefinedActionCacheAtom = atomFamily(
  ({ path, method }: { path: string; method: HttpMethod }) =>
    atom((get) => {
      const cacheKey = `${method}_${path}`
      return get(_userDefinedActionCacheAtom).get(cacheKey) ?? 0
    }),
)

const getCacheKey = (param: StripeSymbol<OmitId<UserDefinedAction>>) => {
  const base = param.schema.base
  if (!("method" in base)) {
    return null
  }
  return `${base.method!}_${base.path!}`
}

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
        // Cache
        const prevKey = getCacheKey(prev)
        const newKey = getCacheKey(param.update)
        console.log(prevKey, newKey)
        if (prevKey != null && newKey != null && prevKey !== newKey) {
          set(_userDefinedActionCacheAtom, (prevSet) => {
            const newSet = new Map(prevSet)
            if (newSet.get(prevKey) === 1) {
              // 削除
              set(
                userDefinedActionIdsAtom,
                updateSetOp((prev) => prev.filter((id) => id !== udaId)),
              )
              userDefinedActionAtom.remove(udaId)
              newSet.delete(prevKey)
            } else {
              newSet.set(prevKey, (newSet.get(prevKey) ?? 0) - 1)
            }
            newSet.set(newKey, (newSet.get(newKey) ?? 0) + 1)
            return newSet
          })
        }

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

      // cache
      set(_userDefinedActionCacheAtom, (prevMap) => {
        const key = getCacheKey(param.create)
        console.log(key)
        if (key == null) {
          return prevMap
        }
        const newMap = new Map(prevMap)
        newMap.set(key, (newMap.get(key) ?? 0) + 1)
        return newMap
      })
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
  return ids
    .map((id) => get(userDefinedActionAtom(toUserDefinedActionId(id))))
    .toArray()
})
userDefinedActionsAtom.debugLabel = "userDefinedActionsAtom"
