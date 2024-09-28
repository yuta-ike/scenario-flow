import type { Bind, Environment } from "./environment"
import type { VariableId } from "./variable"

export const environmentToMap = (
  environment: Environment,
): Map<VariableId, Bind> =>
  new Map(environment.map((bind) => [bind.variable.id, bind]))
