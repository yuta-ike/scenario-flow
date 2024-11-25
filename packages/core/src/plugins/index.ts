import { plugin as runnPlugin } from "./runn"
import { convertDecomposedToStepci } from "./stepci/stepci"

import type { EnginePluginId } from "@/domain/entity/plugin/plugin"
import type { EnginePlugin } from "./type"

import { toEnginePluginId } from "@/domain/entity/plugin/toEnginePlugin"

export const exportPlugins: Record<EnginePluginId, EnginePlugin> = {
  [toEnginePluginId("runn")]: runnPlugin,
  [toEnginePluginId("stepci")]: {
    serialize: convertDecomposedToStepci,
    deserialize: () => {
      throw new Error("Not implemented")
    },
    runner: () => {
      throw new Error("Not implemented")
    },
  },
}
