import type {
  BinderActionParameterSchema,
  RestCallActionParameterSchema,
  UnknownActionParameterSchema,
  ValidatorActionParameterSchema,
} from "../action/action"
import type { Builder, BuilderReturn } from "../type"
import type { Id } from "@/utils/idType"

declare const _userDefinedAction: unique symbol
export type UserDefinedActionId = Id & { [_userDefinedAction]: never }

export type UserDefinedAction = {
  [_userDefinedAction]: never
  id: UserDefinedActionId
  name: string
  description: string
} & (
  | {
      type: "rest_call"
      schema: RestCallActionParameterSchema
    }
  | {
      type: "validator"
      schema: ValidatorActionParameterSchema
    }
  | {
      type: "binder"
      schema: BinderActionParameterSchema
    }
  | {
      type: "unknown"
      schema: UnknownActionParameterSchema
    }
)

export const buildUserDefinedAction: Builder<UserDefinedAction> = (
  id,
  params,
) => {
  return {
    id,
    ...params,
  } satisfies BuilderReturn<UserDefinedAction> as UserDefinedAction
}
