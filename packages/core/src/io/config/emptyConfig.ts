import type { ConfigFormat } from "@/schemas/configFormat/type/configFormat"

export const EMPTY_CONFIG = {
  version: "0.0.1",
  resources: {},
  engine: "",
} satisfies ConfigFormat
