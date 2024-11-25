import { toLowerCase } from "effect/String"

import type { EnginePluginSerializer } from "../type"
import type { DecomposedStep } from "@/domain/entity/decompose/decomposed"
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
): Partial<RunBookStep> => {
  if (action.type === "rest_call") {
    const pathWithSearchParams = buildPath(
      action.path,
      kvToRecordNullable(action.queryParams) ?? undefined,
    )

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
  } else {
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
    return loop.maxRetries
  }
  return {
    count: loop.maxRetries,
    interval: formatTime(loop.interval) ?? undefined,
    maxInterval: formatTime(loop.maxElapsedTime) ?? undefined,
  }
}

const convertDecomposedStep = (step: DecomposedStep): RunBookStep => {
  const actionObjs = step.actions.map((action) =>
    convertDecomposedAction(action),
  )
  const result = actionObjs.reduce((acc, action) => {
    return {
      ...acc,
      ...action,
    } satisfies Partial<RunBookStep>
  })

  return {
    ...result,
    desc: step.title,
    loop: convertDecomposedLoopConfig(step.loop),
    if: step.condition,
  } satisfies RunBookStep
}

export const convertDecomposedToRunn: EnginePluginSerializer<RunBook> = (
  decomposed,
) => {
  const libFormat = {
    meta: {
      id: decomposed.id,
      title: decomposed.title,
      color: decomposed.color,
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
          convertDecomposedStep(step),
        ]),
      ),
      "x-id": decomposed.id,
      "x-color": decomposed.color,
    },
  }
  return libFormat
}
