import type { NodeId } from "../node/node"
import type { GlobalVariable } from "../globalVariable/globalVariable"
import type { LocalVariable } from "../variable/variable"
import type { Variable } from "./variable"

export const localVariableToVariable = (
  localVariable: LocalVariable,
  nodeId: NodeId,
): Variable => ({
  boundIn: nodeId,
  ...localVariable,
})

export const globalVariableToVariable = (
  globalVariable: GlobalVariable,
): Variable => ({
  boundIn: "global",
  ...globalVariable,
})
