import {
  getResponseExampleForJson,
  getResponseExampleForFormData,
} from "./exampleUtil"
import { getParametersMap } from "./getParametersMap"

import type { OperationObject } from "openapi3-ts/oas31"
import type { RestCallActionInstanceParameter } from "../../entity/node/actionInstance"

import {
  genResponseJsonSampleFromSchema,
  genResponseFormDataSampleFromSchema,
} from "@/lib/json-schema/genJsonFromSchema"
import { emptyJson } from "@/utils/json"

/**
 * サンプルデータを生成する
 * @param operationObject OpenAPIのOperationObject
 * @returns OperationObjectをもとに、RestCallActionInstanceParameterを生成する
 */
export const generateExampleFromOperationObject = (
  operationObject: OperationObject,
): RestCallActionInstanceParameter => {
  const parametersMap = getParametersMap(operationObject.parameters)

  return {
    headers: parametersMap?.get("header") ?? [],
    queryParams: parametersMap?.get("query") ?? [],
    pathParams: parametersMap?.get("path") ?? [],
    cookies: parametersMap?.get("cookie") ?? [],
    body: {
      selected: "application/json",
      params: {
        "application/json":
          getResponseExampleForJson(operationObject.responses) ??
          genResponseJsonSampleFromSchema(operationObject.responses) ??
          emptyJson,
        "application/form-data":
          getResponseExampleForFormData(operationObject.responses) ??
          genResponseFormDataSampleFromSchema(operationObject.responses) ??
          [],
      },
    },
    description: "",
  }
}
