import type { UserDefinedActionInner } from "./userDefinedAction"
import type { ResourceActionId, ResourceType } from "../resource/resource"
import type { ResourceActionInner } from "./resourceAction"
import type { ActionParameter } from "./actionParameter"
import type { Id } from "@/utils/idType"

export type ActionType = "rest_call" | "validator" | "binder"
export type ActionSource = "resource" | "user_defined"

// この概念自体無くしちゃっても良いかも
export type ReusableActionType = Extract<ActionType, "rest_call">

export type ActionId = Id & { __actionId: never }
export type Action<
  Type extends ReusableActionType = ReusableActionType,
  RType extends ResourceType = ResourceType,
> = {
  id: ActionId
  type: Type
} & (
  | ({
      source: "resoure"
    } & ResourceActionInner<RType>)
  | ({ source: "userDefined" } & UserDefinedActionInner)
)

// @duplicated
export type ResolvedAction<
  Type extends ReusableActionType = ReusableActionType,
  RType extends ResourceType = ResourceType,
> = Action<Type, RType> & {
  name: string
  description: string
  parameter: ActionParameter<Type>
}

// Resource Action
export type ResourceAction<
  Type extends ReusableActionType = ReusableActionType,
  RType extends ResourceType = ResourceType,
> = {
  id: ResourceActionId
  type: Type
  source: "resource"
} & ResourceActionInner<RType>

export type ResolvedResourceAction<
  Type extends ReusableActionType = ReusableActionType,
  RType extends ResourceType = ResourceType,
> = {
  id: ResourceActionId
  type: Type
  name: string
  description: string
  parameter: ActionParameter<Type>
  source: "resoure"
} & ResourceActionInner<RType>

// // rest
// export type RestCallActionparameter = {
//   method: HttpMethod
//   path: Expression
// }

// export type RestCallActionBlock = {
//   type: "rest_call"
//   parameter: RestCallActionparameter
// }

// // graphql
// export type GraphqlCallActionparameter = {
//   query: Expression
// }
// export type GraphqlCallActionBlock = {
//   type: "graphql_call"
//   parameter: GraphqlCallActionparameter
// }

// // action
// export type ActionId = Id & { __actionId: never }
// export type Action<Type extends ReusableActionType = ReusableActionType> = {
//   id: ActionId
//   name: string
//   description: string
// } & {
//   rest_call: RestCallActionBlock
// }[Type]

// // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
// export type RestCallAction = Action<"rest_call">
