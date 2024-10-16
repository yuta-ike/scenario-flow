export type KVItem = {
  id: string
  key: string
  value: string
}

export const kvToRecordNullable = (
  kv: KVItem[] | undefined | null,
): Record<string, string> | undefined | null => {
  if (kv == null || kv.length === 0) {
    return undefined
  }
  return kvToRecord(kv)
}

export const kvToRecord = (kv: KVItem[]): Record<string, string> => {
  return Object.fromEntries(kv.map((item) => [item.key, item.value]))
}

export const kvFromRecord = (record: Record<string, string>): KVItem[] => {
  return Object.entries(record).map(([key, value]) => ({ id: key, key, value }))
}

export const kvFromRecordBy = <Value>(
  record: Record<string, Value>,
  option: {
    keySelector?: (value: Value) => string
    valueSelector: (value: Value) => string
  },
): KVItem[] => {
  return Object.entries(record).map(([key, value]) => ({
    id: option.keySelector?.(value) ?? key,
    key: key,
    value: option.valueSelector(value),
  }))
}

export const dedupe = (kvs: KVItem[] | undefined): KVItem[] => {
  if (kvs == null) {
    return []
  }
  const map = new Map<string, KVItem>()
  kvs.forEach((item) => {
    map.set(item.key, item)
  })
  return Array.from(map.values())
}
