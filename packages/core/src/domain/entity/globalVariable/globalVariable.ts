import type { Builder, BuilderReturn, Transition } from "../type"
import type { JSONSchema7 } from "json-schema"
import type { TypedValue } from "../value/dataType"
import { Id } from "@scenario-flow/util"

// Pattern
declare const _pattern: unique symbol
export type PatternId = Id & { [_pattern]: never }
export type Pattern = {
  [_pattern]: never
  id: PatternId
  name: string
  description: string
}
export const buildPattern: Builder<Pattern> = (id, params) => {
  return {
    id,
    ...params,
  } satisfies BuilderReturn<Pattern> as Pattern
}

// GlobalVariable
declare const _globalVariable: unique symbol
export type GlobalVariableId = Id & { [_globalVariable]: never }
export type GlobalVariable = {
  [_globalVariable]: never
  id: GlobalVariableId
  namespace: "vars"
  boundIn: "global"
  name: string
  description: string
  schema: "any" | JSONSchema7
}
export const buildGlobalVariable: Builder<GlobalVariable> = (id, params) => {
  return {
    id,
    ...params,
  } satisfies BuilderReturn<GlobalVariable> as GlobalVariable
}

// GlobalVariableBind
declare const _globalVariableBind: unique symbol
export type GlobalVariableBindId = Id & { [_globalVariableBind]: never }
export type GlobalVariableBind = {
  [_globalVariableBind]: never
  id: GlobalVariableBindId
  patternId: PatternId
  globalVariableId: GlobalVariableId
  value: TypedValue
}
export const buildGlobalVariableBind: Builder<GlobalVariableBind> = (
  id,
  params,
) => {
  return {
    id,
    ...params,
  } satisfies BuilderReturn<GlobalVariableBind> as GlobalVariableBind
}

export const updateGlobalVariableBind: Transition<GlobalVariableBind> = (
  entity,
  value: TypedValue,
) => {
  if (entity.value.type !== value.type) {
    throw new Error("Cannot change value type")
  }
  return { ...entity, value }
}
