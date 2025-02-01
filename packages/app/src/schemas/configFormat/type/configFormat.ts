export type ConfigFormat = {
  version: "0.0.1"
  resources: {
    openapi?: {
      local_file?: Record<string, string> // ローカルパスの配列
    }
  }
  engine: "runn" | "scenarigo" | "stepcity" | ""
}
