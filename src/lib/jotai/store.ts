import { createStore as createJotaiStore } from "jotai"

import type { Atom, WritableAtom } from "jotai"

type JotaiStore = ReturnType<typeof createJotaiStore>

export class Store {
  constructor() {
    this.#store = createJotaiStore()
  }

  #store: JotaiStore

  public get store() {
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

  public subscribe<Value>(atom: Atom<Value>, callback: () => void) {
    return this.#store.sub(atom, callback)
  }

  public clear() {
    this.#store = createJotaiStore()
  }
}

export const createStore = () => new Store()
