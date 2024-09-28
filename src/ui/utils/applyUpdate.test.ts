import { expect, test } from "vitest"

import { applyUpdate } from "./applyUpdate"

test("updateに値が渡された場合、その値を返す", () => {
  const update = "new value"
  const prevState = "old value"
  expect(applyUpdate(update, prevState)).toBe("new value")
})

test("updateに関数が渡された場合、その関数の返り値を返す", () => {
  const update = (prev: string) => prev + "new"
  const prevState = "old value"
  expect(applyUpdate(update, prevState)).toBe("old valuenew")
})
