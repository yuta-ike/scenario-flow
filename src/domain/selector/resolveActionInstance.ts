import { variableAtom } from "../datasource/variable"
import { toLocalVariableId } from "../entity/variable/variable.util"
import { resolvedActionAtom } from "../datasource/actions"

import type {
  ActionInstance,
  ResolvedActionInstance,
} from "../entity/node/actionInstance"
import type { Getter } from "jotai"

import { associateBy } from "@/utils/set"

// selector
export const resolveActionInstance = (
  get: Getter,
  actionInstance: ActionInstance,
): ResolvedActionInstance => {
  if (actionInstance.type === "validator") {
    return actionInstance
  }

  if (actionInstance.type === "binder") {
    const variables = actionInstance.instanceParameter.assignments.map(
      ({ variableId }) => get(variableAtom(toLocalVariableId(variableId))),
    )
    const variabaleMap = associateBy(variables, "id")

    return {
      ...actionInstance,
      instanceParameter: {
        ...actionInstance.instanceParameter,
        assignments: actionInstance.instanceParameter.assignments.map(
          ({ value, variableId }) => ({
            value,
            variableId,
            variable: variabaleMap.get(toLocalVariableId(variableId))!,
          }),
        ),
      },
    }
  }

  const { actionRef, ...rest } = actionInstance

  const resolvedAction = get(resolvedActionAtom(actionRef.actionId))
  return {
    action: resolvedAction,
    actionRef,
    ...rest,
  }
}
