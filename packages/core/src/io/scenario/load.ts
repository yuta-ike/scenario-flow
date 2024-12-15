import { parseToEntities } from "./parseToEntities"
import { getRelativePath } from "./getRelativePath"

import type { ResourceContext } from "./parseToEntities"
import type { EnginePluginDeserializer } from "@/plugins/type"
import type { Json } from "@/utils/json"
import type { DirHandle, FileHandle } from "@/injector/parts/io"
import type { InjectedContent } from "@/injector/injector"

import { parseYaml } from "@/ui/lib/yaml/yamlToJson"
import { nonNull } from "@/utils/assert"

export const load = async (
  dirHandle: DirHandle,
  deserializer: EnginePluginDeserializer,
  injected: InjectedContent,
  context: ResourceContext,
) => {
  const files = await loadRec(dirHandle, injected.io.readFile)

  const decomposed = deserializer(files.map(({ file }) => file))
  const entities = parseToEntities(
    decomposed.map((d, i) => ({
      ...d,
      page: getRelativePath(files[i]!.path, dirHandle.path),
    })),
    context,
  )
  return entities
}

const loadRec = async (
  dirHandle: DirHandle,
  readFile: (entry: FileHandle) => Promise<string>,
): Promise<{ path: string; file: Json }[]> => {
  const [files, childFiles] = await Promise.all([
    Promise.all(
      dirHandle.files.map(async (fileEntry) => {
        const rawStr = await readFile(fileEntry)
        const result = parseYaml(rawStr)
        if (result.result === "error") {
          return null
        }
        return { path: dirHandle.path, file: result.value }
      }),
    ),
    Promise.all(dirHandle.children.map((child) => loadRec(child, readFile))),
  ])

  return [...files.filter(nonNull), ...childFiles.flat()]
}
