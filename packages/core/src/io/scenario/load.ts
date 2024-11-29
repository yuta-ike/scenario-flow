import { parseToEntities } from "./parseToEntities"

import type { EnginePluginDeserializer } from "@/plugins/type"
import type { Json } from "@/utils/json"
import type { FileEntry } from "@/injector"

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

  const files = await loadRec(projectEntry, readFile)

  const decomposed = deserializer(files.map(({ file }) => file))
  const entities = parseToEntities(
    decomposed.map((d, i) => ({ ...d, page: files[i]!.path })),
  )
  return entities
}

const loadRec = async (
  projectEntry: ProjectEntry,
  readFile: (entry: FileEntry) => Promise<string>,
): Promise<{ path: string; file: Json }[]> => {
  const fileEntries = projectEntry.files

  const files = await Promise.all(
    fileEntries.map(async (fileEntry) => {
      const rawStr = await readFile(fileEntry)

      const result = parseYaml(rawStr)
      if (result.result === "error") {
        return null
      }

      return { path: projectEntry.path, file: result.value }
    }),
  )

  const childFiles = await Promise.all(
    projectEntry.children.map((child) => loadRec(child, readFile)),
  )

  return [...files.filter(nonNull), ...childFiles.flat()]
}
