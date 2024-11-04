import { nonRef } from "../isNotRef"

import { getExample } from "./exampleUtil"
import { getParametersMap } from "./getParametersMap"

import type { OperationObject } from "openapi3-ts/oas31"
import type { RestCallActionParameter } from "@/domain/entity/action/actionParameter"
import type { HttpMethod } from "@/utils/http"

import { emptyJson } from "@/utils/json"
import { genSampleFromSchemaObject } from "@/lib/json-schema/genJsonFromSchema"

/**
 * サンプルデータを生成する
 * @param operationObject OpenAPIのOperationObject
 * @returns OperationObjectをもとに、RestCallActionInstanceParameterを生成する
 */
export const generateExampleFromOperationObject = (
  method: HttpMethod,
  path: string,
  baseUrl: string,
  operationObject: OperationObject,
): RestCallActionParameter => {
  const parametersMap = getParametersMap(operationObject.parameters)

  const content = nonRef(nonRef(operationObject.requestBody)?.content)

  return {
    method,
    path,
    baseUrl,
    headers: parametersMap?.get("header") ?? [],
    queryParams: parametersMap?.get("query") ?? [],
    pathParams: parametersMap?.get("path") ?? [],
    cookies: parametersMap?.get("cookie") ?? [],
    body:
      content == null
        ? undefined
        : {
            selected: "application/json",
            params: {
              "application/json":
                getExample(
                  content["application/json"]?.example,
                  content["application/json"]?.examples,
                ) ??
                genSampleFromSchemaObject(
                  nonRef(content["application/json"]?.schema),
                ) ??
                emptyJson,
              "application/form-data": [],
            },
          },
  }
}
