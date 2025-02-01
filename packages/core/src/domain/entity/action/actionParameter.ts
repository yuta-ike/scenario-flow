import type { Expression } from "../value/expression"
import type { LocalVariableId } from "../variable/variable"
import type { Empty } from "effect/ConfigProviderPathPatch"

import { dedupe, type KVItem } from "@scenario-flow/util"
import { Json, HttpMethod, PartialPartial } from "@scenario-flow/util"

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

export type RestCallActionParameterForOpenApi = PartialPartial<
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
    headers: dedupe(
      merged.headers.toSorted(
        (a, b) => (a.value.length === 0 ? -1 : b.value.length === 0 ? 1 : 0), // 値が入力されていない場合は優先しない
      ),
    ).filter((kv) => kv.key !== "" || kv.value !== ""),
    cookies: dedupe(
      merged.cookies.toSorted(
        (a, b) => (a.value.length === 0 ? -1 : b.value.length === 0 ? 1 : 0), // 値が入力されていない場合は優先しない
      ),
    ).filter((kv) => kv.key !== "" || kv.value !== ""),
    queryParams: dedupe(
      merged.queryParams.toSorted(
        (a, b) => (a.value.length === 0 ? -1 : b.value.length === 0 ? 1 : 0), // 値が入力されていない場合は優先しない
      ),
    ).filter((kv) => kv.key !== "" || kv.value !== ""),
    pathParams: dedupe(merged.pathParams),
    body:
      merged.body != null
        ? {
            selected: merged.body.selected,
            params: {
              "application/json": merged.body.params["application/json"],
              "application/form-data": dedupe(
                merged.body.params["application/form-data"],
              ),
            },
          }
        : actionParameters[0]?.body != null
          ? {
              selected: "application/json",
              params: {
                "application/json":
                  actionParameters[0]?.body?.params["application/json"],
              },
            }
          : undefined,
    baseUrl: merged.baseUrl,
  }
}

export const mergeActionParameter = (
  type: "rest_call",
  ...updateActionInstanceParameters: Partial<RestCallActionParameter>[]
): RestCallActionParameter => {
  switch (type) {
    case "rest_call":
      return mergeRestCallActionParameter(...updateActionInstanceParameters)
  }
}

export const getFilledPath = (
  parameter: Partial<RestCallActionParameter>,
): string | null => {
  const path = parameter.path
  const pathParams = parameter.pathParams ?? []
  const queryparams = parameter.queryParams ?? []

  if (path == null) {
    return null
  }

  const pathname = pathParams.reduce((acc, cur) => {
    const value = cur.value
    return 0 < value.length ? acc.replace(`{${cur.key}}`, value) : acc
  }, path)

  if (queryparams.length === 0) {
    return pathname
  }

  const query = queryparams
    .map((query) => {
      return `${query.key}=${query.value}`
    })
    .join("&")

  return `${pathname}?${query}`
}
