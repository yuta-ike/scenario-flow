import yaml from "js-yaml"

import { YamlParseError } from "./error"

import type { Json } from "@/utils/json"

import { error, success, type Result } from "@/utils/result"

export const parseYaml = <Return extends Json = Json>(
  yamlText: string,
): Result<Return> => {
  try {
    const json = yaml.load(yamlText)
    return success(json as Return)
  } catch (e: unknown) {
    return error(new YamlParseError(e))
  }
}
