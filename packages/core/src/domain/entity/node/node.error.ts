export class CannotChangeActionTypeError extends Error {
  constructor() {
    super("Cannot change action type")
  }
  readonly _tag = "CannotChangeActionTypeError"
  readonly _category = "entity"
}
