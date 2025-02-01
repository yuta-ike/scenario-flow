import { atom } from "jotai"

import type { PrimitiveAtom } from "jotai"
import { AtomNotFoundError } from "./error"

type SubscriptionType = "CREATED" | "UPDATED" | "DELETED"

type SubscriptionParams<Param extends { id: string | number }> = {
  id: Param["id"]
  value: Param
  prevValue: Param | null
  atom: PrimitiveAtom<Param>
}

export const atomWithIdCache = <Param extends { id: string | number }, Cache>(
  cacheSet?: (params: {
    prevValue: Param
    newValue: Param
    cache: Map<Param["id"], Cache>
  }) => Cache,
) => {
  type Id = Param["id"]

  const map = new Map<Id, PrimitiveAtom<Param>>()
  const subscriptionMap = new Map<
    SubscriptionType,
    Set<(params: SubscriptionParams<Param>) => void>
  >()

  const cacheAtom = cacheSet == null ? null : atom(new Map<Id, Cache>())

  const execSubscriptions = (
    type: SubscriptionType,
    params: SubscriptionParams<Param>,
  ) => {
    const set = subscriptionMap.get(type) ?? []
    for (const callback of set) {
      callback(params)
    }
  }

  const createAtom = (id: Id, initValue?: Param) => {
    const storedAtom = map.get(id)
    if (storedAtom != null) {
      return storedAtom
    }

    if (initValue == null) {
      throw new AtomNotFoundError(`Atom is not initialized. (id = ${id})`)
    }

    const privateAtom = atom(initValue)
    const wrapperAtom = atom<
      Param,
      [update: Param | ((param: Param) => Param)],
      void
    >(
      (get) => get(privateAtom),
      (get, set, update) => {
        const prevValue = get(privateAtom)
        const newValue =
          typeof update === "function" ? update(get(privateAtom)) : update

        // Atomの更新
        set(privateAtom, newValue)

        // キャッシュ
        if (cacheAtom != null) {
          const cache = new Map(get(cacheAtom))
          const newCacheValue = cacheSet!({ prevValue, newValue, cache })
          cache.set(id, newCacheValue)
          set(cacheAtom, cache)
        }
        // イベント呼び出し
        execSubscriptions("UPDATED", {
          id,
          value: newValue,
          prevValue,
          atom: privateAtom,
        })
      },
    )

    map.set(id, wrapperAtom)

    execSubscriptions("CREATED", {
      id,
      value: initValue,
      prevValue: null,
      atom: privateAtom,
    })

    return wrapperAtom
  }

  createAtom.remove = (id: Id) => {
    map.delete(id)
  }

  createAtom.clearAll = () => {
    map.clear()
  }

  createAtom.subscribe = (
    type: SubscriptionType,
    callback: (params: SubscriptionParams<Param>) => void,
  ) => {
    const set = subscriptionMap.get(type) ?? new Set()
    set.add(callback)
    subscriptionMap.set(type, set)
  }

  return createAtom
}
