import {
  buildResource,
  type Resource,
  type ResourceLocationBlock,
} from "./resource"

export const genResource = (
  id: string,
  overrides: Partial<Resource> & ResourceLocationBlock = {
    locationType: "local_file",
    path: "/path/to/resource",
  },
): Resource =>
  buildResource(id, {
    type: "open_api",
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
  })
