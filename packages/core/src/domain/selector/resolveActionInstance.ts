import { variableAtom } from "../datasource/variable"
import { toLocalVariableId } from "../entity/variable/variable.util"
import { resolvedActionAtom } from "../datasource/actions"
import {
  resolveBinderActionInstance,
  resolveIncludeActionInstance,
  resolveRestCallActionInstance,
  resolveValidatorActionInstance,
  type ActionInstance,
  type ResolvedActionInstance,
} from "../entity/node/actionInstance"
import { primitiveRoutesAtom } from "../datasource/route"

import type { ResolvedAction } from "../entity/action/action"
import type { Getter } from "jotai"
import { associateBy } from "@scenario-flow/util"

// selector
export const resolveActionInstance = (
  get: Getter,
  actionInstance: ActionInstance,
): ResolvedActionInstance => {
  if (actionInstance.type === "rest_call") {
    const resolvedAction = get(
      resolvedActionAtom(actionInstance.actionIdentifier),
    ) as ResolvedAction<"rest_call">
    return resolveRestCallActionInstance(actionInstance, resolvedAction)
  } else if (actionInstance.type === "validator") {
    return resolveValidatorActionInstance(actionInstance)
  } else if (actionInstance.type === "binder") {
    const variables = actionInstance.instanceParameter.assignments.map(
      ({ variableId }) => get(variableAtom(toLocalVariableId(variableId))),
    )
    const variabaleMap = associateBy(variables, "id")

    return resolveBinderActionInstance(actionInstance, variabaleMap)
  }
  if (actionInstance.type === "include") {
    const routes = new Map(
      get(primitiveRoutesAtom).map((route) => [route.id, route]),
    )
    return resolveIncludeActionInstance(actionInstance, routes)
  } else {
    return actionInstance
  }
}
