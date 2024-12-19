import { isNotRef } from "./isNotRef"
import { getParameterTypeFromSchema } from "./getParameterTypeFromSchema"

import type { DataType } from "../entity/value/dataType"
import type { OperationObject } from "openapi3-ts/oas31"

type GetDefinedKeys = {
  headers: Map<
    string,
    { required: boolean; dataType: DataType; description?: string }
  >
  cookies: Map<
    string,
    { required: boolean; dataType: DataType; description?: string }
  >
  pathParams: Map<
    string,
    { required: boolean; dataType: DataType; description?: string }
  >
  queryParams: Map<
    string,
    { required: boolean; dataType: DataType; description?: string }
  >
}

export const getKeyStatus = (
  operationObject: OperationObject | undefined,
): GetDefinedKeys | null => {
  if (operationObject === undefined) {
    return null
  }

  const requiredParams = operationObject.parameters
    ?.filter(isNotRef)
    .filter((param) => isNotRef(param))
  return {
    headers: new Map(
      requiredParams
        ?.filter((param) => param.in === "header")
        .map((param) => [
          param.name,
          {
            description: param.description,
            dataType: getParameterTypeFromSchema(param.schema),
            required: param.required === true,
          },
        ]),
    ),
    cookies: new Map(
      requiredParams
        ?.filter((param) => param.in === "cookie")
        .map((param) => [
          param.name,
          {
            description: param.description,
            dataType: getParameterTypeFromSchema(param.schema),
            required: param.required === true,
          },
        ]),
    ),
    pathParams: new Map(
      requiredParams
        ?.filter((param) => param.in === "path")
        .map((param) => [
          param.name,
          {
            description: param.description,
            dataType: getParameterTypeFromSchema(param.schema),
            required: param.required === true,
          },
        ]),
    ),
    queryParams: new Map(
      requiredParams
        ?.filter((param) => param.in === "query")
        .map((param) => [
          param.name,
          {
            description: param.description,
            dataType: getParameterTypeFromSchema(param.schema),
            required: param.required === true,
          },
        ]),
    ),
  }
}
