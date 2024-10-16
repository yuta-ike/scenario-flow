import type { StripeSymbol, Transition } from "../type"
import type { Id, OmitId } from "@/utils/idType"
import type { OpenAPIObject } from "openapi3-ts/oas31"

export type ResourceLocationBlock =
  | {
      locationType: "temporal"
    }
  | {
      locationType: "local_file"
      path: string
    }
  | {
      locationType: "remote"
      url: string
    }
  | {
      locationType: "git"
      repository: string
      branch: string
    }

// resource type
export type ResourceType = "open_api"

// open_apiResourceType
export type open_apiResourceBlock = {
  type: "open_api"
}

// Resource
declare const _resource: unique symbol
export type ResourceId = Id & { [_resource]: never }
export type OpenApiResource = {
  [_resource]: never
  id: ResourceId
  name: string
  description: string
  content: OpenAPIObject
  type: "open_api"
} & ResourceLocationBlock

export type Resource = OpenApiResource
export type RawResource = Omit<Resource, typeof _resource>

export const buildResource = (
  id: string,
  params: StripeSymbol<OmitId<Resource>>,
) => {
  return { id, ...params } as Resource
}

export const updateopen_apiContent: Transition<Resource> = (
  resource,
  content: OpenAPIObject,
) => {
  return { ...resource, content }
}

export const updateResourceMeta: Transition<Resource> = (
  resource,
  params: Partial<Pick<Resource, "id" | "name">>,
) => {
  return { ...resource, ...params }
}

// ResourceAction
// どこに置く問題
export type ResourceActionId = Id & { __resourceActionId: never }
