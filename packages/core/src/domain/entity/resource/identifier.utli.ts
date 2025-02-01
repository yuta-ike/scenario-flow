import { HttpMethod } from "@scenario-flow/util"
import type { MethodAndPath } from "./identifier"

export const toMethodAndPath = (method: HttpMethod, path: string) =>
  `${method} ${path}` as MethodAndPath
