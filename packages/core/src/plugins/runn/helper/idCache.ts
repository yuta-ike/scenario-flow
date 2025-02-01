import { genId } from "@scenario-flow/util"

export class IdCache {
  #cache = new Map<string, string>()

  public getOrCreate = (key: string) => {
    const cached = this.#cache.get(key)
    if (cached != null) {
      return cached
    }
    const newId = genId()
    this.#cache.set(key, newId)
    return newId
  }
}
