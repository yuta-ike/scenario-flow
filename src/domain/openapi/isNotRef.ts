import type { ReferenceObject } from "openapi3-ts/oas31"

export const isNotRef = <Right extends object>(
  object: Right | ReferenceObject,
): object is Right => {
  return !("$ref" in object)
}
