import { EMPTY_CONFIG } from "./config/emptyConfig"

import type { ConfigFormat } from "@/schemas/configFormat/type/configFormat"

import { getInjectedContent, type ProjectEntry } from "@/main"
import { safelyParseJson } from "@/utils/json"
import { validateConfigFormat } from "@/schemas/configFormat"

export const setUpDirectory = async (
  projectEntry: ProjectEntry,
): Promise<ConfigFormat> => {
  const {
    io: { getOrCreateFile, writeFile, readFile },
  } = getInjectedContent()
  const configFile = await getOrCreateFile(projectEntry, "flow.config.json")
  const rawContent = await readFile(configFile)

  const json =
    rawContent === ""
      ? null
      : safelyParseJson<any, null>(rawContent, {
          orElse: null,
        })

  // まだ設定ファイルがない場合は書き込み
  if (json == null) {
    await writeFile(configFile, JSON.stringify(EMPTY_CONFIG, null, 2))
    return EMPTY_CONFIG
  }

  if (!validateConfigFormat(json)) {
    throw new Error("Invalid config format")
  }

  return json
}
