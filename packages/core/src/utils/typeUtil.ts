export type Empty = Record<string, never>

export type Replace<Dict, Key extends keyof Dict, NewType> = Omit<Dict, Key> &
  Record<Key, NewType>

export type PartialDict<Dict, Key extends keyof Dict> = {
  [K in Exclude<keyof Dict, Key>]: Dict[K]
} & Partial<{
  [K in Key]?: Dict[K]
}>

export type If<Cond, Is, Then, Else = never> = Cond extends Is ? Then : Else

export type IsArray<T> = T extends any[] ? T : never

export type IsDict<T> =
  T extends Record<string, any>
    ? T extends { length: never }
      ? T
      : never
    : never

export type PartialPartial<T, RequiredKey extends keyof T> = {
  [K in Exclude<keyof T, RequiredKey>]?: T[K]
} & {
  [K in RequiredKey]: T[K]
}
