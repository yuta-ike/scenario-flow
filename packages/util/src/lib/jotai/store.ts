import { createStore as createJotaiStore } from "jotai"

import type { Atom, WritableAtom } from "jotai"

export type JotaiStore = ReturnType<typeof createJotaiStore>

type Listener = (gen: number) => void

export class Store {
  static gen = 0;
  constructor() {
    this.#store = createJotaiStore()
    this.#gen = 0
    this.listeners = new Set<Listener>()
  }

  #store: JotaiStore
  #gen: number
  listeners: Set<Listener>

  public get gen() {
    return this.#gen
  }

  public get store(): JotaiStore {
    return this.#store
  }

  public set<Value, Arg, Result>(
    atom: WritableAtom<Value, [Arg], Result>,
    arg: Arg,
  ) {
    return this.#store.set(atom, arg)
  }

  public get<Value>(atom: Atom<Value>) {
    return this.#store.get(atom)
  }

  public update<Value, Arg, Result>(
    atom: WritableAtom<Value, [Arg], Result>,
    updater: (value: Value) => Arg,
  ) {
    const newValue = updater(this.#store.get(atom))
    this.#store.set(atom, newValue)
  }

  public remove<Id>(
    atom: {
      removeAtom: WritableAtom<null, [id: Id], void>
    },
    id: Id,
  ) {
    this.#store.set(atom.removeAtom, id)
  }

  public subscribe<Value>(atom: Atom<Value>, callback: () => void) {
    return this.#store.sub(atom, callback)
  }

  public clear() {
    this.#gen = ++Store.gen
    this.#store = createJotaiStore()
    this.dispatch()
  }

  public subscribeStore(callback: Listener) {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }

  private dispatch() {
    for (const listener of this.listeners) {
      listener(this.gen)
    }
  }
}

export const createStore = () => new Store()
