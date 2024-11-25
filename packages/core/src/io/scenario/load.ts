import { parseToEntities } from "./parseToEntities"

import type { EnginePluginDeserializer } from "@/plugins/type"

import { getInjectedContent, type ProjectEntry } from "@/injector"
import { parseYaml } from "@/ui/lib/yaml/yamlToJson"
import { nonNull } from "@/utils/assert"

export const load = async (
  projectEntry: ProjectEntry,
  deserializer: EnginePluginDeserializer,
) => {
  const {
    io: { readFile },
  } = getInjectedContent()

  const fileEntries = projectEntry.files

  const _runbooks = await Promise.all(
    fileEntries.map(async (fileEntry) => {
      const rawStr = await readFile(fileEntry)

      const result = parseYaml(rawStr)
      if (result.result === "error") {
        return null
      }

      return result.value
    }),
  )
  const runbooks = _runbooks.filter(nonNull)
  const decomposed = deserializer(runbooks)
  const entities = parseToEntities(decomposed)
  return entities
}
