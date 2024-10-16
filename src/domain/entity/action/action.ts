import {
  buildActionSourceIdentifier,
  type ActionSourceIdentifier,
} from "./identifier"

import type { UserDefinedAction } from "../userDefinedAction/userDefinedAction"
import type { OperationObject } from "openapi3-ts/oas31"
import type { BuilderParams, Builder, BuilderReturn } from "../type"
import type {
  BinderActionParameter,
  RestCallActionParameter,
  UnknownActionParameter,
  ValidatorActionParameter,
} from "./actionParameter"
import type { Id } from "@/utils/idType"

declare const _action: unique symbol
export type ActionId = Id & { [_action]: never }

export type ActionType = "rest_call" | "validator" | "binder" | "unknown"
export type ActionSource = "resource" | "user_defined"

// Action
export type Action = {
  [_action]: never
  id: ActionId
  type: ActionType
  name: string
  description: string
} & ActionSourceIdentifier // TODO:
export const buildAction: Builder<Action> = (id, params) => {
  return { id, ...params } satisfies BuilderReturn<Action> as Action
}

export type RawAction = Omit<Action, "_action">

// ResolvedAction
export type RestCallActionParameterSchema = {
  base: Partial<RestCallActionParameter>
  examples: Partial<RestCallActionParameter>[]
  jsonSchema?: OperationObject
}

export type ValidatorActionParameterSchema = {
  base: Partial<ValidatorActionParameter>
  examples: Partial<ValidatorActionParameter>[]
  jsonSchema?: undefined
}

export type BinderActionParameterSchema = {
  base: Partial<BinderActionParameter>
  examples: Partial<BinderActionParameter>[]
  jsonSchema?: undefined
}

export type UnknownActionParameterSchema = {
  base: Partial<UnknownActionParameter>
  examples: Partial<UnknownActionParameter>[]
  jsonSchema?: undefined
}

export type ResolvedAction<AType extends ActionType = ActionType> = Action & {
  type: AType
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
export type RawResolvedAction = Omit<ResolvedAction, "_action">

export const buildResolvedAction = <AType extends ActionType = ActionType>(
  id: string,
  params: BuilderParams<ResolvedAction<AType>>,
) => {
  // @ts-expect-error
  return { id, ...params } as ResolvedAction<AType>
}

export const buildResolvedActionFromUserDefinedAction = (
  action: UserDefinedAction,
): ResolvedAction => {
  return buildResolvedAction(action.id, {
    ...action,
    resourceType: "user_defined",
    resourceIdentifier: { userDefinedActionId: action.id },
  })
}

export const getIdentifier = (action: Action) => {
  if (action.resourceType === "resource") {
    return buildActionSourceIdentifier({
      resourceType: "resource",
      resourceIdentifier: action.resourceIdentifier,
    })
  } else {
    return buildActionSourceIdentifier({
      resourceType: "user_defined",
      resourceIdentifier: action.resourceIdentifier,
    })
  }
}
