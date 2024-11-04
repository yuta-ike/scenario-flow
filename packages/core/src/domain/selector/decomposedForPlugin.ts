import { atom } from "jotai"

import { exportPluginIdAtom } from "../datasource/plugin"

import { decomposedAtom } from "./decomposed"

import { exportPlugins } from "@/plugins"

export const decomposedForLibAtom = atom((get) => {
  const exportPluginId = get(exportPluginIdAtom)
  const decomposed = get(decomposedAtom)
  return decomposed.map((scenario) =>
    exportPlugins[exportPluginId].convertDecomposedToLibFormat(scenario),
  )
})
