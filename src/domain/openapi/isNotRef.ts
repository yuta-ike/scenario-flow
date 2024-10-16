import type { ReferenceObject } from "openapi3-ts/oas31"

export const isNotRef = <Right extends object>(
  object: Right | ReferenceObject,
): object is Right => {
  return !("$ref" in object)
}

export const nonRef = <Right extends object>(
  object: Right | ReferenceObject | undefined | null,
): Right | null => {
  if (object == null) {
    return null
  }
  if ("$ref" in object) {
    return null
  }
  return object
}
