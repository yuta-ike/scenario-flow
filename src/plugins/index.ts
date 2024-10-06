import { convertDecomposedToRunn } from "./runn/runn"

import type { Decomposed } from "@/domain/entity/decompose/decomposed"
import type { ExportPluginId } from "@/domain/entity/plugin/plugin"
import type { Json } from "@/utils/json"

export const exportPlugins: Record<
  ExportPluginId,
  {
    convertDecomposedToLibFormat: (decomposed: Decomposed) => {
      meta: {
        id: string
        title: string
        color: string
      }
      contents: Json
    }
  }
> = {
  runn: {
    convertDecomposedToLibFormat: convertDecomposedToRunn,
  },
  scenarigo: {
    convertDecomposedToLibFormat: () => {
      throw new Error("Not implemented")
    },
  },
  stepci: {
    convertDecomposedToLibFormat: () => {
      throw new Error("Not implemented")
    },
  },
}
