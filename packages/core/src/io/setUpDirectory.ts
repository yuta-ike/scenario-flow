import { EMPTY_CONFIG } from "./config/emptyConfig"

import type { Resource } from "@/domain/entity/resource/resource"
import type { JsonObject } from "@/utils/json"

import { getInjectedContent, type ProjectEntry } from "@/main"
import { safelyParseJson } from "@/utils/json"

export type ConfigFileFormat = {
  version: "0.0.1"
  resources: {
    local_files?: Record<Resource["name"], string>[] // ローカルパスの配列
  }
}

export const setUpDirectory = async (projectEntry: ProjectEntry) => {
  const {
    io: { getOrCreateFile, writeFile, readFile },
  } = getInjectedContent()
  const configFile = await getOrCreateFile(projectEntry, "flow.config.json")
  const rawContent = await readFile(configFile)

  const json =
    rawContent === ""
      ? null
      : safelyParseJson<JsonObject, null>(rawContent, {
          orElse: null,
        })

  // まだ設定ファイルがない場合は書き込み
  if (json == null) {
    await writeFile(configFile, JSON.stringify(EMPTY_CONFIG, null, 2))
  }
}
