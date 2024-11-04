import { parseToEntities } from "./parseToEntities"

import { getInjectedContent, type ProjectEntry } from "@/injector"
import { validateRunn } from "@/schemas/runn"
import { parseYaml } from "@/ui/lib/yaml/yamlToJson"
import { nonNull } from "@/utils/assert"
import { revertRunnToDecomposed } from "@/plugins/runn/revert"

export const load = async (projectEntry: ProjectEntry) => {
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

      const json = result.value
      if (!validateRunn(json)) {
        return null
      }
      return json
    }),
  )
  const runbooks = _runbooks.filter(nonNull)
  const decomposed = revertRunnToDecomposed(runbooks)
  const entities = parseToEntities(decomposed)
  return entities
}
