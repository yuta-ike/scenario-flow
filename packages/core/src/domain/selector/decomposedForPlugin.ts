import { atom } from "jotai"

import { enginePluginAtom } from "../datasource/plugin"

import { decomposedAtom } from "./decomposed"

export const decomposedForLibAtom = atom((get) => {
  const enginePlugin = get(enginePluginAtom)
  const decomposed = get(decomposedAtom)
  return decomposed.map((scenario) => enginePlugin.serialize(scenario))
})
