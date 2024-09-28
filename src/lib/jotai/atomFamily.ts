import { atom, type Atom } from "jotai"

/**
 * in milliseconds
 */
type CreatedAt = number
type ShouldRemove<Id extends string | number> = (
  createdAt: CreatedAt,
  id: Id,
) => boolean
type Cleanup = () => void
type Callback<Id extends string | number, AtomType> = (event: {
  type: "CREATE" | "REMOVE"
  id: Id
  atom: AtomType
}) => void

export type AtomFamily<Param, AtomType, Id extends string | number> = {
  (param: Param): AtomType
  getParams(): Iterable<Param>
  remove(param: Param): void
  setShouldRemove(shouldRemove: ShouldRemove<Id> | null): void
  /**
   * fires when a atom is created or removed
   * This API is for advanced use cases, and can change without notice.
   */
  unstable_listen(callback: Callback<Id, AtomType>): Cleanup
}

export function atomFamily<Param, Id extends string | number>() {
  type AtomType = Atom<Param>

  let shouldRemove: ShouldRemove<Id> | null = null
  const atoms = new Map<Id, [AtomType, CreatedAt]>()
  const listeners = new Set<Callback<Id, AtomType>>()

  const getAtom = (id: Id) => {
    const item = atoms.get(id)
    if (item != null) {
      const [atom, createdAt] = item

      if (shouldRemove?.(createdAt, id) === true) {
        atoms.delete(id)
        notifyListeners("REMOVE", id, atom)
        throw new Error(`Atom has already removed. (id = ${id})`)
      }

      return atom
    } else {
      throw new Error(`Atom is not initialized. (id = ${id})`)
    }
  }

  getAtom.createAtom = (id: Id, create: () => AtomType) => {
    if (atoms.has(id)) {
      throw new Error(`Atom is already initialized. (id = ${id})`)
    }
    const atom = create()
    atoms.set(id, [atom, Date.now()])
    notifyListeners("CREATE", id, atom)
    return atom
  }

  function notifyListeners(type: "CREATE" | "REMOVE", id: Id, atom: AtomType) {
    for (const listener of listeners) {
      listener({ type, id, atom })
    }
  }

  getAtom.unstable_listen = (callback: Callback<Id, AtomType>) => {
    listeners.add(callback)
    return () => {
      listeners.delete(callback)
    }
  }

  getAtom.getParams = () => atoms.keys()

  getAtom.remove = (id: Id) => {
    for (const [key, [atom]] of atoms) {
      if (key === id) {
        atoms.delete(key)
        notifyListeners("REMOVE", key, atom)
        break
      }
    }
  }

  getAtom.setShouldRemove = (fn: ShouldRemove<Id> | null) => {
    shouldRemove = fn
    if (shouldRemove == null) return
    for (const [id, [atom, createdAt]] of atoms) {
      if (shouldRemove(createdAt, id)) {
        atoms.delete(id)
        notifyListeners("REMOVE", id, atom)
      }
    }
  }
  return getAtom
}
