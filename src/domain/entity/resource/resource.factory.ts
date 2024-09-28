import { toResourceId } from "./resource.util"

import type { Resource, ResourceLocationBlock } from "./resource"

export const genResource = (
  id: string,
  overrides: Partial<Resource> & ResourceLocationBlock = {
    locationType: "LocalFile",
    path: "/path/to/resource",
  },
): Resource => {
  return {
    id: toResourceId(id),
    type: "OpenApi",
    name: `Resource ${id}`,
    description: "",
    content: {
      openapi: "3.0.0",
      info: {
        title: "title",
        version: "1.0.0",
      },
      paths: {
        "/post-test": {
          post: {
            operationId: `post_${id}`,
          },
        },
        "/get-test": {
          get: {
            operationId: `get_${id}`,
          },
        },
      },
    },
    ...overrides,
  }
}
