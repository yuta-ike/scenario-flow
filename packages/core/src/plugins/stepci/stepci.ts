import type { Workflow } from "@stepci/runner"
import type { EnginePluginSerializer } from "../type"

import { typedValueToValue } from "@/domain/entity/value/dataType"
import { kvToRecordNullable } from "@/ui/lib/kv"
import { getVariableName } from "@/domain/entity/environment/variable"
import { safelyParseJson } from "@/utils/json"

const makeUndefinedIfEmpty = <T extends object>(data: T) =>
  typeof data === "object" && Object.keys(data).length === 0 ? undefined : data

export const convertDecomposedToStepci: EnginePluginSerializer<Workflow> = (
  decomposed,
) => {
  return {
    meta: {
      id: decomposed.id,
      title: decomposed.title,
      color: decomposed.color,
    },
    contents: {
      version: "1.0",
      name: decomposed.title,
      env:
        decomposed.globalVariables.length === 0
          ? undefined
          : Object.fromEntries(
              decomposed.globalVariables.map(({ name, value }) => [
                name,
                typedValueToValue(value) as string,
              ]),
            ),
      tests: {
        main: {
          steps: decomposed.steps.map((step) => {
            const restCallAction = step.actions.find(
              (action) => action.type === "rest_call",
            )
            const validatorAction = step.actions.find(
              (action) => action.type === "validator",
            )
            const binderAction = step.actions.find(
              (action) => action.type === "binder",
            )
            return {
              name: step.title,
              http:
                restCallAction == null
                  ? undefined
                  : {
                      url: `${decomposed.endpoint}${restCallAction.path}`,
                      method: restCallAction.method,
                      headers:
                        kvToRecordNullable(restCallAction.headers) ?? undefined,
                      params:
                        kvToRecordNullable(restCallAction.queryParams) ??
                        undefined,
                      cookies:
                        kvToRecordNullable(restCallAction.cookies) ?? undefined,
                      json: (restCallAction.body ?? undefined) as object,
                    },
              check: makeUndefinedIfEmpty({
                // @ts-expect-error
                ...(validatorAction == null
                  ? undefined
                  : safelyParseJson(validatorAction.contents, {
                      orElse: undefined,
                    })),
                ...(binderAction == null
                  ? undefined
                  : Object.fromEntries(
                      binderAction.assignments.map(({ variable, value }) => [
                        getVariableName(variable),
                        value,
                      ]),
                    )),
              }),
            }
          }),
        },
      },
      "x-id": decomposed.id,
      "x-color": decomposed.color,
    },
  }
}
