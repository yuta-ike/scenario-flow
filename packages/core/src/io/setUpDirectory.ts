import { EMPTY_CONFIG } from "./config/emptyConfig"

import type { ConfigFormat } from "@/schemas/configFormat/type/configFormat"
import type { DirHandle } from "@/injector/parts/io"
import type { InjectedContent } from "@/injector/injector"

import { safelyParseJson } from "@/utils/json"
import { validateConfigFormat } from "@/schemas/configFormat"

export const setUpDirectory = async (
  projectEntry: DirHandle,
  injected: InjectedContent,
): Promise<ConfigFormat> => {
  const {
    io: { getOrCreateFile, writeFile, readFile },
  } = injected
  const configFile = await getOrCreateFile(projectEntry, "flow.config.json")
  console.log("[SetUpDirectory] configFile", configFile)
  const rawContent = await readFile(configFile)
  // const rawContent =
  //   typeof _rawContent === "string" ? _rawContent : decode(_rawContent)
  console.log("[SetUpDirectory] configFile rawContent", rawContent)
  console.log(typeof rawContent)
  console.log(rawContent.length)

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
