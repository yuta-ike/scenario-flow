export type DataType =
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "array"
  | "null"

export type TypedValue =
  | {
      type: "string"
      value: string
    }
  | {
      type: "number"
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
