export type ConfigFormat = {
  version: "0.0.1"
  resources: {
    local_files?: Record<string, string>[] // ローカルパスの配列
  }
  engine: "runn" | "scenarigo" | "stepcity" | ""
}
