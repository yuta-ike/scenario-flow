import { fcache } from "@scenario-flow/util"
import { parseExpression, Token } from "./parseExpression"

const embedRegExp = /\{\{(?<variable>[^({|})]*(?:\s+[^({|})\s]+)*)*\}\}/g

const cache = new Map<string, ParsedFrag[]>()

export type ParsedFrag =
  | {
      type: "string"
      value: string
      start: number
      end: number
    }
  | {
      type: "variable"
      value: string
      parsed: Token[]
      start: number
      end: number
    }

export const parseEmbeddedTemplate = fcache((input: string): ParsedFrag[] => {
  const result: ParsedFrag[] = []
  let lastIndex = 0

  input.replace(embedRegExp, (match, variable, offset) => {
    if (lastIndex < offset) {
      result.push({
        type: "string",
        value: input.slice(lastIndex, offset),
        start: lastIndex,
        end: lastIndex + offset,
      })
    }
    result.push({
      type: "variable",
      value: variable ?? "",
      parsed: parseExpression(variable ?? ""),
      start: offset,
      end: offset + match.length,
    })
    lastIndex = offset + match.length
    return match
  })

  if (lastIndex < input.length) {
    result.push({
      type: "string",
      value: input.slice(lastIndex),
      start: lastIndex,
      end: input.length,
    })
  }

  cache.set(input, result)

  return result
})
