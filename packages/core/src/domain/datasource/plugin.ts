import { atom } from "jotai"

import type { EnginePluginId } from "../entity/plugin/plugin"
import { EnginePlugin } from "../../plugins/type"

export const currentEnginePluginIdAtom = atom<EnginePluginId | null>(null)

export const supportedEnginePluginsAtom = atom<
  Map<EnginePluginId, EnginePlugin>
>(new Map())

export const enginePluginAtom = atom((get) => {
  const pluginId = get(currentEnginePluginIdAtom)
  if (pluginId == null) {
    throw new Error("Plugin is not selected")
  }
  const enginePlugin = get(supportedEnginePluginsAtom).get(pluginId)
  if (enginePlugin == null) {
    throw new Error("Plugin is not found")
  }
  return enginePlugin
})
