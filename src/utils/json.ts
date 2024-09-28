type JsonPrimitive = string | number | boolean | null

type JsonArray = JsonPrimitive[] | JsonObject[]

type JsonObject = {
  [key: string]: JsonPrimitive | JsonObject | JsonArray
}

export const emptyJson: Json = {}

export type Json = JsonPrimitive | JsonArray | JsonObject

export const safelyParseJson = <OrElse>(
  str: string,
  option?: {
    orElse: OrElse
  },
): Json | OrElse => {
  try {
    return JSON.parse(str) as Json
  } catch (err: unknown) {
    if (option != null && "orElse" in option) {
      return option.orElse
    } else {
      throw err
    }
  }
}

export const strigifyJson = (json: Json) => JSON.stringify(json, null, 2)

export const isValidJson = (str: string): boolean => {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}
