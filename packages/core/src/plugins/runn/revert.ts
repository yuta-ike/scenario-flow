/* eslint-disable @typescript-eslint/no-unnecessary-template-expression */
import { IdCache } from "./helper/idCache"

import type { EnginePluginDeserializer } from "../type"
import type { DecomposedStep } from "@/domain/entity/decompose/decomposed"
import type { RunBookStep, RunBookStepPathsObject } from "@/schemas/runn/type"
import type { Json } from "@/utils/json"

import { buildGlobalVariable } from "@/domain/entity/globalVariable/globalVariable"
import { genId } from "@/utils/uuid"
import { parseToTypedValue } from "@/domain/entity/value/dataType"
import { parseContentType, parseHttpMethod } from "@/utils/http"
import { nonNull } from "@/utils/assert"
import { buildLocalVariable } from "@/domain/entity/variable/variable"
import { toRouteId } from "@/domain/entity/route/route.util"
import { COLORS } from "@/utils/pcss"
import { parsePath } from "@/utils/url"
import { parseTime } from "@/domain/entity/value/time"
import { validateRunn } from "@/schemas/runn"

const getFirstEntry = <T>(
  obj: Record<string, T>,
): [string, T] | [null, null] => {
  return Object.entries(obj)[0] ?? [null, null]
}

const revertRunnHttpStepToDecomposedAction = (
  req: RunBookStepPathsObject,
): DecomposedStep["actions"][number] | null => {
  const [path, pathItem] = getFirstEntry(req)
  if (path == null) {
    return null
  }
  const [rawMethod, operation] = getFirstEntry(pathItem)
  if (rawMethod == null) {
    return null
  }
  const method = parseHttpMethod(rawMethod)
  if (method == null) {
    return null
  }
  const headers = operation.headers ?? {}
  const cookies = operation.cookies ?? {}
  const body = operation.body ?? {}
  const [rawContentType, bodyValue] = getFirstEntry(body)

  const contentType =
    rawContentType != null
      ? (parseContentType(rawContentType) ?? undefined)
      : undefined

  const res = parsePath(path)

  const xActionId = operation.meta?.["x-action-id"]
  const meta = xActionId != null ? { "x-action-id": xActionId } : undefined

  return {
    type: "rest_call" as const,
    description: "",
    path: res.path,
    method,
    headers: Object.entries(headers).map(([key, value]) => ({
      id: genId(),
      key,
      value,
    })),
    queryParams: Object.entries(res.queryParams).map(([key, value]) => ({
      id: genId(),
      key,
      value,
    })),
    cookies: Object.entries(cookies).map(([key, value]) => ({
      id: genId(),
      key,
      value,
    })),
    contentType,
    body: bodyValue as Json,
    meta,
  }
}

const revertRunnStepToDecomposedStep = (
  key: string,
  step: RunBookStep,
  stepIdStepKeyCache: IdCache,
): DecomposedStep => {
  return {
    id: stepIdStepKeyCache.getOrCreate(key),
    title: key,
    description: `${step.desc ?? ""}`,
    actions: [
      // rest_call
      step.req == null ? null : revertRunnHttpStepToDecomposedAction(step.req),
      // validator
      step.test == null
        ? null
        : {
            type: "validator" as const,
            description: "",
            contents: step.test,
          },
      // binder
      step.bind == null
        ? null
        : {
            type: "binder" as const,
            description: "",
            assignments: Object.entries(step.bind).map(([key, value]) => ({
              variable: buildLocalVariable(genId(), {
                namespace: "vars",
                boundIn: "local",
                name: key,
                description: "",
                schema: "any",
              }),
              value,
            })),
          },
      step.include == null
        ? null
        : {
            type: "include" as const,
            description: "",
            ref: step.include.path,
            parameters: Object.entries(step.include.vars ?? {}).map(
              ([key, value]) => ({
                variable: buildLocalVariable(genId(), {
                  namespace: "vars",
                  boundIn: "local",
                  name: key,
                  description: "",
                  schema: "any",
                }),
                value,
              }),
            ),
          },
      step.db == null
        ? null
        : {
            type: "db" as const,
            description: "",
            query: step.db.query,
          },
    ].filter(nonNull),
    condition: step.if,
    loop:
      step.loop == null
        ? undefined
        : typeof step.loop === "number"
          ? {
              maxRetries: step.loop,
            }
          : {
              maxRetries: step.loop.count,
              interval: parseTime(step.loop.interval) ?? undefined,
              maxElapsedTime: parseTime(step.loop.maxInterval) ?? undefined,
            },
  } satisfies DecomposedStep
}

export const revertRunnToDecomposed: EnginePluginDeserializer = (
  jsons: Json[],
) => {
  const runbooks = jsons.filter((json) => validateRunn(json))

  const stepIdStepKeyCache = new IdCache()

  return runbooks.map((runbook, i) => {
    const stepEntries = Array.isArray(runbook.steps)
      ? runbook.steps.map(
          (step, i) => [i, step] satisfies [number, RunBookStep],
        )
      : Object.entries(runbook.steps ?? {})

    return {
      id: toRouteId(genId()),
      color: COLORS[i % COLORS.length]!,
      title: runbook.desc,
      endpoint: "",
      page: "",
      globalVariables: Object.entries(runbook.vars ?? {}).map(
        ([key, value]) => ({
          ...buildGlobalVariable(genId(), {
            namespace: "vars",
            boundIn: "global",
            name: key,
            description: "",
            schema: "any",
          }),
          value: parseToTypedValue(value),
        }),
      ),
      steps: stepEntries.map(([key, step]) =>
        revertRunnStepToDecomposedStep(`${key}`, step, stepIdStepKeyCache),
      ),
    }
  })
}
