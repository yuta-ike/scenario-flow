import type { Expression } from "../entity/value/expression"
import type { HttpMethod } from "@/utils/http"
import type { Json } from "@/utils/json"

type Runner = string
type Path = string
type ContentType = string
// HttpRunner
type HttpRunner = string

export type RunnOperationObject = {
  headers?: Partial<Record<string, string>>
  cookies?: Partial<Record<string, string>>
  body?: Partial<Record<ContentType, Json>>
  [CustomKey: `x-${string}`]: unknown
}

export type RunnMethodObject = Partial<
  Record<Lowercase<HttpMethod>, RunnOperationObject>
>

export type RunnPathObject = Record<Path, RunnMethodObject>

export type RunnStep =
  | Record<HttpRunner, RunnPathObject>
  | Record<"test", Expression>

export type RunnFormat = {
  "x-id"?: string
  "x-title"?: string
  "x-color"?: string
  desc: string
  labels?: string[]
  runners: Record<string, Runner>
  vars: Record<string, string>
  steps: RunnStep[] | Record<string, RunnStep>
}
