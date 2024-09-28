import type { JSONSchema7 } from "json-schema"
import type { Id } from "@/utils/idType"

export type LocalVariableId = Id & { __variableId: never }

export type LocalVariable = {
  id: LocalVariableId
  name: string
  schema: "any" | JSONSchema7
  description: string
}
