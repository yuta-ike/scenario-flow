import { toUpperCase } from "effect/String"

import { toResourceActionId } from "../entity/resource/resource.util"
import { toMethodAndPath } from "../entity/resource/identifier.utli"

import { generateExampleFromOperationObject } from "./example"

import type { OpenAPIObject } from "openapi3-ts/oas31"
import type { ResolvedResourceAction } from "../entity/action/action"
import type { RestCallACtionParameter } from "../entity/action/actionParameter"
import type { OpenApiResourceIdentifier } from "../entity/resource/identifier"
import type { Resource } from "../entity/resource/resource"
import type { Expression } from "../entity/value/expression"

import { HTTP_METHODS, type HttpMethod } from "@/utils/http"
import { toLowerCase } from "@/utils/string"

const lowerHttpMethods = HTTP_METHODS.map(toLowerCase)

/**
 * OpenApiのpathをExpressionに変換する
 */
export const parsePathToExpression = (path: string): Expression => {
  return path as Expression
}

// Open Api
export const resolveOpenApiResource = (
  resource: Resource,
  identifier: OpenApiResourceIdentifier,
): {
  meta: { name: string; description: string }
  parameter: RestCallACtionParameter
} | null => {
  const pathsObject = resource.content as unknown as OpenAPIObject

  for (const [path, pathObject] of Object.entries(pathsObject.paths ?? {})) {
    for (const method of lowerHttpMethods) {
      const operationObject = pathObject[method]
      if (operationObject == null) {
        continue
      }

      if (
        (identifier.operationId != null &&
          operationObject.operationId === identifier.operationId) ||
        (identifier.methodAndPath != null &&
          toMethodAndPath(toUpperCase(method), path) ===
            identifier.methodAndPath)
      ) {
        return {
          meta: {
            name: `${method} ${path}`,
            description: operationObject.description ?? "",
          },
          parameter: {
            method: method.toUpperCase() as HttpMethod,
            path: parsePathToExpression(path),
            baseUrl: "https://example.com",
            operationObject,
          },
        }
      }
    }
  }

  return null
}

export const retrieveAllActionFromOpenApiResource = (
  resource: Resource,
): ResolvedResourceAction[] => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (resource.content == null) {
    return []
  }

  const pathsObject = resource.content as unknown as OpenAPIObject

  const actions: ResolvedResourceAction[] = []
  for (const [path, pathObject] of Object.entries(pathsObject.paths ?? {})) {
    for (const method of lowerHttpMethods) {
      const operationObject = pathObject[method]
      if (operationObject == null) {
        continue
      }
      actions.push({
        type: "rest_call",
        id: toResourceActionId(
          operationObject.operationId ?? `${method} ${path}`,
        ),
        name: operationObject.operationId ?? `${method} ${path}`,
        description: operationObject.description ?? "",
        parameter: {
          method: toUpperCase(method),
          path: parsePathToExpression(path),
          baseUrl: "https://example.com",
          operationObject: operationObject,
          example: generateExampleFromOperationObject(operationObject),
        },
        source: "resoure",
        resourceId: resource.id,
        resourceActionId: toResourceActionId(
          operationObject.operationId ?? `${method} ${path}`,
        ),
        identifier:
          operationObject.operationId != null
            ? {
                operationId: operationObject.operationId,
              }
            : {
                methodAndPath: toMethodAndPath(toUpperCase(method), path),
              },
      })
    }
  }

  return actions
}
