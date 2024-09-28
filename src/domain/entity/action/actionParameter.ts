import type { Expression } from "../value/expression"
import type { ReusableActionType } from "./action"
import type { HttpMethod } from "@/utils/http"
import type { OperationObject } from "openapi3-ts/oas31"

type RestCallActionparameterBlock = {
  method: HttpMethod
  path: Expression
  operationObject?: OperationObject
  // @deprecated
  baseUrl: string
}

export type ActionParameter<Type extends ReusableActionType> = {
  rest_call: RestCallActionparameterBlock
}[Type]

export type RestCallACtionParameter = ActionParameter<"rest_call">
