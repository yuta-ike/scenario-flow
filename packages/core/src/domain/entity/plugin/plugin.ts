import { Id, Json, JsonPrimitive } from "@scenario-flow/util"
import type { Decomposed } from "../decompose/decomposed"

declare const _enginePlugin: unique symbol
export type EnginePluginId = Id & {
  [_enginePlugin]: never
}

export type LibMetaFormat<T> = {
  meta: {
    id: string
    title: string
    color: string
  }
  contents: T & Record<`x-${string}`, JsonPrimitive>
}

export type EnginePluginSerializer<LibFormat = any> = (
  decomposed: Decomposed,
) => LibMetaFormat<LibFormat>
export type EnginePluginDeserializer = (raw: Json[]) => Decomposed[]

export type EnginePlugin<LibFormat = any> = {
  id: EnginePluginId
  serialize: EnginePluginSerializer<LibFormat>
  deserialize: EnginePluginDeserializer
}
