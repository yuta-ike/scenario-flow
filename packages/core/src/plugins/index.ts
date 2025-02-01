import { EnginePluginId } from "../domain/entity/plugin/plugin"
import { toEnginePluginId } from "../domain/entity/plugin/toEnginePlugin"
import { plugin as runnPlugin } from "./runn"

import type { EnginePlugin } from "./type"

export const exportPlugins: Record<EnginePluginId, EnginePlugin> = {
  [toEnginePluginId("runn")]: runnPlugin,
}
