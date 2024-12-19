import { EMPTY_CONFIG } from "./config/emptyConfig"

import type { ConfigFormat } from "@/schemas/configFormat/type/configFormat"
import type { DirHandle } from "@/injector/parts/io"
import type { InjectedContent } from "@/injector/injector"
import type { Project } from "@/ui/domain/project"

import { safelyParseJson } from "@/utils/json"
import { validateConfigFormat } from "@/schemas/configFormat"

export const setUpDirectory = async (
  dirHandle: DirHandle,
  injected: InjectedContent,
  project: Project,
): Promise<ConfigFormat> => {
  console.log(project)
  const {
    io: { getOrCreateFile, writeFile, readFile },
  } = injected
  const configFile = await getOrCreateFile(dirHandle, "flow.config.json", {
    cacheKey: project.id,
  })
  console.log("[SetUpDirectory] configFile", configFile)
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
    console.log("[SetUpDirectory] Create new config file", configFile)
    return EMPTY_CONFIG
  }

  if (!validateConfigFormat(json)) {
    throw new Error("Invalid config format")
  }

  return json
}
