import { toUpperCase } from "effect/String"

import { toMethodAndPath } from "../entity/resource/identifier.utli"
import {
  buildOpenApiResourceIdentifierWithMethodAndPath,
  buildOpenApiResourceIdentifierWithOperationId,
  type OpenApiResourceLocalIdentifier as OpenApiResourceLocalIdentifier,
  type ResourceActionLocalIdentifier,
} from "../entity/resource/identifier"

import { generateExampleFromOperationObject } from "./example"

import type { RestCallActionParameterSchema } from "../entity/action/action"
import type { RestCallActionParameterForOpenApi } from "../entity/action/actionParameter"
import type { OpenAPIObject } from "openapi3-ts/oas31"
import type { Resource } from "../entity/resource/resource"
import type { Expression } from "../entity/value/expression"

import { HTTP_METHODS, type HttpMethod } from "@/utils/http"
import { toLowerCase } from "@/utils/string"

const lowerHttpMethods = HTTP_METHODS.map(toLowerCase)

/**
 * openapiのpathをExpressionに変換する
 */
export const parsePathToExpression = (path: string): Expression => {
  return path as Expression
}

// Open Api
export const resolveOpenApiResource = (
  resource: Resource,
  identifier: OpenApiResourceLocalIdentifier,
): {
  meta: { name: string; description: string }
  parameter: RestCallActionParameterForOpenApi
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
          },
        }
      }
    }
  }

  return null
}

export const retrieveAllActionFromOpenApiResource = (
  resource: Resource,
): (RestCallActionParameterSchema & {
  identifier: OpenApiResourceLocalIdentifier
})[] => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (resource.content == null) {
    return []
  }

  const pathsObject = resource.content as unknown as OpenAPIObject

  const actions: (RestCallActionParameterSchema & {
    identifier: OpenApiResourceLocalIdentifier
  })[] = []
  for (const [path, pathObject] of Object.entries(pathsObject.paths ?? {})) {
    for (const method of lowerHttpMethods) {
      const operationObject = pathObject[method]
      if (operationObject == null) {
        continue
      }

      const baseUrl = resource.content.servers?.[0]?.url ?? ""

      const example = generateExampleFromOperationObject(
        toUpperCase(method),
        path,
        baseUrl,
        operationObject,
      )

      actions.push({
        identifier:
          operationObject.operationId != null
            ? buildOpenApiResourceIdentifierWithOperationId(
                operationObject.operationId,
              )
            : buildOpenApiResourceIdentifierWithMethodAndPath(
                toUpperCase(method),
                path,
              ),
        base: {
          method: toUpperCase(method),
          path: parsePathToExpression(path),
          baseUrl,
        },
        examples: [example],
        jsonSchema: operationObject,
      })
    }
  }

  return actions
}

export const retrieveAllResourceActionLocalIdentifier = (
  resource: Resource,
): ResourceActionLocalIdentifier[] =>
  retrieveAllActionFromOpenApiResource(resource).map(
    ({ identifier }) => identifier,
  )
