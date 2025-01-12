import { getVariableName } from "./variable"

import type { ResolvedVariable, Variable } from "./variable"
import type { JSONSchema7Definition } from "json-schema"
import type { DataType } from "../value/dataType"
import type { Receiver } from "../type"

import { nonNull } from "@/utils/assert"

export type VariableSuggest = {
  name: string
  template: string
  type: DataType
  depth: number
}

export const getVariableSuggests: Receiver<
  Variable | ResolvedVariable,
  [],
  VariableSuggest[]
> = (variable) => {
  return _getVariableSuggests(
    variable.schema,
    getVariableName(variable),
    getVariableName(variable),
    1,
  )
}

const _getVariableSuggests = (
  schema: "any" | JSONSchema7Definition,
  name: string,
  template: string,
  depth: number,
): VariableSuggest[] => {
  if (schema === "any") {
    return [{ name, template, type: "any", depth }]
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
        return { name, template, type, depth }
      } else if (type === "array") {
        const flattened = [schema.items]
          .flat()
          .filter(nonNull)
          .filter((item) => typeof item !== "boolean")

        return flattened.map((itemSchema) =>
          _getVariableSuggests(
            itemSchema,
            `${name}[N]`,
            `${template}[$${depth}]`,
            depth + 1,
          ),
        )
      } else {
        // type === "object"
        const properties = schema.properties ?? {}
        return Object.entries(properties)
          .filter(([_, property]) => typeof property !== "boolean")
          .map(([key, property]) => {
            return _getVariableSuggests(
              property,
              `${name}.${key}`,
              `${template}.${key}`,
              depth,
            )
          })
      }
    })
    .flat(2)
}
