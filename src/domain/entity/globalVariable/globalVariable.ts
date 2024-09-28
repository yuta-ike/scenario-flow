import type { JSONSchema7 } from "json-schema"
import type { TypedValue } from "../value/dataType"
import type { Id } from "@/utils/idType"

// Pattern
export type PatternId = Id & { __patternId: never }
export type Pattern = {
  id: PatternId
  name: string
  description: string
}

// GlobalVariable
export type GlobalVariableId = Id & { __globalVariableId: never }
export type GlobalVariable = {
  id: GlobalVariableId
  name: string
  description: string
  schema: "any" | JSONSchema7
}

// GlobalVariableValue
export type GlobalVariableValueId = Id & { __globalVariableValue: never }
export type GlobalVariableValue = {
  id: GlobalVariableValueId
  patternId: PatternId
  globalVariableId: GlobalVariableId
  value: TypedValue
}
