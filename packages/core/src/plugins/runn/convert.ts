import { toLowerCase } from "effect/String"

import type { EnginePluginSerializer } from "../type"
import type {
  Decomposed,
  DecomposedStep,
} from "@/domain/entity/decompose/decomposed"
import type {
  RunBookStepLoopConfig,
  RunBook,
  RunBookStep,
  RunBookStepOperationObject,
  RunBookStepPathItemObject,
  RunBookStepPathsObject,
} from "@/schemas/runn/type"
import type { Json } from "@/utils/json"
import type { ContentType } from "@/utils/http"

import { kvToRecordNullable } from "@/ui/lib/kv"
import { buildPath } from "@/utils/url"
import { typedValueToValue } from "@/domain/entity/value/dataType"
import { formatTime } from "@/domain/entity/value/time"

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
      desc: action.description ?? "",
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
  } else if (action.type === "validator") {
    if (action.contents.length === 0) {
      return {}
    }
    return {
      test: action.contents,
    }
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
  } else {
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
    desc: step.description,
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
      labels: [] as string[],
      runners: {
        req: decomposed.endpoint,
      },
      vars:
        decomposed.globalVariables.length === 0
          ? undefined
          : Object.fromEntries(
              decomposed.globalVariables.map(({ name, value }) => [
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
      `${decomposed.page}/${decomposed.title}.yml`,
    ]),
  )

  return decomposedList.map((decomposed) =>
    convertDecomposedToRunn(decomposed, routeIdPathMap),
  )
}
