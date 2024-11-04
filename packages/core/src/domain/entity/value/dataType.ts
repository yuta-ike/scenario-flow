import type { JsonPrimitive } from "@/utils/json"

export type DataType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array"
  | "null"
  | "any"

export type TypedValue =
  | {
      type: "string"
      value: string
    }
  | {
      type: "number" | "integer"
      value: number
    }
  | {
      type: "boolean"
      value: boolean
    }
  | {
      type: "object"
      value: Record<string, TypedValue>
    }
  | {
      type: "array"
      value: TypedValue[]
    }
  | {
      type: "null"
      value: null
    }
  | {
      type: "any"
      value: unknown
    }

export const typedValueToValue = (typedValue: TypedValue): unknown => {
  switch (typedValue.type) {
    case "string":
      return typedValue.value
    case "number":
      return typedValue.value
    case "boolean":
      return typedValue.value
    case "object":
      return Object.fromEntries(
        Object.entries(typedValue.value).map(([key, value]) => [
          key,
          typedValueToValue(value),
        ]),
      )
    case "array":
      return typedValue.value.map(typedValueToValue)
    case "null":
      return null
  }
}

export const parseToTypedValue = (rawValue: string): TypedValue => {
  const value = rawValue as JsonPrimitive

  if (typeof value === "string") {
    return {
      type: "string",
      value,
    }
  } else if (typeof value === "number") {
    return {
      type: "number",
      value,
    }
  } else if (typeof value === "boolean") {
    return {
      type: "boolean",
      value,
    }
  } else {
    return {
      type: "null",
      value,
    }
  }
}
