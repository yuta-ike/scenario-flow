export const count = <T>(arr: T[]): Map<T, number> => {
  const map = new Map<T, number>()
  for (const item of arr) {
    map.set(item, (map.get(item) ?? 0) + 1)
  }
  return map
}
