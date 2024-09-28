export type Empty = Record<string, never>

export type Replace<Dict, Key extends keyof Dict, NewType> = Omit<Dict, Key> &
  Record<Key, NewType>

export type PartialDict<Dict, Key extends keyof Dict> = {
  [K in Exclude<keyof Dict, Key>]: Dict[K]
} & Partial<{
  [K in Key]?: Dict[K]
}>
