import { atomFamily } from "jotai/utils"
import { atom, type WritableAtom } from "jotai"

import type { AtomFamily } from "jotai/vanilla/utils/atomFamily"
import type { Getter, Setter } from "jotai"

type WrapOption<FamilyId, InputParam extends unknown[], AtomType> = {
  write: (id: FamilyId, get: Getter, set: Setter, ...params: InputParam) => void
  onRemove?: (
    get: Getter,
    set: Setter,
    params: { id: FamilyId; value: AtomType },
  ) => void
}

export const wrapAtomFamily = <
  FamilyId,
  Param extends unknown[],
  AtomType,
  InputParam extends unknown[] = Param,
>(
  innerAtomFamily: AtomFamily<FamilyId, WritableAtom<AtomType, Param, void>> & {
    clearAll: () => void
  },
  { write, onRemove }: WrapOption<FamilyId, InputParam, AtomType>,
): AtomFamily<FamilyId, WritableAtom<AtomType, InputParam, void>> & {
  clearAll: () => void
  removeAtom: WritableAtom<null, [id: FamilyId], void>
} => {
  const wrappedAtom: AtomFamily<
    FamilyId,
    WritableAtom<AtomType, InputParam, void>
  > = atomFamily((id: FamilyId) =>
    atom(
      (get) => get(innerAtomFamily(id)),
      (get, set, ...params: InputParam) => write(id, get, set, ...params),
    ),
  )

  // @ts-expect-error
  wrappedAtom.clearAll = () => innerAtomFamily.clearAll()

  // @ts-expect-error
  wrappedAtom.removeAtom = atom(null, (get, set, id: FamilyId) => {
    const removedAtom = get(wrappedAtom(id))
    onRemove?.(get, set, { id, value: removedAtom })
    innerAtomFamily.remove(id)
  })

  wrappedAtom.getParams = () => innerAtomFamily.getParams()

  wrappedAtom.setShouldRemove = (
    ...params: Parameters<typeof innerAtomFamily.setShouldRemove>
  ) => innerAtomFamily.setShouldRemove(...params)

  return wrappedAtom as AtomFamily<
    FamilyId,
    WritableAtom<AtomType, InputParam, void>
  > & {
    clearAll: () => void
    removeAtom: WritableAtom<null, [id: FamilyId], void>
  }
}
