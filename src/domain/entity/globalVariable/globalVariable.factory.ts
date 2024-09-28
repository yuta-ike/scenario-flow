import {
  toGlobalVariableId,
  toGlobalVariableValueId,
  toPatternId,
} from "./globalVariable.util"

import type {
  GlobalVariable,
  GlobalVariableValue,
  Pattern,
} from "./globalVariable"

export const genGlobalVariable = (
  id: string,
  params?: Partial<GlobalVariable>,
): GlobalVariable => ({
  id: toGlobalVariableId(id),
  name: "variable",
  description: "description",
  schema: "any",
  ...params,
})

export const getGlobalVariableValue = (
  id: string,
  patternId: string,
  globalVariableId: string,
  params?: Partial<GlobalVariableValue>,
): GlobalVariableValue => ({
  id: toGlobalVariableValueId(id),
  patternId: toPatternId(patternId),
  globalVariableId: toGlobalVariableId(globalVariableId),
  value: {
    type: "string",
    value: "TEST",
  },
  ...params,
})

export const genPattern = (id: string, params?: Partial<Pattern>): Pattern => ({
  id: toPatternId(id),
  name: "pattern",
  description: "description",
  ...params,
})
