import { convertDecomposedToRunn } from "./runn"
import { convertDecomposedToStepci } from "./stepci/stepci"

import type { Decomposed } from "@/domain/entity/decompose/decomposed"
import type { ExportPluginId } from "@/domain/entity/plugin/plugin"
import type { RouteId } from "@/domain/entity/route/route"
import type { JsonPrimitive } from "@/utils/json"

import { parseToRunbook } from "@/schemas/runn/type"

export type LibFormat<T> = {
  meta: {
    id: RouteId
    title: string
    color: string
  }
  contents: T & Record<`x-${string}`, JsonPrimitive>
}

export const exportPlugins: Record<
  ExportPluginId,
  {
    convertDecomposedToLibFormat: (decomposed: Decomposed) => LibFormat<any>
    parseToLibFormat: (raw: string) => any
  }
> = {
  runn: {
    convertDecomposedToLibFormat: convertDecomposedToRunn,
    parseToLibFormat: parseToRunbook,
  },
  scenarigo: {
    convertDecomposedToLibFormat: () => {
      throw new Error("Not implemented")
    },
    parseToLibFormat: () => {
      throw new Error("Not implemented")
    },
  },
  stepci: {
    convertDecomposedToLibFormat: convertDecomposedToStepci,
    parseToLibFormat: () => {
      throw new Error("Not implemented")
    },
  },
}
