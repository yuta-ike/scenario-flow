import type {
  GlobalVariableId,
  GlobalVariableValueId,
  PatternId,
} from "./globalVariable"

export const toGlobalVariableId = (id: string) => id as GlobalVariableId

export const toGlobalVariableValueId = (id: string) =>
  id as GlobalVariableValueId

export const toPatternId = (id: string) => id as PatternId
