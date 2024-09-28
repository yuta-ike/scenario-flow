export type Id = string & { __uuid: never }

export type OmitId<
  Obj extends { id: Id },
  Key extends keyof Obj = never,
> = Omit<Obj, Key | "id">

// export type OmitId<
//   Obj extends { id: Id },
//   ExcludedKey extends keyof Obj = never,
// > = {
//   [Key in Exclude<keyof Obj, "id" | ExcludedKey>]: Obj[Key] extends Record<
//     string,
//     unknown
//   >
//     ? OmitIdInner<Obj[Key]>
//     : Obj[Key] extends (infer Item)[]
//       ? Item extends Record<string, unknown>
//         ? OmitIdInner<Item>[]
//         : never
//       : Obj[Key]
// }

// type OmitIdInner<
//   Obj extends Record<string, unknown>,
//   ExcludedKey extends keyof Obj = never,
// > = {
//   [Key in Exclude<keyof Obj, "id" | ExcludedKey>]: Obj[Key] extends Record<
//     string,
//     unknown
//   >
//     ? OmitIdInner<Obj[Key]>
//     : Obj[Key]
// }
