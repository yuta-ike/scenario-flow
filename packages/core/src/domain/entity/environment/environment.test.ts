import { describe, expect, test } from "vitest"

import { genLocalVariable } from "../variable/variable.factory"
import { toNodeId } from "../node/node.util"

import { dedupeEnvironmentBinds, intersect } from "./environment"

describe("intersectionEnvironment", () => {
  test("複数のenvironmentの直積を取得できる", () => {
    const res = intersect([
      [
        {
          inherit: true,
          variable: genLocalVariable("1", { boundIn: toNodeId("n1") }),
        },
        {
          inherit: true,
          variable: genLocalVariable("2", { boundIn: toNodeId("n1") }),
        },
        {
          inherit: false,
          variable: genLocalVariable("3", { boundIn: toNodeId("n1") }),
        },
      ],
      [
        {
          inherit: true,
          variable: genLocalVariable("1", { boundIn: toNodeId("n2") }),
        },
        {
          inherit: true,
          variable: genLocalVariable("2", { boundIn: toNodeId("n2") }),
        },
        {
          inherit: false,
          variable: genLocalVariable("5", { boundIn: toNodeId("n2") }),
        },
      ],
    ])
    expect(res).toEqual([
      {
        inherit: true,
        variable: genLocalVariable("1", { boundIn: toNodeId("n2") }),
      },
      {
        inherit: true,
        variable: genLocalVariable("2", { boundIn: toNodeId("n2") }),
      },
    ])
  })

  test("environmentが1つの場合はそのまま返す", () => {
    const res = intersect([
      [
        {
          inherit: true,
          variable: genLocalVariable("1", { boundIn: toNodeId("n1") }),
        },
        {
          inherit: true,
          variable: genLocalVariable("2", { boundIn: toNodeId("n1") }),
        },
        {
          inherit: false,
          variable: genLocalVariable("3", { boundIn: toNodeId("n1") }),
        },
      ],
    ])
    expect(res).toEqual([
      {
        inherit: true,
        variable: genLocalVariable("1", { boundIn: toNodeId("n1") }),
      },
      {
        inherit: true,
        variable: genLocalVariable("2", { boundIn: toNodeId("n1") }),
      },
      {
        inherit: false,
        variable: genLocalVariable("3", { boundIn: toNodeId("n1") }),
      },
    ])
  })

  test("共通の変数がない場合は空の配列を返す", () => {
    const res = intersect([
      [
        {
          inherit: true,
          variable: genLocalVariable("1", { boundIn: toNodeId("n1") }),
        },
        {
          inherit: true,
          variable: genLocalVariable("2", { boundIn: toNodeId("n1") }),
        },
        {
          inherit: false,
          variable: genLocalVariable("3", { boundIn: toNodeId("n1") }),
        },
      ],
      [
        {
          inherit: true,
          variable: genLocalVariable("4", { boundIn: toNodeId("n2") }),
        },
        {
          inherit: true,
          variable: genLocalVariable("5", { boundIn: toNodeId("n2") }),
        },
        {
          inherit: false,
          variable: genLocalVariable("6", { boundIn: toNodeId("n2") }),
        },
      ],
    ])
    expect(res).toEqual([])
  })
})

describe("dedupeShadowedBind", () => {
  test("同名の変数がある場合は1つにまとめ、後ろで指定されたものが残る", () => {
    const res = dedupeEnvironmentBinds([
      {
        inherit: true,
        variable: genLocalVariable("1", { boundIn: toNodeId("n1") }),
      },
      {
        inherit: true,
        variable: genLocalVariable("2", { boundIn: toNodeId("n1") }),
      },
      {
        inherit: false,
        variable: genLocalVariable("2", { boundIn: toNodeId("n2") }),
      },
    ])
    expect(res).toEqual([
      {
        inherit: true,
        variable: genLocalVariable("1", { boundIn: toNodeId("n1") }),
      },
      {
        inherit: false,
        variable: genLocalVariable("2", { boundIn: toNodeId("n2") }),
      },
    ])
  })
})
