export class YamlParseError extends Error {
  constructor(e: unknown) {
    super("Yaml parse error")
    this.cause = e
  }

  readonly _tag = "YamlParseError"
  readonly _category = "lib"
}
