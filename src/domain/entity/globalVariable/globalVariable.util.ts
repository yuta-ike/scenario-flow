import type {
  GlobalVariableId,
  GlobalVariableBindId,
  PatternId,
} from "./globalVariable"

export const toGlobalVariableId = (id: string) => id as GlobalVariableId

export const toGlobalVariableValueId = (id: string) =>
  id as GlobalVariableBindId

export const toPatternId = (id: string) => id as PatternId
