/* eslint-disable @typescript-eslint/no-unnecessary-template-expression */
import { IdCache } from "./helper/idCache"

import type { EnginePluginDeserializer } from "../type"
import type { DecomposedStep } from "@/domain/entity/decompose/decomposed"
import type {
  RunBook,
  RunBookStep,
  RunBookStepPathsObject,
} from "@/schemas/runn/type"
import type { Json } from "@/utils/json"

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
  const [rawPath, pathItem] = getFirstEntry(req)
  if (rawPath == null) {
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

  const { path, queryParams } = parsePath(rawPath)

  const xActionId = operation.meta?.["x-action-id"]
  const meta = xActionId != null ? { "x-action-id": xActionId } : undefined

  return {
    type: "rest_call" as const,
    description: "",
    path,
    method,
    headers: Object.entries(headers).map(([key, value]) => ({
      id: genId(),
      key,
      value,
    })),
    queryParams: Object.entries(queryParams).map(([key, value]) => ({
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
  const nodeId = stepIdStepKeyCache.getOrCreate(key)
  return {
    id: nodeId,
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
                boundIn: nodeId,
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
            ref:
              typeof step.include === "string"
                ? step.include
                : step.include.path,
            parameters: Object.entries(
              typeof step.include === "object" ? (step.include.vars ?? {}) : {},
            ).map(([key, value]) => ({
              variable: buildLocalVariable(genId(), {
                namespace: "vars",
                boundIn: nodeId,
                name: key,
                description: "",
                schema: "any",
              }),
              value,
            })),
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

export const revertRunnToDecomposed: EnginePluginDeserializer = (jsons) => {
  const runbooks = jsons.filter(
    (arg): arg is { name: string; json: RunBook; path: string } =>
      validateRunn(arg),
  )

  const stepIdStepKeyCache = new IdCache()

  return runbooks.map(({ name, path, json: runbook }, i) => {
    const stepEntries = Array.isArray(runbook.steps)
      ? runbook.steps.map(
          (step, i) => [i, step] satisfies [number, RunBookStep],
        )
      : Object.entries(runbook.steps ?? {})

    const routeId = toRouteId(genId())

    return {
      id: routeId,
      color: COLORS[i % COLORS.length]!,
      title: name.split(".").slice(0, -1).join("."),
      description: runbook.desc,
      endpoint: "",
      page: path,
      variables: Object.entries(runbook.vars ?? {}).map(([key, value]) => ({
        variable: buildLocalVariable(genId(), {
          namespace: "vars",
          boundIn: {
            type: "route",
            routeId,
          },
          name: key,
          description: "",
          schema: "any",
        }),
        value: parseToTypedValue(value),
      })),
      steps: stepEntries.map(([key, step]) =>
        revertRunnStepToDecomposedStep(`${key}`, step, stepIdStepKeyCache),
      ),
    }
  })
}
