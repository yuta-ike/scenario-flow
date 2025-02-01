import { batchAddSetOp, batchDeleteSetOp } from "./set"

export const addListMap =
  <Key extends string, Value>(key: Key, values: Value[]) =>
  (map: Map<Key, Set<Value>>) => {
    map.set(key, batchAddSetOp(values)(map.get(key) ?? new Set()))
    return new Map(map)
  }

export const deleteListMap =
  <Key extends string, Value>(key: Key, values: Value[]) =>
  (map: Map<Key, Set<Value>>) => {
    map.set(key, new Set(batchDeleteSetOp(values)(map.get(key) ?? new Set())))
    return new Map(map)
  }
