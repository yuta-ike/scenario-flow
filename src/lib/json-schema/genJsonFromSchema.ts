import { sample } from "@stoplight/json-schema-sampler"

import type {
  ReferenceObject,
  ResponseObject,
  ResponsesObject,
} from "openapi3-ts/oas31"
import type { JSONSchema7 } from "json-schema"
import type { KVItem } from "@/ui/lib/kv"

import { type Json } from "@/utils/json"
import { genId } from "@/utils/uuid"

export const genSampleFromSchema = (schema: JSONSchema7) => {
  return sample(schema) as Json
}

export const genResponseJsonSampleFromSchema = (
  responsesObject: ResponsesObject | undefined,
) => {
  if (responsesObject == null) {
    return null
  }
  const response: ResponseObject | ReferenceObject | undefined =
    responsesObject["200"] ??
    responsesObject["201"] ??
    responsesObject["202"] ??
    responsesObject["203"] ??
    responsesObject["204"] ??
    responsesObject["205"] ??
    responsesObject["207"] ??
    responsesObject["208"] ??
    responsesObject["226"]
  if (response == null || "$ref" in response) {
    return null
  }

  const schema = response.content?.["application/json"]?.schema
  if (schema == null) {
    return null
  }

  return genSampleFromSchema(schema)
}

export const genResponseFormDataSampleFromSchema = (
  responsesObject: ResponsesObject | undefined,
): KVItem[] | null => {
  const json = genResponseJsonSampleFromSchema(responsesObject)
  if (typeof json !== "object" || json == null) {
    return null
  }

  const entries = Object.entries(json).map(([key, value]) => [
    key,
    JSON.stringify(value),
  ])

  return entries.map(
    ([key, value]) =>
      ({
        id: genId(),

        key: key!,
        value,
      }) as KVItem,
  )
}
