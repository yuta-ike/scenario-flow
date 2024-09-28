import { dereference } from "@apidevtools/json-schema-ref-parser"

import type { OpenAPIObject } from "openapi3-ts/oas31"

export const resolveRefs = async (
  openApi: OpenAPIObject,
): Promise<OpenAPIObject> => {
  const res = await dereference(openApi)
  return res as OpenAPIObject
}
