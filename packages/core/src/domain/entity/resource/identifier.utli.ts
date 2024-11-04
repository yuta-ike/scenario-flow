import type { MethodAndPath } from "./identifier"
import type { HttpMethod } from "@/utils/http"

export const toMethodAndPath = (method: HttpMethod, path: string) =>
  `${method} ${path}` as MethodAndPath
