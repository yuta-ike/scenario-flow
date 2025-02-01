import { Id, OmitId } from "@scenario-flow/util"
import type { StripeSymbol, Transition } from "../type"
import type { OpenAPIObject } from "openapi3-ts/oas31"

export type TemporalLocation = {
  locationType: "temporal"
}

export type LocalFileLocation = {
  locationType: "local_file"
  path: string
}

export type RemoteLocation = {
  locationType: "remote"
  url: string
}

export type GitLocation = {
  locationType: "git"
  repository: string
  branch: string
}

export type ResourceLocationBlock =
  | TemporalLocation
  | LocalFileLocation
  | RemoteLocation
  | GitLocation

// resource type
export type ResourceType = "openapi"

// OpenApiResourceType
export type OpenApiResourceBlock = {
  type: "openapi"
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
  type: "openapi"
  location: ResourceLocationBlock
}

export type Resource = OpenApiResource

export const buildResource = (
  id: string,
  params: StripeSymbol<OmitId<Resource>>,
) => {
  return { id, ...params } as Resource
}

export const updateOpenApiContent: Transition<Resource> = (
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
