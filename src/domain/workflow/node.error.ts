export class CannotRemoveRootNodeError extends Error {
  readonly _tag = "ValidationError"
  constructor() {
    super("ルートノードは削除できません")
  }
}
