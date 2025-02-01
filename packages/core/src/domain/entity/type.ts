import { DistributiveOmit } from "@scenario-flow/util"

export type Transition<Entity, Args extends any[] = any[], Return = Entity> = (
  entity: Entity,
  ...args: Args
) => Return

type IsBrandedString<T extends string> = Exclude<keyof T, keyof string>

type RetrieveNonSymbolAndNonUndefinedKey<T> = {
  [Key in keyof T]: Key extends symbol
    ? never
    : undefined extends T[Key]
      ? never
      : Key
}[keyof T]

type RetrieveNonSymbolAndUndefinedKey<T> = {
  [Key in keyof T]: Key extends symbol
    ? never
    : undefined extends T[Key]
      ? Key
      : never
}[keyof T]

export type StripeSymbol<Model> =
  // 配列の場合
  Model extends (infer Item)[]
    ? StripeSymbol<Item>[]
    : // 文字列の場合（blanded typeが存在するためオブジェクトより先に処理する）
      Model extends string
      ? IsBrandedString<Model> extends never
        ? Model
        : string
      : // オブジェクトの場合
        Model extends object
        ? {
            [ValidKey in RetrieveNonSymbolAndNonUndefinedKey<Model>]: StripeSymbol<
              Model[ValidKey]
            >
          } & {
            [ValidKey in RetrieveNonSymbolAndUndefinedKey<Model>]?: StripeSymbol<
              Model[ValidKey]
            >
          }
        : // その他
          Model

/**
 * IDと、symbol型を指定するキーをとりのぞいたModelの型を返す
 */
export type BuilderParams<Model extends Record<string, any>> = StripeSymbol<
  DistributiveOmit<Model, "id">
>

export type BuilderReturn<
  Model extends Record<string, any> & { length?: never },
> = BuilderParams<Model> & {
  id: Model extends { id: infer Id }
    ? Id extends string
      ? string
      : never
    : never
}

export type Builder<
  Model extends Record<string, any> & { length?: never } & { id: string },
  Rest extends any[] = never[],
> = (
  id: Model["id"] extends string ? string : never,
  params: BuilderParams<Model>,
  ...rest: Rest
) => Model

export type SimpleBuilder<Model, Args extends any[] = any[]> = (
  ...args: Args
) => Model

export type Equal<Model> = (a: Model, b: Model) => boolean

export type Receiver<Model, Args extends any[], Return> = (
  model: Model,
  ...rest: Args
) => Return
