import { describe, expect, test } from "vitest"

import { type Expression } from "./expression"
import { resolveExpression } from "./expression.util"

describe("resolveExpression", () => {
  test("変数を展開できる", () => {
    const expression = "/user/{name}" as Expression
    const variables = {
      name: "alice",
    }
    const result = resolveExpression(expression, variables)
    expect(result).toBe("/user/alice")
  })

  test("複数の変数を展開できる", () => {
    const expression = "/org/{orgId}/user/{name}" as Expression
    const variables = {
      orgId: "123",
      name: "alice",
    }
    const result = resolveExpression(expression, variables)
    expect(result).toBe("/org/123/user/alice")
  })

  test("変数がない場合はそのまま返す", () => {
    const expression = "/user/{name}" as Expression
    const variables = {}
    const result = resolveExpression(expression, variables)
    expect(result).toBe("/user/{name}")
  })
})
