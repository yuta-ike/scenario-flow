export const updateSetOp =
  <Value>(updater: (value: SetIterator<Value>) => Iterable<Value>) =>
  (set: Set<Value>) =>
    new Set(updater(set.values()))

export const addSetOp = <Value>(value: Value) => batchAddSetOp([value])

export const batchAddSetOp = <Value>(values: Value[]) =>
  updateSetOp<Value>((prev) => [...prev, ...values])

export const deleteSetOp = <Value>(value: Value) =>
  updateSetOp<Value>((prev) => prev.filter((v) => v !== value))

export const batchDeleteSetOp = <Value>(values: Value[]) =>
  updateSetOp<Value>((prev) => prev.filter((v) => !values.includes(v)))

export const associateBy = <
  Item extends Record<string, unknown>,
  Key extends keyof Item,
>(
  arr: Item[],
  key: Key,
) =>
  arr.reduce((acc, item) => {
    acc.set(item[key], item)
    return acc
  }, new Map<Item[Key], Item>())

export const associateWithList = <Item extends Record<string, unknown>, Key>(
  arr: Item[],
  keyAccessor: (item: Item) => Key,
) =>
  arr.reduce((acc, item) => {
    const key = keyAccessor(item)
    acc.set(key, [...(acc.get(key) ?? []), item])
    return acc
  }, new Map<Key, [Item, ...Item[]]>())
