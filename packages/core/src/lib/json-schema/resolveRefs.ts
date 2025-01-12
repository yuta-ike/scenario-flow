import { dereference } from "@apidevtools/json-schema-ref-parser"

import { JsonParseError } from "./error"
import fileResolver from "./fileResolver"

import type { Result } from "@/utils/result"
import type { OpenAPIObject } from "openapi3-ts/oas31"

import { error, success } from "@/utils/result"

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
    console.log("============================")
    console.log(res)
    return success(res as OpenAPIObject)
  } catch (e) {
    console.log("============================")
    console.log(e)
    return error(new JsonParseError(e))
  }
}
