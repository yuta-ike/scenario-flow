import type { KVItem } from "@scenario-flow/util"

export const getPathParams = (templatePath: string, resolvedPath: string) => {
  const pathParams: KVItem[] = []

  const templatePathFrags = templatePath.split("/")
  const resolvedPathFrags = resolvedPath.split("/")
  for (let i = 0; i < templatePathFrags.length; i++) {
    const variableName = /^\{\{(?<variable>[^({|})]+)\}\}$/.exec(
      templatePathFrags[i]!,
    )?.groups?.["variable"]
    if (variableName != null) {
      pathParams.push({
        id: variableName,
        key: variableName,
        value: resolvedPathFrags[i] ?? "",
      })
    }
  }
  return pathParams
}

export const convertPathPlaceholder = (path: string) => {
  const pathFrags = path.split("/")
  const pathParams = new Map<string, string>()
  for (const frag of pathFrags) {
    const match = /^\{\{\s*(?<key>[^({|})]+)\s*\}\}$/.exec(frag)
    const keyword = match?.groups!["key"]?.trim()
    if (keyword != null) {
      pathParams.set(keyword, `{{ ${keyword} }}`)
    }
  }

  return pathParams
}
