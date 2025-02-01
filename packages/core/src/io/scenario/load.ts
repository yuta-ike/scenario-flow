import { parseToEntities } from "./parseToEntities"
import { getRelativePath } from "./getRelativePath"

import type { ResourceContext } from "./parseToEntities"

import { parseYaml } from "@scenario-flow/util/lib"
import { Json, nonNull } from "@scenario-flow/util"
import { DirHandle, FileHandle, InjectedContent } from "../../injector"
import { EnginePluginDeserializer } from "../../plugins/type"
import { Decomposed } from "../../domain/entity"
import { calcDiff } from "./calcDiff"

export const load = async (
  dirHandle: DirHandle,
  deserializer: EnginePluginDeserializer,
  injected: InjectedContent,
  context: ResourceContext,
) => {
  const files = await loadRec(dirHandle, injected.io.readFile)

  const decomposed = deserializer(
    files.map(({ name, path, file }) => ({
      name,
      path: getRelativePath(path, dirHandle.path),
      json: file,
    })),
  )
  console.log("[load] decomposed", decomposed)
  const entities = parseToEntities(decomposed, context)
  console.log("[load] entities", entities)

  return entities
}

export const loadDiff = async (
  dirHandle: DirHandle,
  deserializer: EnginePluginDeserializer,
  injected: InjectedContent,
  prevDecomposed: Decomposed[],
) => {
  const files = await loadRec(dirHandle, injected.io.readFile)

  const decomposed = deserializer(
    files.map(({ name, path, file }) => ({
      name,
      path: getRelativePath(path, dirHandle.path),
      json: file,
    })),
  )
  console.log("[load] decomposed", decomposed)
  const diff = calcDiff(prevDecomposed, decomposed)
  console.log("[load] diff", diff)

  return diff
}

const loadRec = async (
  dirHandle: DirHandle,
  readFile: (entry: FileHandle) => Promise<string>,
): Promise<{ name: string; path: string; file: Json }[]> => {
  const [files, childFiles] = await Promise.all([
    Promise.all(
      dirHandle.files.map(async (fileEntry) => {
        const rawStr = await readFile(fileEntry)
        const result = parseYaml(rawStr)
        if (result.result === "error") {
          return null
        }
        return {
          path: dirHandle.path,
          file: result.value,
          name: fileEntry.name,
        }
      }),
    ),
    Promise.all(dirHandle.children.map((child) => loadRec(child, readFile))),
  ])

  return [...files.filter(nonNull), ...childFiles.flat()]
}
