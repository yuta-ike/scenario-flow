import { describe, expect, test } from "vitest"
import { parseExpression } from "./parseExpression"

describe("parseExpression", () => {
  test("正しくパースできる", () => {
    expect(parseExpression("1+2")).toEqual([
      { type: "number", value: "1" },
      { type: "operator", value: "+" },
      { type: "number", value: "2" },
    ])

    expect(parseExpression("1+2*3")).toEqual([
      { type: "number", value: "1" },
      { type: "operator", value: "+" },
      { type: "number", value: "2" },
      { type: "operator", value: "*" },
      { type: "number", value: "3" },
    ])

    expect(parseExpression("1+(2*3)<=4&&5<6**7")).toEqual([
      { type: "number", value: "1" },
      { type: "operator", value: "+" },
      { type: "(", value: "(" },
      { type: "number", value: "2" },
      { type: "operator", value: "*" },
      { type: "number", value: "3" },
      { type: ")", value: ")" },
      { type: "operator", value: "<=" },
      { type: "number", value: "4" },
      { type: "operator", value: "&&" },
      { type: "number", value: "5" },
      { type: "operator", value: "<" },
      { type: "number", value: "6" },
      { type: "operator", value: "**" },
      { type: "number", value: "7" },
    ])

    expect(parseExpression('\'aaa\'+"bbb"contains"ccc"')).toEqual([
      { type: "string", value: "aaa" },
      { type: "operator", value: "+" },
      { type: "string", value: "bbb" },
      { type: "operator", value: "contains" },
      { type: "string", value: "ccc" },
    ])

    expect(parseExpression("true and false or not true")).toEqual([
      { type: "boolean", value: "true" },
      { type: "whitespace", value: " " },
      { type: "operator", value: "and" },
      { type: "whitespace", value: " " },
      { type: "boolean", value: "false" },
      { type: "whitespace", value: " " },
      { type: "operator", value: "or" },
      { type: "whitespace", value: " " },
      { type: "operator", value: "not" },
      { type: "whitespace", value: " " },
      { type: "boolean", value: "true" },
    ])

    expect(parseExpression("0.123+4.567")).toEqual([
      { type: "number", value: "0.123" },
      { type: "operator", value: "+" },
      { type: "number", value: "4.567" },
    ])

    expect(parseExpression("(1+2)*3")).toEqual([
      { type: "(", value: "(" },
      { type: "number", value: "1" },
      { type: "operator", value: "+" },
      { type: "number", value: "2" },
      { type: ")", value: ")" },
      { type: "operator", value: "*" },
      { type: "number", value: "3" },
    ])

    expect(parseExpression("hello[2]+world[3+5]")).toEqual([
      { type: "variable", value: "hello" },
      { type: "[", value: "[" },
      { type: "number", value: "2" },
      { type: "]", value: "]" },
      { type: "operator", value: "+" },
      { type: "variable", value: "world" },
      { type: "[", value: "[" },
      { type: "number", value: "3" },
      { type: "operator", value: "+" },
      { type: "number", value: "5" },
      { type: "]", value: "]" },
    ])
  })
})
