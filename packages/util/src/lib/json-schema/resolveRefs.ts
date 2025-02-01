import { dereference } from "@apidevtools/json-schema-ref-parser"

import { JsonParseError } from "./error"
import fileResolver from "./fileResolver"

import type { OpenAPIObject } from "openapi3-ts/oas31"
import { Result, success, error } from "@scenario-flow/util"

export const resolveRefs = async (
  openApi: OpenAPIObject,
  readExternalFile: (path: string) => Promise<string>,
): Promise<Result<OpenAPIObject, JsonParseError>> => {
  try {
    const res = await dereference(openApi, {
      resolve: {
        external: true,
        file: fileResolver(readExternalFile),
        http: false,
      },
    })
    return success(res as OpenAPIObject)
  } catch (e) {
    console.log(e)
    return error(new JsonParseError(e))
  }
}
