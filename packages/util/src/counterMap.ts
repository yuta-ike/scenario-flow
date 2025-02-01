export const increment =
  <Key extends string = string>(keys: Key[]) =>
  (countMap: Map<Key, number>) => {
    keys.forEach((key) => {
      const newValue = (countMap.get(key) ?? 0) + 1
      countMap.set(key, newValue)
    })
    return new Map(countMap)
  }

export const decrement =
  <Key extends string = string>(
    keys: Key[],
    options?: { whenZero?: (key: Key) => void },
  ) =>
  (countMap: Map<Key, number>) => {
    const zeroKeys: Key[] = []
    keys.forEach((key) => {
      const newValue = (countMap.get(key) ?? 0) - 1
      if (newValue === 0) {
        zeroKeys.push(key)
      }
      countMap.set(key, newValue)
    })
    zeroKeys.forEach((key) => {
      options?.whenZero?.(key)
      countMap.delete(key)
    })
    return new Map(countMap)
  }

export const applyDiff =
  <Key extends string = string>(
    prevKeys: Key[],
    nextKeys: Key[],
    options?: { whenZero?: (key: Key) => void },
  ) =>
  (countMap: Map<Key, number>) => {
    const newCountMap = new Map(countMap)

    const prevSet = new Set(prevKeys)
    const nextSet = new Set(nextKeys)
    const deleted = prevSet.difference(nextSet)
    const added = nextSet.difference(prevSet)

    decrement(deleted.values().toArray(), options)(newCountMap)
    increment(added.values().toArray())(newCountMap)

    return newCountMap
  }
