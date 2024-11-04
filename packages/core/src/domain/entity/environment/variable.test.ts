import { describe, expect, test } from "vitest"

import { genLocalVariable } from "../variable/variable.factory"

import { getVariableSuggests } from "./variable.util"

import type { JSONSchema7 } from "json-schema"

const genVar = (
  name: `${"vars" | "steps"}.${string}`,
  schema: "any" | JSONSchema7 | undefined,
) =>
  genLocalVariable("id", {
    namespace: name.split(".")[0]! as "vars" | "steps",
    name: name.split(".")[1]!,
    schema,
  })

describe("getSpreadVariables", () => {
  test("anyを正しく処理できる", () => {
    const res = getVariableSuggests(genVar("vars.test", "any"))
    expect(res).toEqual([
      {
        name: "vars.test",
        type: "any",
        depth: 0,
      },
    ])
  })

  test("プリミティブ型を正しく処理できる", () => {
    const res = getVariableSuggests(
      genVar("vars.test", {
        type: "number",
      }),
    )
    expect(res).toEqual([
      {
        name: "vars.test",
        type: "number",
        depth: 0,
      },
    ])
  })

  test("配列を正しく処理できる", () => {
    const res = getVariableSuggests(
      genVar("vars.test", {
        type: "array",
        items: {
          type: "number",
        },
      }),
    )
    expect(res).toEqual([
      {
        name: "vars.test[$0]",
        type: "number",
        depth: 1,
      },
    ])
  })

  test("オブジェクトを正しく処理できる", () => {
    const res = getVariableSuggests(
      genVar("vars.test", {
        type: "object",
        properties: {
          num: {
            type: "number",
          },
          str: {
            type: "string",
          },
        },
      }),
    )
    expect(res).toEqual([
      {
        name: "vars.test.num",
        type: "number",
        depth: 0,
      },
      {
        name: "vars.test.str",
        type: "string",
        depth: 0,
      },
    ])
  })

  test("複雑なスキーマを正しく処理できる", () => {
    const res = getVariableSuggests(
      genVar("vars.test", {
        type: "object",
        properties: {
          num: {
            type: "number",
          },
          obj: {
            type: "object",
            properties: {
              arr: {
                type: "array",
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      inner1: {
                        type: "null",
                      },
                      inner2: {
                        type: "boolean",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    )
    expect(res).toEqual([
      {
        name: "vars.test.num",
        type: "number",
        depth: 0,
      },
      {
        name: "vars.test.obj.arr[$0][$1].inner1",
        type: "null",
        depth: 2,
      },
      {
        name: "vars.test.obj.arr[$0][$1].inner2",
        type: "boolean",
        depth: 2,
      },
    ])
  })
})
