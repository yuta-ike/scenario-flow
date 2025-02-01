import { nonNull } from "@scenario-flow/util"

const pathParamRegExp = /(?<!{){(?<variable>[^{}]+)}(?!})/g

export const extractPathParameter = (path: string): string[] => {
  const res = path.matchAll(pathParamRegExp).toArray()
  return res.map((match) => match.groups?.["variable"]).filter(nonNull)
}
