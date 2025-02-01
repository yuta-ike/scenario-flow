import { Json, JsonPrimitive, Result } from "@scenario-flow/util"
import { Decomposed } from "../domain/entity/decompose/decomposed"

export type LibMetaFormat<T> = {
  meta: {
    id: string
    title: string
    color: string
    page: string
  }
  contents: T & Record<`x-${string}`, JsonPrimitive>
}

export type RunResult = {
  id: string
  result: "success" | "failure" | "skipped"
  steps: {
    id: string
    result: "success" | "failure" | "skipped"
  }[]
}[]

export type EnginePluginSerializer<LibFormat = any> = (
  decomposed: Decomposed[],
) => LibMetaFormat<LibFormat>[]
export type EnginePluginDeserializer = (
  raw: { name: string; path: string; json: Json }[],
) => Decomposed[]
export type EnginePluginRunner<CommandInput = any> = (args: {
  command: (arg: CommandInput) => Promise<Result<string>>
  scenarios: (LibMetaFormat<Decomposed> & { path: string })[]
}) => Promise<Result<RunResult, string>>

export type EnginePlugin<LibFormat = any, CommandInput = any> = {
  serialize: EnginePluginSerializer<LibFormat>
  deserialize: EnginePluginDeserializer
  runner: EnginePluginRunner<CommandInput>
}
