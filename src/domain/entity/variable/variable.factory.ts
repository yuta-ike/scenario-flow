import { toLocalVariableId } from "./variable.util"

import type { LocalVariable } from "./variable"

export const genLocalVariable = (
  id: string,
  params?: Partial<LocalVariable>,
): LocalVariable => ({
  id: toLocalVariableId(id),
  name: id,
  description: `variable description ${id}`,
  schema: "any",
  ...params,
})
