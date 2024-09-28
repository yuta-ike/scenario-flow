import { useMemo } from "react"

export const useAssociateBy = <Id extends string>(
  id: Id,
  items: Record<Id, unknown>[],
) => {
  const map = useMemo(
    () => new Map(items.map((item) => [item[id], item])),
    [id, items],
  )
  return map
}

export const useAssociateWithIndexBy = <Id extends string>(
  id: Id,
  items: Record<Id, unknown>[],
) => {
  const map = useMemo(
    () =>
      new Map(items.map((item, index) => [item[id], { value: item, index }])),
    [id, items],
  )
  return map
}
