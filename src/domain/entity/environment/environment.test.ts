import { describe, expect, test } from "vitest"

import { genLocalVariable } from "../variable/variable.factory"
import { toNodeId } from "../node/node.util"

import { dedupeShadowedBind, intersectionEnvironment } from "./environment"
import { localVariableToVariable } from "./variable.factory"

describe("intersectionEnvironment", () => {
  test("複数のenvironmentの直積を取得できる", () => {
    const res = intersectionEnvironment([
      [
        {
          variable: localVariableToVariable(
            genLocalVariable("1"),
            toNodeId("n1"),
          ),
        },
        {
          variable: localVariableToVariable(
            genLocalVariable("2"),
            toNodeId("n1"),
          ),
        },
        {
          variable: localVariableToVariable(
            genLocalVariable("3"),
            toNodeId("n1"),
          ),
        },
      ],
      [
        {
          variable: localVariableToVariable(
            genLocalVariable("1"),
            toNodeId("n2"),
          ),
        },
        {
          variable: localVariableToVariable(
            genLocalVariable("2"),
            toNodeId("n2"),
          ),
        },
        {
          variable: localVariableToVariable(
            genLocalVariable("5"),
            toNodeId("n2"),
          ),
        },
      ],
    ])
    expect(res).toEqual([
      {
        variable: localVariableToVariable(
          genLocalVariable("1"),
          toNodeId("n2"),
        ),
      },
      {
        variable: localVariableToVariable(
          genLocalVariable("2"),
          toNodeId("n2"),
        ),
      },
    ])
  })

  test("environmentが1つの場合はそのまま返す", () => {
    const res = intersectionEnvironment([
      [
        {
          variable: localVariableToVariable(
            genLocalVariable("1"),
            toNodeId("n1"),
          ),
        },
        {
          variable: localVariableToVariable(
            genLocalVariable("2"),
            toNodeId("n1"),
          ),
        },
        {
          variable: localVariableToVariable(
            genLocalVariable("3"),
            toNodeId("n1"),
          ),
        },
      ],
    ])
    expect(res).toEqual([
      {
        variable: localVariableToVariable(
          genLocalVariable("1"),
          toNodeId("n1"),
        ),
      },
      {
        variable: localVariableToVariable(
          genLocalVariable("2"),
          toNodeId("n1"),
        ),
      },
      {
        variable: localVariableToVariable(
          genLocalVariable("3"),
          toNodeId("n1"),
        ),
      },
    ])
  })

  test("共通の変数がない場合は空の配列を返す", () => {
    const res = intersectionEnvironment([
      [
        {
          variable: localVariableToVariable(
            genLocalVariable("1"),
            toNodeId("n1"),
          ),
        },
        {
          variable: localVariableToVariable(
            genLocalVariable("2"),
            toNodeId("n1"),
          ),
        },
        {
          variable: localVariableToVariable(
            genLocalVariable("3"),
            toNodeId("n1"),
          ),
        },
      ],
      [
        {
          variable: localVariableToVariable(
            genLocalVariable("4"),
            toNodeId("n2"),
          ),
        },
        {
          variable: localVariableToVariable(
            genLocalVariable("5"),
            toNodeId("n2"),
          ),
        },
        {
          variable: localVariableToVariable(
            genLocalVariable("6"),
            toNodeId("n2"),
          ),
        },
      ],
    ])
    expect(res).toEqual([])
  })
})

describe("dedupeShadowedBind", () => {
  test("同名の変数がある場合は1つにまとめ、後ろで指定されたものが残る", () => {
    const res = dedupeShadowedBind([
      {
        variable: localVariableToVariable(
          genLocalVariable("1"),
          toNodeId("n1"),
        ),
      },
      {
        variable: localVariableToVariable(
          genLocalVariable("2"),
          toNodeId("n1"),
        ),
      },
      {
        variable: localVariableToVariable(
          genLocalVariable("2"),
          toNodeId("n2"),
        ),
      },
    ])
    expect(res).toEqual([
      {
        variable: localVariableToVariable(
          genLocalVariable("1"),
          toNodeId("n1"),
        ),
      },
      {
        variable: localVariableToVariable(
          genLocalVariable("2"),
          toNodeId("n2"),
        ),
      },
    ])
  })
})
