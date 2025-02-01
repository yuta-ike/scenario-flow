export class JsonParseError extends Error {
  constructor(e: unknown) {
    super("Json parse error")
    this.cause = e
  }

  readonly _tag = "JsonParseError"
  readonly _category = "lib"
}
