export const count = <T>(arr: T[]): Map<T, number> => {
  const map = new Map<T, number>()
  for (const item of arr) {
    map.set(item, (map.get(item) ?? 0) + 1)
  }
  return map
}

export const dedupeArrayByKey = <T>(arr: T[], key: keyof T): T[] => {
  const map = new Map<T[keyof T], T>()
  for (const item of arr) {
    map.set(item[key], item)
  }
  return Array.from(map.values())
}

export const uniq = <T>(arr: T[]): T[] => new Set(arr).values().toArray()
