import type { KVItem } from "@/ui/lib/kv"

export const extractPathParams = (
  templatePath: string,
  resolvedPath: string,
) => {
  const pathParams: KVItem[] = []

  const templatePathFrags = templatePath.split("/")
  const resolvedPathFrags = resolvedPath.split("/")
  for (let i = 0; i < templatePathFrags.length; i++) {
    const variableName = /^\{(?<variable>[^}]+)\}$/.exec(templatePathFrags[i]!)
      ?.groups?.["variable"]
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
