import { isNotRef } from "./isNotRef"

import type { ReferenceObject, SchemaObject } from "openapi3-ts/oas31"
import type { DataType } from "../entity/value/dataType"

export const getParameterTypeFromSchema = (
  schema: SchemaObject | ReferenceObject | undefined,
): DataType => {
  if (schema == null || !isNotRef(schema)) {
    return "any"
  }

  if (
    schema.type === "integer" ||
    schema.type === "string" ||
    schema.type === "array"
  ) {
    return schema.type
  }

  return "any"
}
