import { describe, expect, test } from "vitest"

import { getRelativePath } from "./getRelativePath"

describe("getRelativePath", () => {
  test.each([{ path: "a/b/c", basePath: "a/b", expected: "c" }])(
    "path = $path, basePath = $basePath",
    ({ path, basePath, expected }) => {
      expect(getRelativePath(path, basePath)).toBe(expected)
    },
  )
})
