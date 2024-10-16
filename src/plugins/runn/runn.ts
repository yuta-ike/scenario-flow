import { toLowerCase } from "effect/String"

import type {
  Decomposed,
  DecomposedStep,
} from "@/domain/entity/decompose/decomposed"
import type { HttpMethod } from "@/utils/http"
import type { Json } from "@/utils/json"

import { kvToRecordNullable } from "@/ui/lib/kv"
import { buildPath } from "@/utils/url"
import { typedValueToValue } from "@/domain/entity/value/dataType"

type Runner = string
type Path = string
type ContentType = string
// HttpRunner
type HttpRunner = string

export type RunnOperationObject = {
  headers?: Partial<Record<string, string>>
  cookies?: Partial<Record<string, string>>
  body?: Partial<Record<ContentType, Json>>
  [CustomKey: `x-${string}`]: unknown
}

export type RunnMethodObject = Partial<
  Record<Lowercase<HttpMethod>, RunnOperationObject>
>

export type RunnPathObject = Record<Path, RunnMethodObject>

export type RunnStep =
  | Record<HttpRunner, RunnPathObject>
  | Record<"test", string>
  | Record<"bind", Record<string, string>>

export type RunnFormat = {
  "x-id"?: string
  "x-title"?: string
  "x-color"?: string
  desc: string
  labels?: string[]
  runners: Record<string, Runner>
  vars: Record<string, string>
  steps: RunnStep[] | Record<string, RunnStep>
}

const convertDecomposedAction = (
  action: DecomposedStep["actions"][number],
): RunnStep => {
  if (action.type === "rest_call") {
    const pathWithSearchParams = buildPath(
      action.path,
      kvToRecordNullable(action.queryParams) ?? undefined,
    )

    return {
      req: {
        [pathWithSearchParams]: {
          [toLowerCase(action.method)]: {
            headers: kvToRecordNullable(action.headers) ?? undefined,
            cookies: kvToRecordNullable(action.cookies) ?? undefined,
            body:
              action.contentType != null
                ? {
                    [action.contentType]: action.body,
                  }
                : undefined,
          } satisfies RunnOperationObject,
        } satisfies RunnMethodObject,
      } satisfies RunnPathObject,
    } satisfies RunnStep
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

const convertDecomposedStep = (
  step: DecomposedStep,
): [id: string, step: RunnStep] => {
  const actionObjs = step.actions.map((action) =>
    convertDecomposedAction(action),
  )
  return [
    `${step.id}`,
    actionObjs.reduce((acc, action) => {
      return {
        ...acc,
        ...action,
      }
    }),
  ]
}

export const convertDecomposedToRunn = (decomposed: Decomposed) => {
  return {
    meta: {
      id: decomposed.id,
      title: decomposed.title,
      color: decomposed.color,
    },
    contents: {
      desc: decomposed.title,
      labels: undefined, // TODO: implement
      runners: {
        req: decomposed.endpoint,
      },
      vars:
        decomposed.globalVariables.length === 0
          ? undefined
          : Object.fromEntries(
              decomposed.globalVariables.map(({ name, value }) => [
                name,
                typedValueToValue(value),
              ]),
            ),
      steps: Object.fromEntries(decomposed.steps.map(convertDecomposedStep)),
      "x-id": decomposed.id,
      "x-color": decomposed.color,
    } as unknown as Json,
  }
}
