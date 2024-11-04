import { EMPTY_CONFIG } from "./emptyConfig"

import type { ConfigFileFormat } from "../setUpDirectory"
import type {
  LocalFileLocation,
  Resource,
} from "@/domain/entity/resource/resource"
import type { ProjectEntry } from "@/injector"
import type { Json, JsonObject } from "@/utils/json"

import { getInjectedContent } from "@/injector"
import { safelyParseJson } from "@/utils/json"

const CONFIG_FILENAME = "flow.config.json"

export const updateConfigResource = async (
  projectEntry: ProjectEntry,
  resources: Resource[],
) => {
  const {
    io: { getOrCreateFile, writeFile, readFile },
  } = getInjectedContent()

  const configFile = await getOrCreateFile(projectEntry, CONFIG_FILENAME)
  const rawContent = await readFile(configFile)
  const json = safelyParseJson<ConfigFileFormat, ConfigFileFormat>(rawContent, {
    orElse: EMPTY_CONFIG,
  })

  const converted = replaceJson(
    json,
    "resource",
    replaceJson(
      json.resources,
      "local_files",
      Object.fromEntries(
        resources
          .filter((resource) => resource.location.locationType === "local_file")
          .map((resource) => [
            resource.name,
            (resource.location as LocalFileLocation).path,
          ]),
      ),
    ),
  )

  await writeFile(configFile, JSON.stringify(converted, null, 2))
}

export const replaceJson = (json: JsonObject, key: string, value: Json) => {
  const newJson = structuredClone(json)
  newJson[key] = value
  return newJson
}
