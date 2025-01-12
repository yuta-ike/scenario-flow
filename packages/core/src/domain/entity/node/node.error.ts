export class CannotChangeActionTypeError extends Error {
  constructor() {
    super("Cannot change action type")
  }
  readonly _tag = "CannotChangeActionTypeError"
  readonly _category = "entity"
}

export class CannnotChangeActionSourceError extends Error {
  constructor() {
    super("Cannot change action source")
  }
  readonly _tag = "CannnotChangeActionSourceError"
  readonly _category = "entity"
}
