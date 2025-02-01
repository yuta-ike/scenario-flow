import {
  getVariableName,
  type ResolvedVariable,
  type Variable,
} from "./variable"

import type { Transition } from "../type"
import { Replace } from "@scenario-flow/util"

export type Bind = {
  variable: Variable
  inherit: boolean
}

export type Environment = Bind[]

export type ResolvedBind = Replace<Bind, "variable", ResolvedVariable>
export type ResolvedEnvironment = ResolvedBind[]

export const emptyEnvironment: ResolvedEnvironment = []

// operation
export const intersect = (environements: Environment[]): Environment => {
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
      variable: bindCache.get(variableId)!.variable,
      inherit: true,
    }
  })
}

export const dedupeEnvironmentBinds: Transition<Environment> = (
  environment,
) => {
  const bindCache = new Map<string, Bind>()
  environment.forEach((bind) => {
    bindCache.set(getVariableName(bind.variable), bind)
  })

  return bindCache.values().toArray()
}
