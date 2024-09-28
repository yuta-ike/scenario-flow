import type { ResourceType } from "./resource"

export type MethodAndPath = string & {
  __methodAndPath: never
}

export type OpenApiResourceIdentifier =
  | {
      operationId: string
      methodAndPath?: undefined
    }
  | {
      operationId?: undefined
      methodAndPath: MethodAndPath
    }

export type ResourceIdentifier<Type extends ResourceType> = {
  OpenApi: OpenApiResourceIdentifier
}[Type]
