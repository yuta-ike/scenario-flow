import type { Time } from "../value/time"
import type { RouteId } from "../route/route"
import type { TypedValue } from "../value/dataType"
import type { GlobalVariable } from "../globalVariable/globalVariable"
import type { ContentType, HttpMethod } from "@/utils/http"
import type { KVItem } from "@/ui/lib/kv"
import type { Json } from "@/utils/json"
import type { LocalVariable } from "../variable/variable"

export type DecomposedStep = {
  id: string | number
  title: string
  actions: (
    | {
        type: "rest_call"
        description?: string
        path: string
        method: HttpMethod
        headers?: KVItem[]
        cookies?: KVItem[]
        queryParams?: KVItem[]
        contentType?: ContentType
        body?: Json
      }
    | {
        type: "validator"
        description?: string
        contents: string
      }
    | {
        type: "binder"
        description?: string
        assignments: { variable: LocalVariable; value: string }[]
      }
  )[]
  skip?: boolean
  condition?: string
  loop?: {
    interval?: Time
    maxRetries?: number
    maxElapsedTime?: Time
  }
}

export type Decomposed = {
  id: RouteId
  color: string
  title: string
  globalVariables: (GlobalVariable & {
    value: TypedValue
  })[]
  endpoint: string // TODO: 暫定
  steps: DecomposedStep[]
}
