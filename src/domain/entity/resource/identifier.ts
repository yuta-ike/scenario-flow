import { toMethodAndPath } from "./identifier.utli"

import type { Equal, SimpleBuilder, StripeSymbol } from "../type"
import type { HttpMethod } from "@/utils/http"

declare const _operationId: unique symbol
export type OperationId = string & {
  [_operationId]: never
}
declare const _methodAndPath: unique symbol
export type MethodAndPath = string & {
  [_methodAndPath]: never
}

declare const _openApiResourceIdentifier: unique symbol

export type OpenApiResourceLocalIdentifier =
  | {
      [_openApiResourceIdentifier]: never
      operationId: OperationId
      methodAndPath?: undefined
    }
  | {
      [_openApiResourceIdentifier]: never
      operationId?: undefined
      methodAndPath: MethodAndPath
    }

export type ResourceActionLocalIdentifier = OpenApiResourceLocalIdentifier

export const buildOpenApiResourceIdentifierWithOperationId: SimpleBuilder<
  OpenApiResourceLocalIdentifier
> = (operationId: string) => {
  return {
    operationId: operationId as OperationId,
    methodAndPath: undefined,
  } satisfies StripeSymbol<OpenApiResourceLocalIdentifier> as OpenApiResourceLocalIdentifier
}

export const buildOpenApiResourceIdentifierWithMethodAndPath = (
  method: HttpMethod,
  path: string,
): OpenApiResourceLocalIdentifier => {
  return {
    operationId: undefined,
    methodAndPath: toMethodAndPath(method, path),
  } satisfies StripeSymbol<OpenApiResourceLocalIdentifier> as OpenApiResourceLocalIdentifier
}

export const eq: Equal<OpenApiResourceLocalIdentifier> = (a, b) => {
  if (a.operationId != null && b.operationId != null) {
    return a.operationId === b.operationId
  }
  if (a.methodAndPath != null && b.methodAndPath != null) {
    return a.methodAndPath === b.methodAndPath
  }
  return false
}

export const display: (identifier: OpenApiResourceLocalIdentifier) => string = (
  identifier,
) => identifier.operationId ?? identifier.methodAndPath
