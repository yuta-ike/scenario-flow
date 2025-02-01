import { toLowerCase } from "effect/String"

import type { EnginePluginSerializer } from "../type"
import {
  buildPath,
  ContentType,
  Json,
  kvToRecordNullable,
} from "@scenario-flow/util"
import {
  Decomposed,
  DecomposedStep,
} from "../../domain/entity/decompose/decomposed"
import { typedValueToValue } from "../../domain/entity/value/dataType"
import { formatTime } from "../../domain/entity/value/time"
import {
  RunBookStep,
  RunBookStepOperationObject,
  RunBookStepPathItemObject,
  RunBookStepPathsObject,
  RunBookStepLoopConfig,
  RunBook,
} from "../../schemas/runn/type"

const convertDecomposedAction = (
  action: DecomposedStep["actions"][number],
  routeIdPathMap: Map<string, string>,
): Partial<RunBookStep> => {
  if (action.type === "rest_call") {
    const pathWithSearchParams = buildPath(
      action.path,
      kvToRecordNullable(action.queryParams) ?? undefined,
    )

    const xActionId = action.meta?.["x-action-id"]
    const meta = xActionId != null ? { "x-action-id": xActionId } : undefined
    return {
      desc: action.description?.length === 0 ? undefined : action.description,
      req: {
        [pathWithSearchParams]: {
          [toLowerCase(action.method)]: {
            headers: kvToRecordNullable(action.headers) ?? undefined,
            cookies: kvToRecordNullable(action.cookies) ?? undefined,
            body:
              action.contentType != null
                ? ({
                    [action.contentType]: action.body,
                  } as Record<ContentType, Json>)
                : undefined,
            meta,
          } satisfies RunBookStepOperationObject,
        } satisfies RunBookStepPathItemObject,
      } satisfies RunBookStepPathsObject,
    } satisfies RunBookStep
  } else if (action.type === "binder") {
    if (action.assignments.length === 0) {
      return {}
    }
    return {
      bind: Object.fromEntries(
        action.assignments.map((assignment) => [
          assignment.variable.name,
          assignment.value,
        ]),
      ),
    }
  } else if (action.type === "include") {
    return {
      include: {
        path: routeIdPathMap.get(action.ref) ?? "",
        vars: Object.fromEntries(
          action.parameters.map((parameter) => [
            parameter.variable.name,
            parameter.value,
          ]),
        ),
      },
    }
  } else if (action.type === "validator") {
    if (action.contents.length === 0) {
      return {}
    }
    return {
      test: action.contents,
    }
  } else {
    return {
      db: {
        query: action.query,
      },
    }
  }
}

const convertDecomposedLoopConfig = (
  loop: DecomposedStep["loop"],
): RunBookStepLoopConfig | undefined => {
  if (loop == null) {
    return undefined
  }
  if (
    loop.maxRetries != null &&
    loop.interval == null &&
    loop.maxElapsedTime == null
  ) {
    if (loop.maxRetries === 0) {
      return undefined
    }
    return loop.maxRetries
  }
  return {
    count: loop.maxRetries,
    interval: formatTime(loop.interval) ?? undefined,
    maxInterval: formatTime(loop.maxElapsedTime) ?? undefined,
  }
}

const convertDecomposedStep = (
  step: DecomposedStep,
  routeIdPathMap: Map<string, string>,
): RunBookStep => {
  const actionObjs = step.actions.map((action) =>
    convertDecomposedAction(action, routeIdPathMap),
  )
  const result = actionObjs.reduce((acc, action) => {
    return {
      ...acc,
      ...action,
    } satisfies Partial<RunBookStep>
  }, {})

  return {
    ...result,
    desc: step.description.length === 0 ? undefined : step.description,
    loop: convertDecomposedLoopConfig(step.loop),
    if: step.condition,
  } satisfies RunBookStep
}

const convertDecomposedToRunn = (
  decomposed: Decomposed,
  routeIdPathMap: Map<string, string>,
) => {
  const libFormat = {
    meta: {
      id: decomposed.id,
      title: decomposed.title,
      color: decomposed.color,
      page: decomposed.page,
    },
    contents: {
      desc: decomposed.title,
      runners: decomposed.runners,
      vars:
        decomposed.variables.length === 0
          ? undefined
          : Object.fromEntries(
              decomposed.variables.map(({ variable: { name }, value }) => [
                name,
                typedValueToValue(value) as string,
              ]),
            ),
      steps: Object.fromEntries(
        decomposed.steps.map((step) => [
          step.title,
          convertDecomposedStep(step, routeIdPathMap),
        ]),
      ),
    },
  }
  return libFormat
}

export const convertDecomposedListToRunn: EnginePluginSerializer<RunBook> = (
  decomposedList,
) => {
  const routeIdPathMap = new Map(
    decomposedList.map((decomposed) => [
      decomposed.id,
      `${decomposed.page}/${decomposed.title}.yaml`,
    ]),
  )

  return decomposedList.map((decomposed) =>
    convertDecomposedToRunn(decomposed, routeIdPathMap),
  )
}
