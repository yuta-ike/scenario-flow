import {
  mergeActionParameter,
  type BinderActionParameter,
  type RestCallActionParameter,
  type UnknownActionParameter,
  type ValidatorActionParameter,
} from "../action/actionParameter"
import { toExpression } from "../value/expression.util"

import type { ActionSourceIdentifier } from "../action/identifier"
import type { Builder, BuilderReturn } from "../type"
import type { LocalVariable, LocalVariableId } from "../variable/variable"
import type { RawResolvedAction, ResolvedAction } from "../action/action"
import type { Id } from "@/utils/idType"
import type { Expression } from "../value/expression"
import type { Replace } from "@/utils/typeUtil"

declare const _actionInstance: unique symbol
export type ActionInstanceId = Id & { [_actionInstance]: never }

// rest_call
export type RestCallActionInstanceConfig = {
  followRedirect: boolean
  useCookie: boolean
}
export type RestCallActionInstance = {
  [_actionInstance]: never
  id: ActionInstanceId
  description: string
  actionIdentifier: ActionSourceIdentifier
  type: "rest_call"
  instanceParameter: Partial<RestCallActionParameter>
  config: RestCallActionInstanceConfig
}

// validator
export type ValidatorActionInstance = {
  [_actionInstance]: never
  id: ActionInstanceId
  actionIdentifier?: undefined
  type: "validator"
  instanceParameter: ValidatorActionParameter
}

// binder
export type BinderActionInstance = {
  [_actionInstance]: never
  id: ActionInstanceId
  actionIdentifier?: undefined
  type: "binder"
  instanceParameter: BinderActionParameter
}

// unknown
export type UnknownActionInstance = {
  [_actionInstance]: never
  id: ActionInstanceId
  actionIdentifier?: undefined
  instanceParameter: Partial<UnknownActionParameter>
  type: "unknown"
}

// Action Instance
export type ActionInstance =
  | RestCallActionInstance
  | ValidatorActionInstance
  | BinderActionInstance
  | UnknownActionInstance

export type RawActionInstance =
  | Omit<RestCallActionInstance, typeof _actionInstance>
  | Omit<ValidatorActionInstance, typeof _actionInstance>
  | Omit<BinderActionInstance, typeof _actionInstance>
  | Omit<UnknownActionInstance, typeof _actionInstance>

export type ResolvedRestCallActionInstance = RestCallActionInstance & {
  action: ResolvedAction<"rest_call" | "unknown">
}

export type ResolvedBinderActionInstance = Replace<
  BinderActionInstance,
  "instanceParameter",
  {
    assignments: {
      variableId: LocalVariableId
      variable: LocalVariable
      value: Expression
    }[]
  }
>

export type ResolvedValidatorActionInstance = ValidatorActionInstance

export type ResolvedActionInstance =
  | ResolvedRestCallActionInstance
  | ResolvedBinderActionInstance
  | ResolvedValidatorActionInstance
  | UnknownActionInstance

export type RawResolvedActionInstance =
  | (Omit<ResolvedRestCallActionInstance, "_actionInstance" | "action"> & {
      action: RawResolvedAction
    })
  | Omit<ResolvedBinderActionInstance, "_actionInstance">
  | Omit<ResolvedValidatorActionInstance, "_actionInstance" | "action">
  | Omit<UnknownActionInstance, "_actionInstance" | "action">

export const buildRestCallActionInstance: Builder<RestCallActionInstance> = (
  id,
  params,
) => {
  return {
    id,
    ...params,
  } satisfies BuilderReturn<RestCallActionInstance> as RestCallActionInstance
}

export const buildValidatorActionInstance: Builder<ValidatorActionInstance> = (
  id,
  params,
) => {
  return {
    id,
    ...params,
  } satisfies BuilderReturn<ValidatorActionInstance> as ValidatorActionInstance
}

export const buildBinderActionInstance: Builder<BinderActionInstance> = (
  id,
  params,
) => {
  return {
    id,
    ...params,
  } satisfies BuilderReturn<BinderActionInstance> as BinderActionInstance
}

export const buildUnknownActionInstance: Builder<UnknownActionInstance> = (
  id,
  params,
) => {
  return {
    id,
    ...params,
  } satisfies BuilderReturn<UnknownActionInstance> as UnknownActionInstance
}

export const buildActionInstnace = (
  type: ActionInstance["type"],
  id: ActionInstanceId,
  params: Omit<ActionInstance, "id" | "type">,
): ActionInstance => {
  switch (type) {
    case "rest_call":
      return buildRestCallActionInstance(id, params as RestCallActionInstance)
    case "validator":
      return buildValidatorActionInstance(id, params as ValidatorActionInstance)
    case "binder":
      return buildBinderActionInstance(id, params as BinderActionInstance)
    default:
      return buildUnknownActionInstance(id, params as UnknownActionInstance)
  }
}

export const buildInitialActionInstance = (
  type: ActionInstance["type"],
  id: string,
  actionIdentifier?: ActionSourceIdentifier,
): ActionInstance => {
  switch (type) {
    case "rest_call":
      if (actionIdentifier == null) {
        throw new Error("actionIdentifier is required")
      }
      return buildRestCallActionInstance(id, {
        type: "rest_call",
        actionIdentifier: actionIdentifier,
        description: "",
        instanceParameter: {},
        config: {
          followRedirect: false,
          useCookie: false,
        },
      })
    case "validator":
      return buildValidatorActionInstance(id, {
        type: "validator",
        instanceParameter: {
          contents: toExpression(""),
        },
      })
    case "binder":
      return buildBinderActionInstance(id, {
        type: "binder",
        instanceParameter: {
          assignments: [],
        },
      })
    default:
      return buildUnknownActionInstance(id, {
        type: "unknown",
        instanceParameter: {},
      })
  }
}

export const buildResolvedActionInstance: Builder<ResolvedActionInstance> = (
  id,
  params,
) => {
  return {
    id,
    ...params,
  } satisfies BuilderReturn<ResolvedActionInstance> as ResolvedActionInstance
}

export const resolveRestCallActionInstance = (
  actionInstance: RestCallActionInstance,
  action: ResolvedAction<"rest_call">,
): ResolvedRestCallActionInstance => {
  return {
    ...actionInstance,
    instanceParameter: mergeActionParameter(
      "rest_call",
      action.schema.base,
      actionInstance.instanceParameter,
    ),
    action,
  }
}

export const resolveBinderActionInstance = (
  actionInstance: BinderActionInstance,
  variablesMap: Map<LocalVariableId, LocalVariable>,
): ResolvedBinderActionInstance => {
  const assignments = actionInstance.instanceParameter.assignments.map(
    (assign) => {
      const variable = variablesMap.get(assign.variableId)
      if (variable == null) {
        throw new Error(`variable not found: ${assign.variableId}`)
      }
      return {
        ...assign,
        variable,
      }
    },
  )
  return {
    ...actionInstance,
    instanceParameter: {
      assignments,
    },
  }
}

export const resolveValidatorActionInstance = (
  actionInstance: ValidatorActionInstance,
): ResolvedValidatorActionInstance => {
  return actionInstance
}
