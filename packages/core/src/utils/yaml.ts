import yaml from "js-yaml"

import type { Json } from "./json"

export const jsonToYaml = (json: Json): string => {
  return yaml.dump(json, { noRefs: true })
}
