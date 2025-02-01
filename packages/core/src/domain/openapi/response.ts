import { nonNull } from "@scenario-flow/util"
import { nonRef } from "./isNotRef"

import type {
  ResponseObject,
  ResponsesObject,
  SchemaObject,
} from "openapi3-ts/oas31"

export const getResponseSchema = (
  responses: ResponsesObject | null | undefined,
): SchemaObject[] => {
  if (responses == null) {
    return []
  }
  return Object.entries(responses)
    .flatMap(([status, response]) => {
      if (status === "defaullt") {
        return []
      }
      if (response == null || !("content" in response)) {
        return []
      }
      const statusInt = parseInt(status, 10)
      if (isNaN(statusInt) || statusInt < 200 || 300 <= statusInt) {
        return []
      }

      const schema = (response as ResponseObject).content?.["application/json"]
        ?.schema
      return nonRef(schema)
    })
    .filter(nonNull)
}
