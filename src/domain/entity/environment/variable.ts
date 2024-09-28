import type { NodeId, PrimitiveNode } from "../node/node"
import type {
  GlobalVariable,
  GlobalVariableId,
} from "../globalVariable/globalVariable"
import type { LocalVariable, LocalVariableId } from "../variable/variable"
import type { Replace } from "@/utils/typeUtil"

export type Variable =
  | ({
      boundIn: "global"
    } & GlobalVariable)
  | ({
      boundIn: NodeId
    } & LocalVariable)

export type VariableId = GlobalVariableId | LocalVariableId

export type ResolvedVariable = Replace<
  Variable,
  "boundIn",
  "global" | PrimitiveNode
>
