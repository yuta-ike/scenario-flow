/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import type { Json } from "../../../utils/json"

type ContentType = "application/json" | "application/form-data"

export type RunBook = {
  desc: string
  labels?: string[]
  needs?: {
    [Key: string]: string
  }
  runners?: {
    [Key: string]: string
  }
  vars?: {
    [Key: string]: string
  }
  steps?: RunBookStep[] | Record<string, RunBookStep>
  hostRules?: any
  debug?: boolean
  interval?: string
  if?: string
  skipTest?: boolean
  loop?: any
  concurrency?: any
  force?: boolean
  trace?: boolean
}

export type RunBookStepLoopConfig =
  | number
  | {
      count?: number
      interval?: string | number
      minInterval?: string | number
      maxInterval?: string | number
      jutter?: number
      multiplier?: number
      until?: string
    }

// RunBookStep

// Http
export type RunBookStepPathsObject = Record<string, RunBookStepPathItemObject>
export type RunBookStepPathItemObject = Record<
  string,
  RunBookStepOperationObject
>
export type RunBookStepOperationObject = {
  headers?: Record<string, string>
  cookies?: Record<string, string>
  body?: Record<ContentType, RunBookStepMediaTypeObject>
  trace?: boolean
  meta?: {
    "x-action-id"?: string
  }
}
export type RunBookStepMediaTypeObject = Json

export type RunBookStepIncludeObject = {
  path: string
  vars: Record<string, string>
}

export type RunBookStep = {
  desc?: string
  if?: string
  loop?: RunBookStepLoopConfig
  req?: RunBookStepPathsObject
  test?: string
  include?: RunBookStepIncludeObject
  bind?: Record<string, string>
}
