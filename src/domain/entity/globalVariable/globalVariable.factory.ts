import { toGlobalVariableId, toPatternId } from "./globalVariable.util"
import {
  buildGlobalVariable,
  buildGlobalVariableBind,
  buildPattern,
  type GlobalVariable,
  type GlobalVariableBind,
  type Pattern,
} from "./globalVariable"

export const genGlobalVariable = (
  id: string,
  params?: Partial<GlobalVariable>,
): GlobalVariable =>
  buildGlobalVariable(toGlobalVariableId(id), {
    namespace: "vars",
    name: "variable",
    description: "description",
    schema: "any",
    boundIn: "global",
    ...params,
  })

export const getGlobalVariableBind = (
  id: string,
  patternId: string,
  globalVariableId: string,
  params?: Partial<GlobalVariableBind>,
): GlobalVariableBind =>
  buildGlobalVariableBind(id, {
    patternId: toPatternId(patternId),
    globalVariableId: toGlobalVariableId(globalVariableId),
    value: {
      type: "string",
      value: "TEST",
    },
    ...params,
  })

export const genPattern = (id: string, params?: Partial<Pattern>): Pattern =>
  buildPattern(id, {
    name: "pattern",
    description: "description",
    ...params,
  })
