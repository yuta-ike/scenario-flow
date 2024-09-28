import yaml from "js-yaml"

import type { Json } from "@/utils/json"

export const convertYamlToJson = (yamlText: string): Json => {
  const json = yaml.load(yamlText)
  return json as Json
}
