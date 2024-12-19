import { plugin as runnPlugin } from "./runn"

import type { EnginePluginId } from "@/domain/entity/plugin/plugin"
import type { EnginePlugin } from "./type"

import { toEnginePluginId } from "@/domain/entity/plugin/toEnginePlugin"

export const exportPlugins: Record<EnginePluginId, EnginePlugin> = {
  [toEnginePluginId("runn")]: runnPlugin,
}
