export type JsonPrimitive = string | number | boolean | null

export type JsonArray = JsonPrimitive[] | JsonObject[]

export type JsonObject = {
  [key: string]: JsonPrimitive | JsonObject | JsonArray
}

export const emptyJson: Json = {}

export type Json = JsonPrimitive | JsonArray | JsonObject

export const safelyParseJson = <Return = Json, OrElse = never>(
  str: string,
  option?: {
    orElse: OrElse
  },
): Return | OrElse => {
  try {
    return JSON.parse(str) as Return
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
