import type { ResolvedVariable, Variable } from "./variable"

export type Bind = {
  variable: Variable
}

export type Environment = Bind[]

export type ResolvedBind = {
  variable: ResolvedVariable
}
export type ResolvedEnvironment = ResolvedBind[]

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
        environment.map((bind) => {
          bindCache.set(bind.variable.id, bind)
          return bind.variable.id
        }),
      ),
  )
  const intersectionVariableIds = variableIdSets
    .reduce((prev, current) => prev.intersection(current))
    .values()
    .toArray()

  // TODO: 同名変数の扱いなど

  return intersectionVariableIds.map((variableId) => {
    return {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      variable: bindCache.get(variableId)!.variable,
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
