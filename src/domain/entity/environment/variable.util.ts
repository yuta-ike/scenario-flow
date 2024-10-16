import type { JSONSchema7Definition } from "json-schema"
import type { DataType } from "../value/dataType"

import { nonNull } from "@/utils/assert"

export type VariableSuggest = { name: string; type: DataType; depth: number }

export const _getVariableSuggests = (
  schema: "any" | JSONSchema7Definition,
  accessor: string,
  depth: number,
): VariableSuggest[] => {
  if (schema === "any") {
    return [{ name: accessor, type: "any", depth }]
  }
  if (typeof schema === "boolean") {
    return []
  }

  const availableTypes = [schema.type].filter(nonNull).flat()

  return availableTypes
    .map((type) => {
      if (
        type === "string" ||
        type === "number" ||
        type === "integer" ||
        type === "boolean" ||
        type === "null"
      ) {
        return { name: accessor, type, depth }
      } else if (type === "array") {
        const flattened = [schema.items]
          .flat()
          .filter(nonNull)
          .filter((item) => typeof item !== "boolean")

        return flattened.map((itemSchema) =>
          _getVariableSuggests(itemSchema, `${accessor}[$${depth}]`, depth + 1),
        )
      } else {
        // type === "object"
        const properties = schema.properties ?? {}
        return Object.entries(properties)
          .filter(([_, property]) => typeof property !== "boolean")
          .map(([key, property]) => {
            return _getVariableSuggests(property, `${accessor}.${key}`, depth)
          })
      }
    })
    .flat(2)
}
