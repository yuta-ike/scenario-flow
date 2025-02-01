import { describe, expect, test } from "vitest"
import { extractPathParameter } from "./extractPathParameter"

describe("extractPathParameter", () => {
  test("単一のパスパラメータを取得できる", () => {
    expect(extractPathParameter("/users/{userId}")).toEqual(["userId"])
  })

  test("複数のパスパラメータを取得できる", () => {
    expect(extractPathParameter("/users/{userId}/posts/{postId}")).toEqual([
      "userId",
      "postId",
    ])
  })

  test("変数埋め込みは取得しない", () => {
    expect(
      extractPathParameter("/users/{{userId}}/posts/{postId}/comments"),
    ).toEqual(["postId"])
  })
})
