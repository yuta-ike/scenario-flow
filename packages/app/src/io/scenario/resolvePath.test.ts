import { describe, expect, test } from "vitest"

import { resolvePath } from "./resolvePath"

describe("resolvePath", () => {
  test.each([
    { current: "a/b/c", rel: "d/e/f", expected: "a/b/c/d/e/f" },
    { current: "a/b/c", rel: "./d/e/f", expected: "a/b/c/d/e/f" },
    { current: "a/b/c", rel: "../d/e/f", expected: "a/b/d/e/f" },
    { current: "a/b/c", rel: "../../d/e/f", expected: "a/d/e/f" },
    { current: "a/b/c", rel: "../../../d/e/f", expected: "d/e/f" },
    { current: "a/b/c", rel: "../../../../d/e/f", expected: "d/e/f" },
    { current: "a/b/c", rel: "././d/e/f", expected: "a/b/c/d/e/f" },
  ])("rel = $rel", ({ current, rel, expected }) => {
    expect(resolvePath(current, rel)).toBe(expected)
  })

  test.each([
    { current: "", rel: "d/e/f", expected: "d/e/f" },
    { current: "/", rel: "d/e/f", expected: "d/e/f" },
  ])("current = $current", ({ current, rel, expected }) => {
    expect(resolvePath(current, rel)).toBe(expected)
  })
})
