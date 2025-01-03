import type { Receiver } from "../type"
import type { PrimitiveNode } from "../node/node"
import type {
  GlobalVariable,
  GlobalVariableId,
} from "../globalVariable/globalVariable"
import type { LocalVariable, LocalVariableId } from "../variable/variable"
import type { Replace } from "@/utils/typeUtil"

export type Variable = GlobalVariable | LocalVariable
export type VariableId = GlobalVariableId | LocalVariableId

export type ResolvedVariable = Replace<
  Variable,
  "boundIn",
  "global" | PrimitiveNode
>

export const getVariableName: Receiver<Variable | ResolvedVariable, string> = (
  variable,
) =>
  variable.namespace == null
    ? variable.name
    : `${variable.namespace}.${variable.name}`
