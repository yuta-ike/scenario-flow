import type { ReusableActionType } from "../action/action"
import type { ActionParameter } from "../action/actionParameter"
import type { Id } from "@/utils/idType"

export type UserDefinedActionId = Id & { __userDefinedActionId: never }

export type UserDefinedAction<
  Type extends ReusableActionType = ReusableActionType,
> = {
  id: UserDefinedActionId
  type: ReusableActionType
  parameter: ActionParameter<Type>
  name: string
  description: string
}
