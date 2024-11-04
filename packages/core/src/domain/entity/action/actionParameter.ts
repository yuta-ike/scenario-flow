import type { Expression } from "../value/expression"
import type { LocalVariableId } from "../variable/variable"
import type { Empty } from "effect/ConfigProviderPathPatch"
import type { HttpMethod } from "@/utils/http"
import type { Json } from "@/utils/json"
import type { PartialPartial } from "@/utils/typeUtil"

import { dedupe, type KVItem } from "@/ui/lib/kv"

export type HttpRequestBodyContentTypeObject = {
  "application/json"?: Json
  "application/form-data"?: KVItem[]
}

// Action Parameter
export type RestCallActionParameter = {
  method: HttpMethod
  path: string
  headers: KVItem[]
  cookies: KVItem[]
  queryParams: KVItem[]
  pathParams: KVItem[]
  body?: {
    selected: keyof HttpRequestBodyContentTypeObject | undefined
    params: HttpRequestBodyContentTypeObject
  }
  baseUrl: string
}

export type RestCallActionParameterForopen_api = PartialPartial<
  RestCallActionParameter,
  "method" | "path" | "baseUrl"
>
const DEFAULT_REST_CALL_ACTION_PARAMETER: RestCallActionParameter = {
  method: "GET",
  path: "/",
  headers: [],
  cookies: [],
  queryParams: [],
  pathParams: [],
  body: undefined,
  baseUrl: "https://example.com",
}

export type ValidatorActionParameter = {
  contents: Expression
}

type Assign = { variableId: LocalVariableId; value: Expression }
export type BinderActionParameter = {
  assignments: Assign[]
}

export type UnknownActionParameter = Empty

// Builder
const _mergeRestActionParameter = <
  Secondary extends Partial<RestCallActionParameter>,
>(
  base: Secondary,
  override: Partial<RestCallActionParameter>,
): Secondary => {
  return {
    method: override.method ?? base.method,
    path: override.path ?? base.path,
    headers: [...(override.headers ?? []), ...(base.headers ?? [])],
    cookies: [...(override.cookies ?? []), ...(base.cookies ?? [])],
    queryParams: [...(override.queryParams ?? []), ...(base.queryParams ?? [])],
    pathParams: [...(override.pathParams ?? []), ...(base.pathParams ?? [])],
    body:
      override.body == null
        ? undefined
        : {
            selected: override.body.selected ?? base.body?.selected,
            params: {
              "application/form-data": [
                ...(override.body.params["application/form-data"] ?? []),
                ...(base.body?.params["application/form-data"] ?? []),
              ],
              "application/json":
                override.body.params["application/json"] ??
                base.body?.params["application/json"],
            },
          },
    baseUrl: override.baseUrl ?? base.baseUrl,
  } as Secondary
}

const mergeRestCallActionParameter = (
  ...actionParameters: Partial<RestCallActionParameter>[]
): RestCallActionParameter => {
  const merged = actionParameters.reduce<RestCallActionParameter>(
    (acc, cur) => _mergeRestActionParameter(acc, cur),
    DEFAULT_REST_CALL_ACTION_PARAMETER,
  )
  return {
    method: merged.method,
    path: merged.path,
    headers: dedupe(merged.headers),
    cookies: dedupe(merged.cookies),
    queryParams: dedupe(merged.queryParams),
    pathParams: dedupe(merged.pathParams),
    body:
      merged.body == null
        ? undefined
        : {
            selected: merged.body.selected,
            params: {
              "application/json": merged.body.params["application/json"],
              "application/form-data": dedupe(
                merged.body.params["application/form-data"],
              ),
            },
          },
    baseUrl: merged.baseUrl,
  }
}

export const mergeActionParameter = (
  type: "rest_call",
  ...updateActionInstanceParameters: Partial<RestCallActionParameter>[]
): RestCallActionParameter => {
  switch (type) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case "rest_call":
      return mergeRestCallActionParameter(...updateActionInstanceParameters)
  }
}
