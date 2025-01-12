import { describe, expect, test } from "vitest"

import {
  type Expression,
  getPlaceholderExpressions,
  parseExpressionInPath,
  resolveExpression,
} from "./expression"

describe("getPlaceholderVariables", () => {
  test("変数を取得できる", () => {
    const value = "/user/{{name}}" as string
    const result = getPlaceholderExpressions(value)
    expect(result).toEqual(["name"])
  })

  test("複数の変数を取得できる", () => {
    const value = "/org/{{orgId}}/user/{{name}}" as string
    const result = getPlaceholderExpressions(value)
    expect(result).toEqual(["orgId", "name"])
  })

  test("変数がない場合は空配列を返す", () => {
    const value = "/user/name" as string
    const result = getPlaceholderExpressions(value)
    expect(result).toEqual([])
  })
})

describe("replacePlaceholderExpressionsWithVariable", () => {
  test.each([
    {
      label: "変数がない場合",
      input: "/user",
      expected: ["/user", []] as const,
    },
    {
      label: "変数が一つ含まれる場合",
      input: "/user/{{name}}",
      expected: [
        "/user/{{ name }}",
        [{ name: "name", value: "name" }],
      ] as const,
    },
    {
      label: "変数が複数含まれる場合",
      input: "/org/{{orgId}}/user/{{name}}",
      expected: [
        "/org/{{ orgId }}/user/{{ name }}",
        [
          { name: "orgId", value: "orgId" },
          { name: "name", value: "name" },
        ] as const,
      ],
    },
    {
      label: "スペースが含まれる場合",
      input: "/org/{{  orgId }}/user/{{ name }}",
      expected: [
        "/org/{{ orgId }}/user/{{ name }}",
        [
          { name: "orgId", value: "orgId" },
          { name: "name", value: "name" },
        ],
      ] as const,
    },
  ])("単純な変数を置換できる ($label)", ({ input, expected }) => {
    const result = parseExpressionInPath(input)
    expect(result).toEqual(expected)
  })

  test.each([
    {
      label: "式が含まれる場合",
      input: "/user/{{current.hoge.name}}",
      expected: [
        "/user/{{ name }}",
        [{ name: "name", value: "current.hoge.name" }],
      ] as const,
    },
    {
      label: "空白を含む式が含まれる場合",
      input: "/user/{{ current.hoge.name  }}",
      expected: [
        "/user/{{ name }}",
        [{ name: "name", value: "current.hoge.name" }],
      ] as const,
    },
    {
      label: "インデックスアクセスで終わる式が含まれる場合",
      input: "/user/{{ current.hoge.names[0]  }}",
      expected: [
        "/user/{{ names0 }}",
        [{ name: "names0", value: "current.hoge.names[0]" }],
      ] as const,
    },
    {
      label: "インデックスアクセスで終わる式で空白が含まれる場合",
      input: "/user/{{ current.hoge.names[ 0  ]  }}",
      expected: [
        "/user/{{ names0 }}",
        [{ name: "names0", value: "current.hoge.names[ 0  ]" }],
      ] as const,
    },
    {
      label: "複雑なインデックスアクセスで終わる式の場合",
      input: "/user/{{ current.hoge.names[current.hoge.index]  }}",
      expected: [
        "/user/{{ var1 }}",
        [{ name: "var1", value: "current.hoge.names[current.hoge.index]" }],
      ] as const,
    },
    {
      label: "サンプル",
      input: "/user/{{ steps.createUser.res.body.id }}",
      expected: [
        "/user/{{ id }}",
        [{ name: "id", value: "steps.createUser.res.body.id" }],
      ] as const,
    },
  ])("複雑な式を置換できる ($label $input)", ({ input, expected }) => {
    const result = parseExpressionInPath(input)
    expect(result).toEqual(expected)
  })
})

describe("resolveExpression", () => {
  test("変数を展開できる", () => {
    const expression = "/user/{name}" as Expression
    const variables = {
      name: "alice",
    }
    const result = resolveExpression(expression, variables)
    expect(result).toEqual("/user/alice")
  })

  test("複数の変数を展開できる", () => {
    const expression = "/org/{orgId}/user/{name}" as Expression
    const variables = {
      orgId: "123",
      name: "alice",
    }
    const result = resolveExpression(expression, variables)
    expect(result).toEqual("/org/123/user/alice")
  })

  test("変数がない場合はそのまま返す", () => {
    const expression = "/user/{name}" as Expression
    const variables = {}
    const result = resolveExpression(expression, variables)
    expect(result).toEqual("/user/{name}")
  })
})
