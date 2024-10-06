import type { ResolvedVariable, Variable } from "./variable"
import type { Replace } from "@/utils/typeUtil"

export type Bind = {
  // TODO: namespaceはvariable側で持つべきかも
  namespace?: "vars" | "steps"
  variable: Variable
  inherit: boolean
}

export type Environment = Bind[]

export type ResolvedBind = Replace<Bind, "variable", ResolvedVariable>
export type ResolvedEnvironment = ResolvedBind[]

// operation
export const getVariableDisplay = (bind: Bind | ResolvedBind): string => {
  return [bind.namespace, bind.variable.name]
    .filter((fragment) => fragment != null)
    .join(".")
}

export const intersectionEnvironment = (
  environements: Environment[],
): Environment => {
  if (environements.length <= 1) {
    return environements[0] ?? []
  }

  const bindCache = new Map<string, Bind>()
  const variableIdSets = environements.map(
    (environment) =>
      new Set(
        environment
          .filter((bind) => bind.inherit)
          .map((bind) => {
            bindCache.set(bind.variable.id, bind)
            return bind.variable.id
          }),
      ),
  )
  const intersectionVariableIds = variableIdSets
    .reduce((prev, current) => prev.intersection(current))
    .values()
    .toArray()

  return intersectionVariableIds.map((variableId) => {
    return {
      namespace: bindCache.get(variableId)!.namespace,
      variable: bindCache.get(variableId)!.variable,
      inherit: true,
    }
  })
}

export const dedupeShadowedBind = (environment: Environment): Environment => {
  const bindCache = new Map<string, Bind>()
  environment.forEach((bind) => {
    bindCache.set(bind.variable.name, bind)
  })

  return bindCache.values().toArray()
}
