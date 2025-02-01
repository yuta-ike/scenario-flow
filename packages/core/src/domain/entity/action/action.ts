import { parseExpressionInPath } from "../value/expression"

import {
  buildActionSourceIdentifier,
  type ActionSourceIdentifier,
} from "./identifier"

import type { UserDefinedAction } from "../userDefinedAction/userDefinedAction"
import type { OperationObject } from "openapi3-ts/oas31"
import type { BuilderParams, Builder } from "../type"
import type {
  BinderActionParameter,
  RestCallActionParameter,
  UnknownActionParameter,
  ValidatorActionParameter,
} from "./actionParameter"
import { Id, dedupe, genId } from "@scenario-flow/util"
import { extractPathParameter } from "./helper/extractPathParameter"

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
} & ActionSourceIdentifier
export const buildAction: Builder<Action> = (id, params) => {
  return { id, ...params } as Action
}

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

export const updateRestCallActionParameter = (
  action: ResolvedAction,
  base: ResolvedAction<"rest_call">["schema"]["base"],
): ResolvedAction => {
  if (action.type === "rest_call") {
    const _path = (base.path ?? action.schema.base.path)!

    const [path, pathParams] = parseExpressionInPath(_path)

    return {
      ...action,
      name: `${base.method ?? action.schema.base.method} ${base.path ?? action.schema.base.path}`,
      schema: {
        ...action.schema,
        base: {
          ...action.schema.base,
          ...base,
          path,
          pathParams: dedupe([
            ...pathParams.map(({ name, value }) => ({
              id: genId(),
              key: name,
              value,
            })),
            ...(action.schema.base.pathParams ?? []),
          ]),
        },
      },
    }
  } else {
    return action
  }
}
