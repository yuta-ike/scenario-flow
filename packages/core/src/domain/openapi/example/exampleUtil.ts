import type {
  ExampleObject,
  ReferenceObject,
  ResponseObject,
  ResponsesObject,
} from "openapi3-ts/oas31"
import type { Json } from "@/utils/json"
import type { KVItem } from "@/ui/lib/kv"

import { genId } from "@/utils/uuid"

export const getExample = <Return = unknown>(
  example?: unknown,
  examples?: Record<string, ExampleObject | ReferenceObject>,
): Return | undefined => {
  if (example !== undefined) {
    return example as unknown as Return
  } else {
    return Object.values(examples ?? {})[0] as unknown as Return
  }
}

export const getResponseExampleForJson = (
  responsesObject: ResponsesObject | undefined,
): Json | null => {
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
  const mediaTypeObject = response.content?.["application/json"]
  const example = getExample(
    mediaTypeObject?.example,
    mediaTypeObject?.examples,
  )

  return example as Json
}

export const getResponseExampleForFormData = (
  responsesObject: ResponsesObject | undefined,
): KVItem[] | null => {
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
  const mediaTypeObject = response.content?.["application/json"]
  const example = getExample<Json>(
    mediaTypeObject?.example,
    mediaTypeObject?.examples,
  )
  if (example == null) {
    return null
  }

  return Object.entries(example).map(([key, value]) => ({
    id: genId(),
    key,
    value: value as string,
  }))
}
