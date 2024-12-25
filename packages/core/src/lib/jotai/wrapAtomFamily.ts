import { atomFamily } from "jotai/utils"
import { atom, type WritableAtom } from "jotai"

import type { AtomFamily } from "jotai/vanilla/utils/atomFamily"
import type { Getter, Setter } from "jotai"

type WrapOption<FamilyId, InputParam extends unknown[]> = {
  write: (id: FamilyId, get: Getter, set: Setter, ...params: InputParam) => void
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
  { write }: WrapOption<FamilyId, InputParam>,
  onRemoved?: (id: FamilyId) => void,
): AtomFamily<FamilyId, WritableAtom<AtomType, InputParam, void>> & {
  clearAll: () => void
} => {
  const wrappedAtom = atomFamily((id: FamilyId) =>
    atom(
      (get) => get(innerAtomFamily(id)),
      (get, set, ...params: InputParam) => write(id, get, set, ...params),
    ),
  )

  // @ts-expect-error
  wrappedAtom.clearAll = () => innerAtomFamily.clearAll()

  wrappedAtom.remove = (id: FamilyId) => {
    innerAtomFamily.remove(id)
    onRemoved?.(id)
  }

  wrappedAtom.getParams = () => innerAtomFamily.getParams()

  wrappedAtom.setShouldRemove = (
    ...params: Parameters<typeof innerAtomFamily.setShouldRemove>
  ) => innerAtomFamily.setShouldRemove(...params)

  return wrappedAtom as AtomFamily<
    FamilyId,
    WritableAtom<AtomType, InputParam, void>
  > & {
    clearAll: () => void
  }
}
