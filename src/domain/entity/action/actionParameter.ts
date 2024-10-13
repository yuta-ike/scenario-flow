import type { RestCallActionInstanceParameter } from "../node/actionInstance"
import type { Expression } from "../value/expression"
import type { ReusableActionType } from "./action"
import type { HttpMethod } from "@/utils/http"
import type { OperationObject } from "openapi3-ts/oas31"

type RestCallActionparameterBlock = {
  method: HttpMethod
  path: Expression
  operationObject?: OperationObject
  example?: RestCallActionInstanceParameter
  // @deprecated
  baseUrl: string
}

export type ActionParameter<Type extends ReusableActionType> = {
  rest_call: RestCallActionparameterBlock
  unknown: null
}[Type]

export type RestCallACtionParameter = ActionParameter<"rest_call">
