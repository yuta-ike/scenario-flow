import { toNodeId } from "../node/node.util"

import { buildLocalVariable, type LocalVariable } from "./variable"

export const genLocalVariable = (
  id: string,
  params?: Partial<LocalVariable>,
): LocalVariable =>
  buildLocalVariable(id, {
    name: id,
    namespace: "vars",
    description: `variable description ${id}`,
    schema: "any",
    boundIn: toNodeId("id"),
    ...params,
  })
