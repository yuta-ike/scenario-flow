import { dereference } from "@apidevtools/json-schema-ref-parser"

import { JsonParseError } from "./error"

import type { Result } from "@/utils/result"
import type { OpenAPIObject } from "openapi3-ts/oas31"

import { error, success } from "@/utils/result"

export const resolveRefs = async (
  openApi: OpenAPIObject,
): Promise<Result<OpenAPIObject, JsonParseError>> => {
  try {
    const res = await dereference(openApi)
    return success(res as OpenAPIObject)
  } catch (e) {
    return error(new JsonParseError(e))
  }
}
