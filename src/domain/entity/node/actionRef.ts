import type { Id } from "@/utils/idType"
import type { ActionId } from "../action/action"

export type ActionRefId = Id & { __actionRefId: never }
export type ActionRef = {
  id: ActionRefId
  actionId: ActionId
}
