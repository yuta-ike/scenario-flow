import {
  mergeActionParameter,
  type BinderActionParameter,
  type RestCallActionParameter,
  type UnknownActionParameter,
  type ValidatorActionParameter,
} from "../action/actionParameter"
import { toExpression } from "../value/expression.util"

import type { PrimitiveRoute, RouteId } from "../route/route"
import type { ActionSourceIdentifier } from "../action/identifier"
import type { Builder, BuilderReturn } from "../type"
import type { LocalVariable, LocalVariableId } from "../variable/variable"
import type { ResolvedAction } from "../action/action"
import type { Id } from "@/utils/idType"
import type { Expression } from "../value/expression"
import type { Replace } from "@/utils/typeUtil"
import type { Result } from "@/utils/result"

import { success, error } from "@/utils/result"

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

// include
export type IncludeActionInstance = {
  [_actionInstance]: never
  id: ActionInstanceId
  actionIdentifier?: undefined
  type: "include"
  instanceParameter: {
    ref: RouteId
    parameters: {
      variable: LocalVariable
      value: Expression
    }[]
  }
}

// db
export type DbActionInstance = {
  [_actionInstance]: never
  id: ActionInstanceId
  actionIdentifier?: undefined
  type: "db"
  instanceParameter: {
    query: string
  }
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
  | IncludeActionInstance
  | DbActionInstance
  | UnknownActionInstance

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

class IncludeRefResolutionFailed extends Error {
  readonly _tag = "IncludeRefResolutionFailed"
  readonly _category = "entity"
}

export type ResolvedIncludeActionInstance = Replace<
  IncludeActionInstance,
  "instanceParameter",
  {
    ref: Result<PrimitiveRoute, IncludeRefResolutionFailed>
    parameters: {
      variable: LocalVariable
      value: Expression
    }[]
  }
>

export type ResolvedDbActionInstance = DbActionInstance

export type ResolvedActionInstance =
  | ResolvedRestCallActionInstance
  | ResolvedBinderActionInstance
  | ResolvedValidatorActionInstance
  | ResolvedIncludeActionInstance
  | ResolvedDbActionInstance
  | UnknownActionInstance

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

export const buildIncludeActionInstance: Builder<IncludeActionInstance> = (
  id,
  params,
) => {
  return {
    id,
    ...params,
  } satisfies BuilderReturn<IncludeActionInstance> as IncludeActionInstance
}

export const buildDbActionInstance: Builder<DbActionInstance> = (
  id,
  params,
) => {
  return {
    id,
    ...params,
  } satisfies BuilderReturn<DbActionInstance> as DbActionInstance
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
    case "include":
      return buildIncludeActionInstance(id, params as IncludeActionInstance)
    case "db":
      return buildDbActionInstance(id, params as DbActionInstance)
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
    case "include":
      return buildIncludeActionInstance(id, {
        type: "include",
        instanceParameter: {
          ref: "",
          parameters: [],
        },
      })
    case "db":
      return buildDbActionInstance(id, {
        type: "db",
        instanceParameter: {
          query: "",
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

export const resolveIncludeActionInstance = (
  actionInstance: IncludeActionInstance,
  routeMap: Map<string, PrimitiveRoute>,
): ResolvedIncludeActionInstance => {
  const route = routeMap.get(actionInstance.instanceParameter.ref)
  return {
    ...actionInstance,
    instanceParameter: {
      ref:
        route != null
          ? success(route)
          : error(new IncludeRefResolutionFailed()),
      parameters: actionInstance.instanceParameter.parameters.map((param) => {
        const variable = param.variable
        return {
          ...param,
          variable,
        }
      }),
    },
  }
}

export const resolveDbActionInstance = (
  actionInstance: DbActionInstance,
): ResolvedDbActionInstance => {
  return actionInstance
}
