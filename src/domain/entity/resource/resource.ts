import type { Id } from "@/utils/idType"
import type { OpenAPIObject } from "openapi3-ts/oas31"

// location

export type LocationType = "Temporal" | "LocalFile" | "Remote" | "Git"
export type ResourceLocationBlock =
  | {
      locationType: "Temporal"
    }
  | {
      locationType: "LocalFile"
      path: string
    }
  | {
      locationType: "Remote"
      url: string
    }
  | {
      locationType: "Git"
      repository: string
      branch: string
    }

// resource type
export type ResourceType = "OpenApi"

// OpenApiResourceType
export type OpenApiResourceBlock = {
  type: "OpenApi"
}

// Resource
export type ResourceId = Id & { __resourceId: never }
export type Resource = {
  id: ResourceId
  name: string
  description: string
  content: OpenAPIObject
} & OpenApiResourceBlock &
  ResourceLocationBlock

// Specific Resource
export type OpenApiResource = Resource & { type: "OpenApi" }

// ResourceAction
export type ResourceActionId = Id & { __resourceActionId: never }
