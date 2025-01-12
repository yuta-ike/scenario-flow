import { atom } from "jotai"

import type { PrimitiveAtom } from "jotai"

export class AtomNotFoundError extends Error {}

type SubscriptionType = "CREATED" | "UPDATED" | "DELETED"

type SubscriptionStates<State extends { id: string | number }> = {
  id: State["id"]
  value: State
  prevValue: State | null
  atom: PrimitiveAtom<State>
}

export const atomWithId = <State extends { id: string | number }>(
  debug?: string,
  onRemove?: (params: { id: State["id"]; value: State }) => void,
) => {
  type Id = State["id"]

  const map = new Map<Id, PrimitiveAtom<State>>()
  const subscriptionMap = new Map<
    SubscriptionType,
    Set<(params: SubscriptionStates<State>) => void>
  >()

  const execSubscriptions = (
    type: SubscriptionType,
    params: SubscriptionStates<State>,
  ) => {
    const set = subscriptionMap.get(type) ?? []
    for (const callback of set) {
      callback(params)
    }
  }

  const createAtom = (id: Id, initValue?: State) => {
    const storedAtom = map.get(id)
    if (storedAtom != null) {
      return storedAtom
    }

    if (initValue == null) {
      throw new AtomNotFoundError(
        `[${debug}] Atom is not initialized. (id = ${id})`,
      )
    }

    const privateAtom = atom(initValue)
    privateAtom.debugLabel = `${debug} / ${id} / privateAtom`

    const wrapperAtom = atom<
      State,
      [update: State | ((param: State) => State)],
      void
    >(
      (get) => get(privateAtom),
      (get, set, update) => {
        const prevValue = get(privateAtom)
        const newValue =
          typeof update === "function" ? update(get(privateAtom)) : update

        // Atomの更新
        set(privateAtom, newValue)

        // イベント呼び出し
        execSubscriptions("UPDATED", {
          id,
          value: newValue,
          prevValue,
          atom: privateAtom,
        })
      },
    )
    wrapperAtom.debugLabel = `${debug} / ${id} / wrapperAtom`

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

  createAtom.removeAtom = atom(null, (get, _, id: Id) => {
    const removedAtom = get(createAtom(id))
    onRemove?.({ id, value: removedAtom })
    map.delete(id)
  })

  createAtom.clearAll = () => {
    map.clear()
  }

  createAtom.getParams = () => map.keys()

  createAtom.setShouldRemove = () => {
    throw new Error("Not implemented")
  }
  createAtom.unstable_listen = () => {
    throw new Error("Not implemented")
  }

  createAtom.subscribe = (
    type: SubscriptionType,
    callback: (params: SubscriptionStates<State>) => void,
  ) => {
    const set = subscriptionMap.get(type) ?? new Set()
    set.add(callback)
    subscriptionMap.set(type, set)
  }

  return createAtom
}
