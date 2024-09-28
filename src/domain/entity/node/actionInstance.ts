import type { Expression } from "../value/expression"
import type { ActionType, ResolvedAction } from "../action/action"
import type { ActionRef } from "./actionRef"
import type { Replace } from "@/utils/typeUtil"
import type { Id } from "@/utils/idType"
import type { LocalVariable, LocalVariableId } from "../variable/variable"
import type { Json } from "@/utils/json"
import type { KVItem } from "@/ui/lib/kv"

export type HttpRequestBodyContentTypeObject = {
  "application/json"?: Json
  "application/form-data"?: KVItem[]
}

type InstanceParameterMeta = {
  description: string
}

// rest_call
export type RestCallActionInstanceConfig = {
  followRedirect: boolean
  useCookie: boolean
}
export type RestCallActionInstanceParameter = {
  headers?: KVItem[]
  cookies?: KVItem[]
  queryParams?: KVItem[]
  pathParams?: KVItem[]
  body?: HttpRequestBodyContentTypeObject
  config?: RestCallActionInstanceConfig
} & InstanceParameterMeta
export type RestCallActionInstanceBlock = {
  type: "rest_call"
  instanceParameter: RestCallActionInstanceParameter
  actionRef: ActionRef
}

// validator
export type ValidatorId = Id & { __validatorId: never }
export type ValidatorActionInstanceParameter = {
  id: ValidatorId
  contents: Expression
} & InstanceParameterMeta
export type ValidatorActionInstanceBlock = {
  type: "validator"
  instanceParameter: ValidatorActionInstanceParameter
}

// binder
export type BinderActionInstanceParameter = {
  assignments: { variableId: LocalVariableId; value: Expression }[]
} & InstanceParameterMeta
export type BinderActionInstanceBlock = {
  type: "binder"
  instanceParameter: BinderActionInstanceParameter
}

// action instance
export type ActionInstanceId = Id & { __actionInstanceId: never }
type _ActionInstance<Type extends ActionType> = {
  actionInstanceId: ActionInstanceId
} & {
  rest_call: RestCallActionInstanceBlock
  validator: ValidatorActionInstanceBlock
  binder: BinderActionInstanceBlock
}[Type]

// specific type
export type RestCallActionInstance = _ActionInstance<"rest_call">
export type ValidatorActionInstance = _ActionInstance<"validator">
export type BinderActionInstance = _ActionInstance<"binder">

export type ActionInstance =
  | RestCallActionInstance
  | ValidatorActionInstance
  | BinderActionInstance

// resolved action instance
export type ResolvedRestCallActionInstance = RestCallActionInstance & {
  action: ResolvedAction
}

export type ResolvedBinderActionInstance = Replace<
  BinderActionInstance,
  "instanceParameter",
  Replace<
    BinderActionInstanceParameter,
    "assignments",
    {
      variableId: LocalVariableId
      variable: LocalVariable
      value: Expression
    }[]
  >
>

export type ResolvedActionInstance =
  | ResolvedRestCallActionInstance
  | ValidatorActionInstance
  | ResolvedBinderActionInstance
